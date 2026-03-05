import React, { useState, useEffect } from 'react';
import { WarehouseType, getWarehouseTypes, createWarehouseType, updateWarehouseType, deleteWarehouseType } from '../api/warehouse-type.api';
import { ActionToolbar, ConfirmDeleteModal, ImportDataModal } from '../components';

const WarehouseTypes: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [warehouseTypes, setWarehouseTypes] = useState<WarehouseType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState<WarehouseType | null>(null);
    const [formData, setFormData] = useState<Omit<WarehouseType, 'id'>>({
        warehouse_code: '',
        warehouse_name: '',
        description: ''
    });
    const [selectedType, setSelectedType] = useState<WarehouseType | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<WarehouseType | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getWarehouseTypes();
            setWarehouseTypes(data || []);
        } catch (error) {
            console.error('Error loading warehouse types:', error);
            // alert('Không thể tải danh sách phân loại kho');
            // For demo/dev if API not ready
            setWarehouseTypes([
                { id: '1', warehouse_code: 'KHO-GIA-DUNG', warehouse_name: 'Kho Gia dụng', description: 'Lưu trữ đồ dùng gia đình' },
                { id: '2', warehouse_code: 'KHO-DIEN-TU', warehouse_name: 'Kho Điện tử', description: 'Lưu trữ thiết bị điện tử, máy móc' },
                { id: '3', warehouse_code: 'KHO-HOA-KIENG', warehouse_name: 'Kho Hoa kiểng', description: 'Khu vực trưng bày và chăm sóc hoa' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingType) {
                await updateWarehouseType(editingType.id, formData);
            } else {
                await createWarehouseType(formData);
            }
            setShowModal(false);
            resetForm();
            loadData();
        } catch (error: any) {
            console.error('Error saving warehouse type:', error);
            alert(error.response?.data?.message || 'Không thể lưu phân loại kho');
        }
    };

    const handleEdit = (type: WarehouseType) => {
        setEditingType(type);
        setFormData({
            warehouse_code: type.warehouse_code,
            warehouse_name: type.warehouse_name,
            description: type.description
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(true);
            await deleteWarehouseType(id);
            setDeleteTarget(null);
            setSelectedType(null);
            loadData();
        } catch (error: any) {
            console.error('Error deleting warehouse type:', error);
            alert(error.response?.data?.message || 'Không thể xóa phân loại kho');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleImport = async (file: File) => {
        console.log('Importing warehouse types from:', file.name);
        return new Promise<void>((resolve) => setTimeout(resolve, 1500));
    };

    const handleExport = () => {
        console.log('Exporting warehouse types...');
        alert('Đang trích xuất danh sách phân loại kho ra file Excel...');
    };

    const handleDownloadTemplate = () => {
        console.log('Downloading warehouse type template...');
        alert('Đang tải tệp mẫu phân loại kho...');
    };

    const resetForm = () => {
        setFormData({
            warehouse_code: '',
            warehouse_name: '',
            description: ''
        });
        setEditingType(null);
    };

    const filteredTypes = (warehouseTypes || []).filter(type =>
        type.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.warehouse_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3 md:p-4 space-y-4 w-full bg-slate-50/50 min-h-screen">
            <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                    Phân loại Nhà kho
                </h1>
                <p className="text-slate-500 text-sm mt-1">Quản lý các loại kho vật lý trong trang trại</p>
            </div>

            {/* Stats Cards - 3 cards per row on Mobile */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
                {[
                    { label: 'Tổng loại kho', value: warehouseTypes.length, icon: 'inventory', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Đang dùng', value: warehouseTypes.length, icon: 'check_circle', color: 'text-[#13ec49]', bg: 'bg-[#13ec49]/10' },
                    { label: 'Cơ sở', value: 'Chính', icon: 'location_on', color: 'text-orange-600', bg: 'bg-orange-50' }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 text-center md:text-left">
                        <div className={`${s.bg} ${s.color} p-1.5 md:p-3 rounded-lg md:rounded-xl shrink-0`}>
                            <span className="material-symbols-outlined text-base md:text-2xl">{s.icon}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[8px] md:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">{s.label}</p>
                            <h3 className="text-sm md:text-xl font-black text-slate-900 truncate">{s.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-[#13ec49]">
                <div className="p-3 md:p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="relative w-full sm:max-w-xs">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none"
                            placeholder="Tìm kiếm loại kho..."
                        />
                    </div>
                    <ActionToolbar
                        onAdd={() => { resetForm(); setShowModal(true); }}
                        addLabel="Thêm loại kho"
                        onEdit={() => selectedType && handleEdit(selectedType)}
                        editDisabled={!selectedType}
                        onDelete={() => selectedType && setDeleteTarget(selectedType)}
                        deleteDisabled={!selectedType}
                        onRefresh={loadData}
                        isRefreshing={loading}
                        onImport={() => setShowImportModal(true)}
                        onExport={handleExport}
                        onDownloadTemplate={handleDownloadTemplate}
                    />
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#13ec49] border-t-transparent"></div>
                        <p className="mt-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                    <th className="px-8 py-5">Mã loại kho</th>
                                    <th className="px-8 py-5">Tên hiển thị</th>
                                    <th className="px-8 py-5">Mô tả chi tiết</th>
                                    <th className="px-8 py-5 text-right font-black">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm font-medium">
                                {filteredTypes.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-slate-300 italic font-bold">
                                            {searchTerm ? 'Không tìm thấy loại kho nào khớp với tìm kiếm' : 'Chưa có phân loại kho nào được tạo'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTypes.map((type) => (
                                        <tr
                                            key={type.id}
                                            onClick={() => setSelectedType(prev => prev?.id === type.id ? null : type)}
                                            className={`group transition-all cursor-pointer ${selectedType?.id === type.id ? 'bg-[#13ec49]/5 ring-1 ring-inset ring-[#13ec49]/20' : 'hover:bg-slate-50'}`}
                                        >
                                            <td className="px-8 py-5">
                                                <span className="font-mono text-[11px] font-black bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 uppercase tracking-wider">
                                                    {type.warehouse_code}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="font-extrabold text-slate-900 group-hover:text-[#13ec49] transition-colors">{type.warehouse_name}</div>
                                            </td>
                                            <td className="px-8 py-5 text-slate-500 max-w-xs truncate">
                                                {type.description || <span className="text-slate-300 italic">Không có mô tả</span>}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEdit(type); }}
                                                        className="size-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(type); }}
                                                        className="size-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                        title="Xóa"
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] p-8 md:p-10 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {editingType ? 'Cập nhật loại kho' : 'Thêm loại kho mới'}
                                </h2>
                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">Cung cấp thông tin chi tiết nhà kho</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="size-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1 select-none">Mã định danh *</label>
                                <input
                                    type="text"
                                    required
                                    disabled={!!editingType}
                                    value={formData.warehouse_code}
                                    onChange={(e) => setFormData({ ...formData, warehouse_code: e.target.value.toUpperCase() })}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#13ec49] focus:bg-white focus:ring-4 focus:ring-[#13ec49]/10 outline-none font-bold text-slate-900 transition-all disabled:opacity-50"
                                    placeholder="VD: KHO-TRAI-CAY"
                                />
                                <p className="text-[10px] text-slate-400 mt-2 ml-1 italic font-medium">Mã này dùng để nhận diện kho trong hệ thống và không thể thay đổi sau khi tạo.</p>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1 select-none">Tên nhà kho *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.warehouse_name}
                                    onChange={(e) => setFormData({ ...formData, warehouse_name: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#13ec49] focus:bg-white focus:ring-4 focus:ring-[#13ec49]/10 outline-none font-bold text-slate-900 transition-all"
                                    placeholder="Nhập tên hiển thị của kho"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1 select-none">Mô tả thêm</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#13ec49] focus:bg-white focus:ring-4 focus:ring-[#13ec49]/10 outline-none font-bold text-slate-900 transition-all min-h-[120px] resize-none"
                                    placeholder="Ghi chú về vị trí, mục đích sử dụng..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 py-5 rounded-[24px] font-black uppercase tracking-widest text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-5 rounded-[24px] bg-[#13ec49] text-black font-black uppercase tracking-widest text-sm transition-all shadow-2xl shadow-[#13ec49]/20 hover:bg-[#13ec49]/90 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">save</span>
                                    {editingType ? 'Cập nhật ngay' : 'Xác nhận tạo kho'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmDeleteModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
                isDeleting={isDeleting}
                itemName={deleteTarget?.warehouse_name}
            />
            <ImportDataModal
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImport}
                entityName="loại kho"
                columnGuide={['Mã loại kho', 'Tên loại kho', 'Mô tả chi tiết']}
                onDownloadTemplate={handleDownloadTemplate}
            />
        </div>
    );
};

export default WarehouseTypes;
