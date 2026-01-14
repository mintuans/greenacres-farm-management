import React, { useState, useEffect } from 'react';
import { getWarehouseItems, createWarehouseItem, updateWarehouseItem, deleteWarehouseItem, WarehouseItem, getNextWarehouseCode } from '../api/warehouse.api';
import { getWarehouseTypes, WarehouseType } from '../api/warehouse-type.api';
import { getMediaFiles, MediaFile } from '../services/media.service';
import { getMediaUrl } from '../services/products.service';

const WarehouseManagement: React.FC = () => {
    const [warehouseTypes, setWarehouseTypes] = useState<WarehouseType[]>([]);
    const [selectedTypeId, setSelectedTypeId] = useState<string>('ALL');
    const [items, setItems] = useState<WarehouseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<WarehouseItem | null>(null);
    const units = ['Cái', 'Bộ', 'Chiếc', 'Hộp', 'Gói', 'Kg', 'Mét'];

    // Media Picker States
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [loadingMedia, setLoadingMedia] = useState(false);

    const [formData, setFormData] = useState({
        warehouse_type_id: '',
        item_code: '',
        sku: '',
        item_name: '',
        quantity: 0,
        unit: '',
        price: 0,
        location: '',
        thumbnail_id: '',
        note: ''
    });

    useEffect(() => {
        loadMetadata();
    }, []);

    useEffect(() => {
        loadItems();
    }, [selectedTypeId, searchTerm]);

    const loadMetadata = async () => {
        try {
            const types = await getWarehouseTypes();
            setWarehouseTypes(types || []);
            if (types && types.length > 0) {
                // Keep selectedTypeId as 'ALL' or set to first type if preferred
            }
        } catch (error) {
            console.error('Error loading warehouse types:', error);
        }
    };

    const loadItems = async () => {
        try {
            setLoading(true);
            const typeId = selectedTypeId === 'ALL' ? undefined : selectedTypeId;
            const data = await getWarehouseItems(typeId, searchTerm);
            setItems(data || []);
        } catch (error) {
            console.error('Error loading warehouse items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = async (item?: WarehouseItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                warehouse_type_id: item.warehouse_type_id,
                item_code: item.item_code,
                sku: item.sku || '',
                item_name: item.item_name,
                quantity: Number(item.quantity),
                unit: item.unit || '',
                price: Number(item.price),
                location: item.location || '',
                thumbnail_id: item.thumbnail_id || '',
                note: item.note || ''
            });
        } else {
            setEditingItem(null);
            const initialTypeId = selectedTypeId === 'ALL' ? (warehouseTypes[0]?.id || '') : selectedTypeId;
            let nextCode = '';
            if (initialTypeId) {
                try {
                    nextCode = await getNextWarehouseCode(initialTypeId);
                } catch (e) { }
            }

            setFormData({
                warehouse_type_id: initialTypeId,
                item_code: nextCode,
                sku: '',
                item_name: '',
                quantity: 1,
                unit: units[0],
                price: 0,
                location: '',
                thumbnail_id: '',
                note: ''
            });
        }
        setShowModal(true);
    };

    const handleTypeChangeInForm = async (typeId: string) => {
        const nextCode = await getNextWarehouseCode(typeId);
        setFormData(prev => ({ ...prev, warehouse_type_id: typeId, item_code: nextCode }));
    };

    const handleOpenMediaPicker = async () => {
        setShowMediaPicker(true);
        setLoadingMedia(true);
        try {
            const response = await getMediaFiles();
            setMediaFiles(response.data);
        } catch (error) {
            console.error('Error loading media:', error);
        } finally {
            setLoadingMedia(false);
        }
    };

    const handleSelectMedia = (mediaId: string) => {
        setFormData({ ...formData, thumbnail_id: mediaId });
        setShowMediaPicker(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await updateWarehouseItem(editingItem.id, formData);
            } else {
                await createWarehouseItem(formData);
            }
            setShowModal(false);
            loadItems();
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Có lỗi xảy ra khi lưu mặt hàng');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa mặt hàng này?')) {
            try {
                await deleteWarehouseItem(id);
                loadItems();
            } catch (error) {
                console.error('Error deleting item:', error);
            }
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const totalValue = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Quản lý Kho tổng hợp
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Toàn bộ vật dụng, thiết bị và tài sản trang trại</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-black h-12 px-8 rounded-2xl shadow-xl shadow-[#13ec49]/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
                    >
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        <span>Thêm mặt hàng</span>
                    </button>
                </div>
            </div>

            {/* Warehouse Type Filter Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-[24px] w-fit border border-slate-200">
                <button
                    onClick={() => setSelectedTypeId('ALL')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedTypeId === 'ALL' ? 'bg-white text-[#13ec49] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Tất cả kho
                </button>
                {warehouseTypes.map(type => (
                    <button
                        key={type.id}
                        onClick={() => setSelectedTypeId(type.id)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedTypeId === type.id ? 'bg-white text-[#13ec49] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {type.warehouse_name}
                    </button>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-b-4 border-b-blue-500">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Số loại mặt hàng</p>
                    <h3 className="text-3xl font-black mt-2 text-slate-900">{items.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-b-4 border-b-[#13ec49]">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Tổng số lượng</p>
                    <h3 className="text-3xl font-black mt-2 text-slate-900">{items.reduce((sum, item) => sum + Number(item.quantity), 0)}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-b-4 border-b-orange-500 col-span-1 md:col-span-2">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Tổng giá trị lưu kho</p>
                    <h3 className="text-3xl font-black mt-2 text-green-600">{formatCurrency(totalValue)}</h3>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-[#13ec49]">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="relative max-w-md w-full">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-4 focus:ring-[#13ec49]/10 transition-all outline-none font-medium"
                            placeholder="Tìm định danh, tên hoặc SKU..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all">
                            <span className="material-symbols-outlined">filter_list</span>
                        </button>
                        <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all">
                            <span className="material-symbols-outlined">file_download</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                <th className="px-8 py-5">Thông tin Sản phẩm</th>
                                <th className="px-8 py-5">Mã / SKU</th>
                                <th className="px-8 py-5">Kho lưu trữ</th>
                                <th className="px-8 py-5 text-right">Số lượng</th>
                                <th className="px-8 py-5 text-right">Đơn giá</th>
                                <th className="px-8 py-5">Vị trí</th>
                                <th className="px-8 py-5 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-[#13ec49] border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Đang tải...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-20 text-center text-slate-300 italic font-bold">Không tìm thấy mặt hàng nào</td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-all cursor-default">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200 shadow-sm">
                                                    {item.thumbnail_id ? (
                                                        <img src={getMediaUrl(item.thumbnail_id)} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-slate-900 group-hover:text-[#13ec49] transition-colors">{item.item_name}</div>
                                                    <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-black">{item.category || 'Chưa phân loại'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="space-y-1">
                                                <div className="font-mono text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded w-fit border border-slate-200">{item.item_code}</div>
                                                {item.sku && <div className="text-[10px] text-slate-400 font-bold tracking-tight">SKU: {item.sku}</div>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="bg-[#13ec49]/10 text-slate-900 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#13ec49]/20">
                                                {item.warehouse_name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="text-base font-black text-slate-900">{item.quantity}</div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{item.unit}</div>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-green-600">
                                            {formatCurrency(item.price)}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                                <span className="text-xs font-bold">{item.location || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="size-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="size-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
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
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col">
                        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingItem ? 'Cập nhật mặt hàng' : 'Thêm mặt hàng mới'}</h2>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Cấu bản ghi vật kê khai tài sản</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="size-12 rounded-2xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-1 space-y-6">
                                    {/* Thumbnail Selection */}
                                    <div className="p-8 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 group cursor-pointer hover:border-[#13ec49] transition-all" onClick={handleOpenMediaPicker}>
                                        <div className="aspect-square bg-white rounded-[32px] shadow-sm flex items-center justify-center overflow-hidden mb-4 border border-slate-100">
                                            {formData.thumbnail_id ? (
                                                <img src={getMediaUrl(formData.thumbnail_id)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Preview" />
                                            ) : (
                                                <span className="material-symbols-outlined text-slate-300 text-5xl">add_photo_alternate</span>
                                            )}
                                        </div>
                                        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[#13ec49] transition-colors">Tải ảnh lên</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Loại nhà kho *</label>
                                        <select
                                            required
                                            value={formData.warehouse_type_id}
                                            onChange={e => handleTypeChangeInForm(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all appearance-none"
                                        >
                                            {warehouseTypes.map(type => <option key={type.id} value={type.id}>{type.warehouse_name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã hàng hóa</label>
                                        <input
                                            required
                                            type="text"
                                            disabled={!!editingItem}
                                            value={formData.item_code}
                                            onChange={e => setFormData({ ...formData, item_code: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all disabled:opacity-50"
                                            placeholder="VD: GD-001"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã SKU / Barcode</label>
                                        <input
                                            type="text"
                                            value={formData.sku}
                                            onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                                            placeholder="Dùng để quét mã vạch..."
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên mặt hàng *</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.item_name}
                                            onChange={e => setFormData({ ...formData, item_name: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                                            placeholder="Tên sản phẩm..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vị trí lưu kho</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                                            placeholder="VD: Kệ A1, Tầng 2"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Đơn vị tính</label>
                                        <select
                                            value={formData.unit}
                                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all appearance-none"
                                        >
                                            {units.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số lượng hiện có</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.quantity}
                                            onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Giá trị ước tính (VNĐ)</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ghi chú bổ sung</label>
                                        <textarea
                                            rows={3}
                                            value={formData.note}
                                            onChange={e => setFormData({ ...formData, note: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all resize-none"
                                            placeholder="Mô tả tình trạng máy móc, thời gian bảo trì..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-12 bg-[#13ec49] text-black py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-[#13ec49]/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4"
                            >
                                <span className="material-symbols-outlined font-black">save</span>
                                {editingItem ? 'Cập nhật thay đổi' : 'Ghi nhận vào kho'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-[60px] w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-500">
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Thư viện ảnh</h3>
                                <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mt-2">Chọn ảnh phù hợp cho vật kê khai</p>
                            </div>
                            <button onClick={() => setShowMediaPicker(false)} className="size-14 rounded-[20px] bg-slate-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-slate-400 transition-all">
                                <span className="material-symbols-outlined text-3xl">close</span>
                            </button>
                        </div>
                        <div className="p-10 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
                            {loadingMedia ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <div className="size-12 border-4 border-[#13ec49]/20 border-t-[#13ec49] rounded-full animate-spin"></div>
                                    <p className="font-black text-slate-400 uppercase text-[11px] tracking-widest">Đang tải tài nguyên...</p>
                                </div>
                            ) : mediaFiles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-300">
                                    <span className="material-symbols-outlined text-[100px]">filter_hdr</span>
                                    <p className="font-black uppercase text-sm tracking-widest">Không có dữ liệu ảnh.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    {mediaFiles.map((media) => (
                                        <div
                                            key={media.id}
                                            onClick={() => handleSelectMedia(media.id)}
                                            className="group relative aspect-square bg-white rounded-[32px] overflow-hidden cursor-pointer border-4 border-transparent hover:border-[#13ec49] shadow-md hover:shadow-2xl hover:shadow-[#13ec49]/20 transition-all"
                                        >
                                            <img
                                                src={getMediaUrl(media.id)}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                alt={media.image_name}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                                                <div className="bg-[#13ec49] text-black size-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all shadow-2xl">
                                                    <span className="material-symbols-outlined font-black">check</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarehouseManagement;
