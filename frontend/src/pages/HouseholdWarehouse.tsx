import React, { useState, useEffect } from 'react';
import { getWarehouseItems, createWarehouseItem, updateWarehouseItem, deleteWarehouseItem, WarehouseItem, getNextWarehouseCode } from '../api/warehouse.api';
import { getMediaFiles, MediaFile } from '../services/media.service';
import { getMediaUrl } from '../services/products.service';

const HouseholdWarehouse: React.FC = () => {
    const [items, setItems] = useState<WarehouseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<WarehouseItem | null>(null);
    const units = ['Cái', 'Bộ', 'Chiếc', 'Hộp', 'Gói'];

    // Media Picker States
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [loadingMedia, setLoadingMedia] = useState(false);

    const [formData, setFormData] = useState({
        item_code: '',
        item_name: '',
        category: '',
        quantity: 0,
        unit: '',
        price: 0,
        location: '',
        thumbnail_id: '',
        note: ''
    });

    useEffect(() => {
        loadItems();
    }, [searchTerm]);

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await getWarehouseItems('household', searchTerm);
            setItems(data);
        } catch (error) {
            console.error('Error loading household items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = async (item?: WarehouseItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                item_code: item.item_code,
                item_name: item.item_name,
                category: item.category || '',
                quantity: Number(item.quantity),
                unit: item.unit || '',
                price: Number(item.price),
                location: item.location || '',
                thumbnail_id: item.thumbnail_id || '',
                note: item.note || ''
            });
        } else {
            setEditingItem(null);
            const nextCode = await getNextWarehouseCode('household');
            setFormData({
                item_code: nextCode,
                item_name: '',
                category: '',
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

    const handleOpenMediaPicker = async () => {
        setShowMediaPicker(true);
        setLoadingMedia(true);
        try {
            const response = await getMediaFiles({ category: 'household' });
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
                await updateWarehouseItem('household', editingItem.id, formData);
            } else {
                await createWarehouseItem('household', formData);
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
                await deleteWarehouseItem('household', id);
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
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Kho Gia dụng
                    </h1>
                    <p className="text-slate-500 mt-2">Quản lý đồ gia dụng và nội thất</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#13ec49]/20 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Thêm mặt hàng</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase">Tổng số mặt hàng</p>
                    <h3 className="text-3xl font-black mt-2">{items.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase">Tổng số lượng</p>
                    <h3 className="text-3xl font-black mt-2">{items.reduce((sum, item) => sum + Number(item.quantity), 0)}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase">Tổng giá trị</p>
                    <h3 className="text-2xl font-black mt-2 text-green-600">{formatCurrency(totalValue)}</h3>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <div className="relative max-w-md">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-lg py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none"
                            placeholder="Tìm kiếm đồ gia dụng..."
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Sản phẩm</th>
                                <th className="px-6 py-4">Mã hàng</th>
                                <th className="px-6 py-4">Danh mục</th>
                                <th className="px-6 py-4">Số lượng</th>
                                <th className="px-6 py-4">Đơn giá</th>
                                <th className="px-6 py-4">Vị trí</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400 italic">Đang tải dữ liệu...</td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-slate-300 italic">Không tìm thấy mặt hàng nào</td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                                                    {item.thumbnail_id ? (
                                                        <img src={getMediaUrl(item.thumbnail_id)} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <span className="material-symbols-outlined">image</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span>{item.item_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{item.item_code}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">{item.category}</span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{item.quantity} {item.unit}</td>
                                        <td className="px-6 py-4 font-bold text-green-600">{formatCurrency(item.price)}</td>
                                        <td className="px-6 py-4 text-slate-600">{item.location}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">{editingItem ? 'Cập nhật mặt hàng' : 'Thêm mặt hàng mới'}</h2>
                                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">Kho Gia dụng</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="size-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-160px)] custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã hàng</label>
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
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên mặt hàng</label>
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
                                        placeholder="Ví dụ: Kho A, Tầng 2"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số lượng</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Đơn vị</label>
                                    <select
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all appearance-none"
                                    >
                                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Đơn giá (VNĐ)</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                                    />
                                </div>

                                {/* Thumbnail Selection */}
                                <div className="col-span-full p-6 bg-slate-50 rounded-[32px] border border-slate-200">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Ảnh đại diện</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {formData.thumbnail_id ? (
                                                <img src={getMediaUrl(formData.thumbnail_id)} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <span className="material-symbols-outlined text-slate-300 text-3xl">image</span>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <button
                                                type="button"
                                                onClick={handleOpenMediaPicker}
                                                className="w-full py-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:border-[#13ec49] hover:text-[#13ec49] transition-all flex items-center justify-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">photo_library</span>
                                                Chọn ảnh từ thư viện
                                            </button>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Bạn cần upload ảnh lên Thư viện Media trước.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-full space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ghi chú</label>
                                    <textarea
                                        rows={3}
                                        value={formData.note}
                                        onChange={e => setFormData({ ...formData, note: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                                        placeholder="Thông tin bổ sung..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-8 bg-[#13ec49] text-black py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#13ec49]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                <span className="material-symbols-outlined font-black">save</span>
                                {editingItem ? 'Cập nhật mặt hàng' : 'Lưu mặt hàng mới'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Thư viện Media</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Chọn một ảnh cho sản phẩm kho</p>
                            </div>
                            <button onClick={() => setShowMediaPicker(false)} className="size-12 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                            {loadingMedia ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <div className="size-12 border-4 border-[#13ec49]/20 border-t-[#13ec49] rounded-full animate-spin"></div>
                                    <p className="font-bold text-slate-400 animate-pulse uppercase text-[10px] tracking-widest">Đang tải thư viện...</p>
                                </div>
                            ) : mediaFiles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-300">
                                    <span className="material-symbols-outlined text-[80px]">image_not_supported</span>
                                    <p className="font-bold uppercase text-xs tracking-widest">Thư viện trống. Hãy upload ảnh trước!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {mediaFiles.map((media) => (
                                        <div
                                            key={media.id}
                                            onClick={() => handleSelectMedia(media.id)}
                                            className="group relative aspect-square bg-white rounded-3xl overflow-hidden cursor-pointer border-4 border-transparent hover:border-[#13ec49] shadow-sm hover:shadow-xl hover:shadow-[#13ec49]/10 transition-all"
                                        >
                                            <img
                                                src={getMediaUrl(media.id)}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                alt={media.image_name}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                                                <button className="bg-white text-black size-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-xl font-black">
                                                    <span className="material-symbols-outlined">check</span>
                                                </button>
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

export default HouseholdWarehouse;
