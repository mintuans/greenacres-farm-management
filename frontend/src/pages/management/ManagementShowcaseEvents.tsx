import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getShowcaseEvents,
    deleteShowcaseEvent,
    ShowcaseEvent
} from '../../api/showcase-event.api';
import { getMediaUrl } from '../../services/products.service';
import { ActionToolbar, ConfirmDeleteModal, ImportDataModal } from '../../components';

const ManagementShowcaseEvents: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<ShowcaseEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<ShowcaseEvent | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ShowcaseEvent | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getShowcaseEvents();
            setEvents(data);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        try {
            setIsDeleting(true);
            await deleteShowcaseEvent(id);
            setDeleteTarget(null);
            setSelectedEvent(null);
            loadData();
        } catch (error) {
            console.error('Error deleting event:', error);
            console.error('Không thể xóa sự kiện');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleImport = async (file: File) => {
        console.log('Importing events from:', file.name);
        return new Promise<void>((resolve) => setTimeout(resolve, 1500));
    };

    const handleExport = () => {
        console.log('Exporting events...');
        console.log('Đang trích xuất danh sách sự kiện ra file Excel...');
    };

    const handleDownloadTemplate = () => {
        console.log('Downloading event template...');
        console.log('Đang tải tệp mẫu sự kiện...');
    };


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-3 md:p-4 space-y-4 w-full bg-slate-50/50 min-h-screen">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                    Quản lý Sự kiện
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Quản lý các sự kiện quảng bá hiển thị trên trang chủ Showcase</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
                <div className="p-3 md:p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-end">
                    <ActionToolbar
                        onAdd={() => navigate('/master-data/showcase-events/add')}
                        addLabel="Tạo sự kiện"
                        onEdit={() => selectedEvent && navigate(`/master-data/showcase-events/edit/${selectedEvent.id}`)}
                        editDisabled={!selectedEvent}
                        onDelete={() => selectedEvent && setDeleteTarget(selectedEvent)}
                        deleteDisabled={!selectedEvent}
                        onRefresh={loadData}
                        isRefreshing={loading}
                        onImport={() => setShowImportModal(true)}
                        onExport={handleExport}
                        onDownloadTemplate={handleDownloadTemplate}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-[#13ec49]">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#13ec49]"></div>
                        <p className="mt-4 text-slate-600 font-medium">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-200 whitespace-nowrap">
                                <tr>
                                    <th className="px-6 py-4 min-w-[250px]">Sự kiện</th>
                                    <th className="px-6 py-4 min-w-[120px]">Gallery</th>
                                    <th className="px-6 py-4 min-w-[160px]">Ngày diễn ra</th>
                                    <th className="px-6 py-4 min-w-[180px]">Địa điểm</th>
                                    <th className="px-6 py-4 min-w-[130px]">Trạng thái</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {events.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Chưa có sự kiện nào</td>
                                    </tr>
                                ) : (
                                    events.map((event) => (
                                        <tr
                                            key={event.id}
                                            onClick={() => setSelectedEvent(prev => prev?.id === event.id ? null : event)}
                                            className={`group transition-all cursor-pointer ${selectedEvent?.id === event.id ? 'bg-[#13ec49]/5 ring-1 ring-inset ring-[#13ec49]/30' : 'hover:bg-slate-50'}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    {event.banner_id ? (
                                                        <img src={getMediaUrl(event.banner_id)} alt="" className="size-12 rounded-lg object-cover bg-slate-100" />
                                                    ) : (
                                                        <div className="size-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                            <span className="material-symbols-outlined">event</span>
                                                        </div>
                                                    )}
                                                    <span className="font-bold text-slate-900">{event.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex -space-x-2">
                                                    {event.gallery_ids && event.gallery_ids.length > 0 ? (
                                                        <>
                                                            {event.gallery_ids.slice(0, 3).map((imgId, idx) => (
                                                                <img key={idx} src={getMediaUrl(imgId)} className="size-8 rounded-full border-2 border-white object-cover" alt="" />
                                                            ))}
                                                            {event.gallery_ids.length > 3 && (
                                                                <div className="size-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                                    +{event.gallery_ids.length - 3}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-300 italic text-xs">Trống</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 italic">
                                                {formatDate(event.event_date)}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{event.location || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${event.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                                                    event.status === 'ENDED' ? 'bg-slate-100 text-slate-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {event.status === 'PUBLISHED' ? 'Công khai' :
                                                        event.status === 'ENDED' ? 'Kết thúc' : 'Nháp'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/master-data/showcase-events/edit/${event.id}`); }}
                                                        className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(event); }}
                                                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <ConfirmDeleteModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && handleDeleteEvent(deleteTarget.id)}
                isDeleting={isDeleting}
                itemName={deleteTarget?.title}
            />
            <ImportDataModal
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImport}
                entityName="sự kiện"
                columnGuide={['Tiêu đề', 'Mô tả', 'Ngày diễn ra', 'Địa điểm', 'Banner ID', 'Gallery IDs (cách nhau bởi dấu phẩy)', 'Trạng thái (DRAFT/PUBLISHED/ENDED)']}
                onDownloadTemplate={handleDownloadTemplate}
            />
        </div>
    );
};

export default ManagementShowcaseEvents;
