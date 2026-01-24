import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getShowcaseEvents,
    deleteShowcaseEvent,
    ShowcaseEvent
} from '../../api/showcase-event.api';
import { getMediaUrl } from '../../services/products.service';

const ManagementShowcaseEvents: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<ShowcaseEvent[]>([]);
    const [loading, setLoading] = useState(true);

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
        if (!confirm('Bạn có chắc muốn xóa sự kiện này?')) return;
        try {
            await deleteShowcaseEvent(id);
            loadData();
        } catch (error) {
            alert('Không thể xóa sự kiện');
        }
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
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Quản lý Sự kiện
                    </h1>
                    <p className="text-slate-500 mt-2">Quản lý các sự kiện quảng bá hiển thị trên trang chủ</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/master-data/showcase-events/add')}
                        className="flex items-center gap-2 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#13ec49]/20 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>Tạo sự kiện mới</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#13ec49]"></div>
                        <p className="mt-4 text-slate-600 font-medium">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Sự kiện</th>
                                    <th className="px-6 py-4">Ngày diễn ra</th>
                                    <th className="px-6 py-4">Địa điểm</th>
                                    <th className="px-6 py-4">Trạng thái</th>
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
                                        <tr key={event.id} className="group hover:bg-slate-50 transition-colors">
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
                                            <td className="px-6 py-4 text-slate-600 italic">
                                                {formatDate(event.event_date)}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{event.location || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${event.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                                                    event.status === 'ENDED' ? 'bg-slate-100 text-slate-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {event.status === 'PUBLISHED' ? 'Công khai' :
                                                        event.status === 'ENDED' ? 'Kết thúc' : 'Nháp'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => navigate(`/master-data/showcase-events/edit/${event.id}`)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all">
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDeleteEvent(event.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all">
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
        </div>
    );
};

export default ManagementShowcaseEvents;
