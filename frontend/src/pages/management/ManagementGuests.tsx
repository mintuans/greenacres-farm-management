import React, { useState, useEffect } from 'react';
import {
    getAllGuests,
    createGuest,
    updateGuest,
    deleteGuest,
    Guest
} from '../../api/showcase-event.api';
import { getMediaFiles, MediaFile } from '../../services/media.service';
import { getMediaUrl } from '../../services/products.service';

const ManagementGuests: React.FC = () => {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Guest>>({
        full_name: '',
        default_title: '',
        phone: '',
        email: '',
        avatar_id: ''
    });

    useEffect(() => {
        loadGuests();
    }, []);

    const loadGuests = async () => {
        try {
            setLoading(true);
            const data = await getAllGuests();
            setGuests(data);
        } catch (error) {
            console.error('Error loading guests:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMedia = async () => {
        try {
            const response = await getMediaFiles({ category: 'avatar' });
            setMediaFiles(response.data);
            setShowMediaPicker(true);
        } catch (error) {
            console.error('Error loading media:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateGuest(editingId, formData);
            } else {
                await createGuest(formData);
            }
            setShowModal(false);
            setEditingId(null);
            setFormData({ full_name: '', default_title: '', phone: '', email: '', avatar_id: '' });
            loadGuests();
        } catch (error) {
            alert(`Không thể ${editingId ? 'cập nhật' : 'tạo'} khách mời`);
        }
    };

    const handleEdit = (guest: Guest) => {
        setEditingId(guest.id);
        setFormData({
            full_name: guest.full_name,
            default_title: guest.default_title,
            phone: guest.phone,
            email: guest.email,
            avatar_id: guest.avatar_id
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa khách mời này?')) return;
        try {
            await deleteGuest(id);
            loadGuests();
        } catch (error) {
            alert('Không thể xóa khách mời');
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Quản lý Khách mời
                    </h1>
                    <p className="text-slate-500 mt-2">Danh sách chuyên gia và khách mời trên trang Showcase</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ full_name: '', default_title: '', phone: '', email: '', avatar_id: '' });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#13ec49]/20 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    <span>Thêm khách mời mới</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
                {loading ? (
                    <div className="text-center py-20 italic text-slate-400">Đang tải...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Khách mời</th>
                                    <th className="px-6 py-4">Chức danh mặc định</th>
                                    <th className="px-6 py-4">Điện thoại</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 italic">
                                {guests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Chưa có khách mời nào</td>
                                    </tr>
                                ) : (
                                    guests.map((guest) => (
                                        <tr key={guest.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 uppercase">
                                                <div className="flex items-center gap-3">
                                                    {guest.avatar_id ? (
                                                        <img src={getMediaUrl(guest.avatar_id)} alt="" className="size-10 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                                                            {guest.full_name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span className="font-bold text-slate-900">{guest.full_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{guest.default_title || '-'}</td>
                                            <td className="px-6 py-4 text-slate-500">{guest.phone || '-'}</td>
                                            <td className="px-6 py-4 text-slate-500">{guest.email || '-'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => handleEdit(guest)}
                                                        className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(guest.id)}
                                                        className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all"
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

            {/* Modal Add/Edit Guest */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                {editingId ? 'Chỉnh sửa khách mời' : 'Khách mời mới'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingId(null);
                                }}
                                className="size-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex justify-center mb-4">
                                <div
                                    onClick={loadMedia}
                                    className="size-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition-all overflow-hidden"
                                >
                                    {formData.avatar_id ? (
                                        <img src={getMediaUrl(formData.avatar_id)} alt="" className="size-full object-cover" />
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-slate-400">add_a_photo</span>
                                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Chọn ảnh</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Họ và tên *</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3.5 focus:border-[#13ec49] focus:bg-white outline-none transition-all font-bold"
                                    placeholder="VD: Nguyễn Văn A"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Chức danh</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3.5 focus:border-[#13ec49] focus:bg-white outline-none transition-all font-bold"
                                    placeholder="VD: Chuyên gia Nông nghiệp"
                                    value={formData.default_title}
                                    onChange={e => setFormData({ ...formData, default_title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Điện thoại</label>
                                    <input
                                        type="tel"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3.5 focus:border-[#13ec49] focus:bg-white outline-none transition-all font-bold text-sm"
                                        value={formData.phone || ''}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                                    <input
                                        type="email"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3.5 focus:border-[#13ec49] focus:bg-white outline-none transition-all font-bold text-sm"
                                        value={formData.email || ''}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingId(null);
                                    }}
                                    className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all"
                                >
                                    Hủy
                                </button>
                                <button type="submit" className="flex-1 h-12 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-bold rounded-2xl shadow-lg shadow-[#13ec49]/20 transition-all active:scale-95">
                                    {editingId ? 'Cập nhật' : 'Lưu lại'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">Chọn ảnh đại diện</h2>
                            <button onClick={() => setShowMediaPicker(false)} className="size-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                {mediaFiles.length === 0 ? (
                                    <div className="col-span-full py-20 text-center text-slate-400 font-bold">Chưa có ảnh trong thư viện (avatar)</div>
                                ) : (
                                    mediaFiles.map((media) => (
                                        <div
                                            key={media.id}
                                            onClick={() => {
                                                setFormData({ ...formData, avatar_id: media.id });
                                                setShowMediaPicker(false);
                                            }}
                                            className={`aspect-square rounded-2xl overflow-hidden cursor-pointer border-4 transition-all hover:scale-105 ${formData.avatar_id === media.id ? 'border-[#13ec49]' : 'border-transparent'}`}
                                        >
                                            <img src={getMediaUrl(media.id)} alt="" className="size-full object-cover" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style>
                {`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #d1d5db;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #9ca3af;
                    }
                `}
            </style>
        </div>
    );
};

export default ManagementGuests;

