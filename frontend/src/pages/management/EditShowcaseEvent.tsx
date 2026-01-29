import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getShowcaseEventById,
    updateShowcaseEvent,
    createShowcaseEvent,
    getAllGuests,
    addParticipant,
    removeParticipant,
    updateParticipantPermission,
    getEventGreetings,
    saveEventGreeting,
    deleteEventGreeting,
    sendGreetingNotification,
    ShowcaseEvent,
    Guest,
    EventGreeting
} from '../../api/showcase-event.api';
import { getMediaUrl } from '../../services/products.service';
import { uploadMedia } from '../../services/media.service';
import { getPublicUsers, PublicUser } from '../../api/user.api';

const EditShowcaseEvent: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [eventData, setEventData] = useState<Partial<ShowcaseEvent>>({
        title: '',
        description: '',
        event_date: new Date().toISOString().slice(0, 16),
        location: '',
        status: 'DRAFT'
    });

    const [allGuests, setAllGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showParticipantModal, setShowParticipantModal] = useState(false);

    // New participant form
    const [participantForm, setParticipantForm] = useState({
        guest_id: '',
        role_at_event: '',
        color_theme: 'green',
        is_vip: false,
        sort_order: 0
    });

    // Greetings management
    const [greetings, setGreetings] = useState<EventGreeting[]>([]);
    const [publicUsers, setPublicUsers] = useState<PublicUser[]>([]);
    const [showGreetingModal, setShowGreetingModal] = useState(false);
    const [greetingForm, setGreetingForm] = useState({
        public_user_id: '',
        greeting_message: ''
    });

    // Gallery management
    const [galleryImages, setGalleryImages] = useState<{ id?: string, url: string, file?: File }[]>([]);
    const galleryInputRef = React.useRef<HTMLInputElement>(null);
    const bannerInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const guestsData = await getAllGuests();
            setAllGuests(guestsData);

            const usersData = await getPublicUsers();
            setPublicUsers(usersData);

            if (isEdit && id) {
                const data = await getShowcaseEventById(id);
                setEventData({
                    ...data,
                    event_date: new Date(data.event_date).toISOString().slice(0, 16)
                });

                const greetingsData = await getEventGreetings(id);
                setGreetings(greetingsData);

                if (data.gallery_ids && data.gallery_ids.length > 0) {
                    setGalleryImages(data.gallery_ids.map(id => ({ id, url: getMediaUrl(id) })));
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGreeting = async () => {
        if (!id || !greetingForm.public_user_id || !greetingForm.greeting_message) return;
        try {
            await saveEventGreeting({
                event_id: id,
                ...greetingForm
            });
            setShowGreetingModal(false);
            setGreetingForm({ public_user_id: '', greeting_message: '' });
            const greetingsData = await getEventGreetings(id);
            setGreetings(greetingsData);
        } catch (error) {
            alert('Không thể lưu lời chúc');
        }
    };

    const handleDeleteGreeting = async (greetingId: string) => {
        if (!confirm('Xóa lời chúc này?')) return;
        try {
            await deleteEventGreeting(greetingId);
            const greetingsData = await getEventGreetings(id!);
            setGreetings(greetingsData);
        } catch (error) {
            alert('Lỗi khi xóa lời chúc');
        }
    };

    const handleSendNotification = async (greetingId: string) => {
        try {
            await sendGreetingNotification(greetingId);
            alert('Đã gửi thông báo lời chúc đến người dùng!');
        } catch (error) {
            alert('Lỗi khi gửi thông báo');
        }
    };

    const handleSaveEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const galleryIds = galleryImages.map(img => img.id).filter(Boolean) as string[];
            const payload = { ...eventData, gallery_ids: galleryIds };

            if (isEdit && id) {
                await updateShowcaseEvent(id, payload);
                alert('Cập nhật thành công!');
            } else {
                const newEvent = await createShowcaseEvent(payload);
                navigate(`/master-data/showcase-events/edit/${newEvent.id}`);
                alert('Tạo sự kiện thành công!');
            }
        } catch (error) {
            alert('Lỗi lưu sự kiện');
        }
    };

    const handleAddParticipant = async () => {
        if (!id || !participantForm.guest_id) return;
        try {
            await addParticipant({
                event_id: id,
                ...participantForm
            });
            setShowParticipantModal(false);
            setParticipantForm({ guest_id: '', role_at_event: '', color_theme: 'green', is_vip: false, sort_order: 0 });
            loadData();
        } catch (error) {
            alert('Không thể thêm khách mời vào sự kiện');
        }
    };

    const handleRemoveParticipant = async (participantId: string) => {
        if (!confirm('Gỡ khách mời này khỏi sự kiện?')) return;
        try {
            await removeParticipant(participantId);
            loadData();
        } catch (error) {
            alert('Lỗi khi gỡ khách mời');
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, isBanner: boolean = false) => {
        const files = Array.from(e.target.files || []) as File[];
        if (files.length === 0) return;

        // Visual feedback
        setLoading(true);
        try {
            if (isBanner) {
                const file = files[0];
                const result: any = await uploadMedia(file, 'event_banner');
                if (result.success && result.data) {
                    setEventData({ ...eventData, banner_id: result.data.id });
                }
            } else {
                const uploadedImages: { id: string, url: string }[] = [];
                for (const file of files) {
                    const result: any = await uploadMedia(file, 'event_new_year');
                    if (result.success && result.data) {
                        uploadedImages.push({
                            id: result.data.id,
                            url: getMediaUrl(result.data.id)
                        });
                    }
                }
                setGalleryImages(prev => [...prev, ...uploadedImages]);
            }
        } catch (error) {
            alert('Lỗi khi tải ảnh lên');
        } finally {
            setLoading(false);
        }
    };

    const removeGalleryImage = (index: number) => {
        setGalleryImages(prev => prev.filter((_, i) => i !== index));
    };

    if (loading && isEdit) return <div className="p-20 text-center font-bold">Đang tải...</div>;

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/master-data/showcase-events')} className="size-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    {isEdit ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
                        <form onSubmit={handleSaveEvent} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tiêu đề sự kiện *</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 focus:border-[#13ec49] focus:bg-white outline-none transition-all font-bold text-lg"
                                    placeholder="Nhập tên sự kiện..."
                                    value={eventData.title}
                                    onChange={e => setEventData({ ...eventData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Thời gian diễn ra *</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 focus:border-[#13ec49] focus:bg-white outline-none transition-all font-bold"
                                        value={eventData.event_date}
                                        onChange={e => setEventData({ ...eventData, event_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Địa điểm</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 focus:border-[#13ec49] focus:bg-white outline-none transition-all font-bold"
                                        placeholder="VD: Sân vận động trung tâm"
                                        value={eventData.location}
                                        onChange={e => setEventData({ ...eventData, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mô tả chi tiết</label>
                                <textarea
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 focus:border-[#13ec49] focus:bg-white outline-none transition-all font-bold min-h-[160px]"
                                    placeholder="Nội dung sự kiện..."
                                    value={eventData.description}
                                    onChange={e => setEventData({ ...eventData, description: e.target.value })}
                                />
                            </div>

                            {/* Banner Upload Section */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ảnh bìa sự kiện (Banner)</label>
                                <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 group">
                                    {eventData.banner_id ? (
                                        <>
                                            <img src={getMediaUrl(eventData.banner_id)} className="size-full object-cover" alt="Banner" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => bannerInputRef.current?.click()}
                                                    className="px-6 py-2 bg-white text-black font-black rounded-xl text-[10px] uppercase tracking-widest"
                                                > Thay đổi </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEventData({ ...eventData, banner_id: undefined })}
                                                    className="px-6 py-2 bg-red-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest"
                                                > Xóa </button>
                                            </div>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => bannerInputRef.current?.click()}
                                            className="size-full flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-[#13ec49] transition-all"
                                        >
                                            <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Tải ảnh bìa lên</span>
                                        </button>
                                    )}
                                </div>
                                <p className="mt-2 text-[10px] text-slate-400 font-bold italic">Khuyến nghị: Tỷ lệ 21:9 để hiển thị tốt nhất.</p>
                            </div>

                            {/* Gallery Upload Section */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Hình ảnh sự kiện (Gallery)</label>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    {galleryImages.slice(0, 4).map((img, index) => (
                                        <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 group">
                                            <img src={img.url} className="size-full object-cover" alt="" />

                                            {/* +n Overlay for the 4th image */}
                                            {index === 3 && galleryImages.length > 4 && (
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                                                    <span className="text-white text-2xl font-black">+{galleryImages.length - 3}</span>
                                                </div>
                                            )}

                                            {/* Delete button */}
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(index)}
                                                className="absolute top-2 right-2 size-7 bg-white/90 rounded-lg text-red-500 shadow-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-500 hover:text-white"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                            </button>
                                        </div>
                                    ))}

                                    {/* Upload Button Frame */}
                                    {galleryImages.length < 4 && (
                                        <button
                                            type="button"
                                            onClick={() => galleryInputRef.current?.click()}
                                            className="aspect-square rounded-2xl border-2 border-dashed border-[#13ec49]/30 bg-[#13ec49]/5 hover:bg-[#13ec49]/10 hover:border-[#13ec49] transition-all flex flex-col items-center justify-center gap-2 group"
                                        >
                                            <span className="material-symbols-outlined text-[#13ec49] text-3xl group-hover:scale-110 transition-transform">add_a_photo</span>
                                            <span className="text-[10px] font-black uppercase text-[#13ec49]">Thêm ảnh</span>
                                        </button>
                                    )}
                                </div>

                                {galleryImages.length >= 4 && (
                                    <button
                                        type="button"
                                        onClick={() => galleryInputRef.current?.click()}
                                        className="w-full py-4 rounded-2xl border-2 border-dashed border-[#13ec49]/30 bg-[#13ec49]/5 hover:bg-[#13ec49]/10 hover:border-[#13ec49] transition-all flex items-center justify-center gap-2 group mb-4"
                                    >
                                        <span className="material-symbols-outlined text-[#13ec49] group-hover:scale-110 transition-transform">add_a_photo</span>
                                        <span className="text-sm font-black uppercase text-[#13ec49]">Thêm thêm ảnh nữa ({galleryImages.length})</span>
                                    </button>
                                )}

                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    ref={galleryInputRef}
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(e, false)}
                                />

                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={bannerInputRef}
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(e, true)}
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button type="submit" className="h-14 px-8 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-black rounded-2xl shadow-xl shadow-[#13ec49]/20 transition-all active:scale-95 flex items-center gap-2">
                                    <span className="material-symbols-outlined font-bold">save</span>
                                    <span>Lưu thông tin</span>
                                </button>
                                <select
                                    className="h-14 px-6 bg-slate-100 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#13ec49]/30"
                                    value={eventData.status}
                                    onChange={e => setEventData({ ...eventData, status: e.target.value as any })}
                                >
                                    <option value="DRAFT">Bản nháp</option>
                                    <option value="PUBLISHED">Công khai</option>
                                    <option value="ENDED">Đã kết thúc</option>
                                </select>
                            </div>
                        </form>
                    </div>

                    {/* Participants Management (Only in Edit mode) */}
                    {isEdit && (
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#13ec49]">group</span>
                                    Danh sách tham gia
                                </h2>
                                <button
                                    onClick={() => setShowParticipantModal(true)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-[#13ec49] hover:text-black transition-all rounded-xl font-bold text-slate-600 text-sm flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Thêm khách mời
                                </button>
                            </div>

                            <div className="space-y-4">
                                {eventData.participants?.length === 0 ? (
                                    <div className="py-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold">
                                        Chưa có ai trong danh sách tham gia
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {eventData.participants?.map((p) => (
                                            <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-12 rounded-full p-0.5 bg-gradient-to-br ${p.color_theme === 'yellow' ? 'from-yellow-400 to-orange-500' :
                                                        p.color_theme === 'purple' ? 'from-purple-400 to-pink-500' :
                                                            p.color_theme === 'blue' ? 'from-blue-400 to-indigo-500' :
                                                                'from-[#13ec49] to-green-600'
                                                        }`}>
                                                        {p.avatar_id ? (
                                                            <img src={getMediaUrl(p.avatar_id)} alt="" className="size-full rounded-full object-cover border-2 border-white" />
                                                        ) : (
                                                            <div className="size-full rounded-full bg-slate-200 border-2 border-white flex items-center justify-center font-bold text-slate-500">
                                                                {p.full_name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 flex items-center gap-1">
                                                            {p.full_name}
                                                            {p.is_vip && <span className="bg-yellow-400 text-[8px] font-black px-1 rounded-sm text-white">VIP</span>}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                                                            {p.role_at_event || p.default_title}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            try {
                                                                const newPerm = !p.can_upload_gallery;
                                                                await updateParticipantPermission(p.id, newPerm);
                                                                // Update local state
                                                                setEventData(prev => ({
                                                                    ...prev,
                                                                    participants: prev.participants?.map(part =>
                                                                        part.id === p.id ? { ...part, can_upload_gallery: newPerm } : part
                                                                    )
                                                                }));
                                                            } catch (err) {
                                                                alert('Cập nhật quyền thất bại');
                                                            }
                                                        }}
                                                        className={`size-8 rounded-lg transition-all flex items-center justify-center ${p.can_upload_gallery ? 'bg-[#13ec49] text-black shadow-lg shadow-[#13ec49]/20' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'}`}
                                                        title={p.can_upload_gallery ? "Đã cấp quyền upload" : "Chưa cấp quyền upload"}
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">{p.can_upload_gallery ? 'photo_library' : 'no_photography'}</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveParticipant(p.id)}
                                                        className="size-8 rounded-lg bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-500 hover:text-white"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Greetings Management (Only in Edit mode) */}
                    {isEdit && (
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#13ec49]">celebration</span>
                                    Lời chúc cá nhân hóa
                                </h2>
                                <button
                                    onClick={() => setShowGreetingModal(true)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-[#13ec49] hover:text-black transition-all rounded-xl font-bold text-slate-600 text-sm flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Thiết lập lời chúc
                                </button>
                            </div>

                            <div className="space-y-4">
                                {greetings.length === 0 ? (
                                    <div className="py-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold">
                                        Chưa có lời chúc nào được thiết lập cho sự kiện này
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {greetings.map((g) => (
                                            <div key={g.id} className="flex flex-col p-6 bg-slate-50 rounded-2xl border border-slate-100 group">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-full bg-[#13ec49]/10 flex items-center justify-center font-bold text-[#13ec49]">
                                                            {g.full_name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900">{g.full_name || 'User'}</div>
                                                            <div className="text-xs text-slate-500">{g.email}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {g.is_sent && (
                                                            <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-black uppercase tracking-widest">
                                                                <span className="material-symbols-outlined text-[12px]">check</span>
                                                                Đã hiển thị
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => handleSendNotification(g.id)}
                                                            className="px-3 py-1.5 bg-[#13ec49]/10 text-[#13ec49] hover:bg-[#13ec49] hover:text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                                                            title="Gửi lời chúc này qua thông báo hệ thống"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">send</span>
                                                            Gửi thông báo
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteGreeting(g.id)}
                                                            className="size-8 rounded-lg bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-500 hover:text-white"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-white rounded-xl border border-slate-100 italic text-slate-600 font-medium whitespace-pre-wrap">
                                                    "{g.greeting_message}"
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8 text-sm">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-4">
                        <h3 className="font-black uppercase tracking-widest text-[#13ec49] mb-4">Hướng dẫn</h3>
                        <p className="opacity-70 leading-relaxed font-bold">
                            Tạo thông tin cơ bản trước, sau đó bạn có thể chọn từ danh sách khách mời để thêm vào sự kiện.
                        </p>
                        <p className="opacity-70 leading-relaxed font-bold">
                            Màu sắc viền sẽ hiển thị tương ứng với loại Gradient trên ứng dụng Showcase.
                        </p>
                        <hr className="border-slate-800" />
                        <h3 className="font-black uppercase tracking-widest text-[#13ec49] mb-4">Lời chúc riêng tư</h3>
                        <p className="opacity-70 leading-relaxed font-bold">
                            Bạn có thể gán lời chúc riêng cho từng người dùng. Khi họ bấm "Tham gia" tại Showcase, lời chúc này sẽ hiện ra với hiệu ứng sống động.
                        </p>
                        <p className="opacity-70 leading-relaxed font-bold">
                            Lời chúc cũng sẽ được gửi qua thông báo hệ thống để họ có thể xem lại sau.
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal Participant */}
            {showParticipantModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Thêm khách vào sự kiện</h2>
                            <button onClick={() => setShowParticipantModal(false)} className="size-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Chọn khách mời *</label>
                                <select
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3.5 focus:border-[#13ec49] focus:bg-white outline-none transition-all font-bold"
                                    value={participantForm.guest_id}
                                    onChange={e => setParticipantForm({ ...participantForm, guest_id: e.target.value })}
                                >
                                    <option value="">-- Chọn một người --</option>
                                    {allGuests.map(g => (
                                        <option key={g.id} value={g.id}>{g.full_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vai trò trong sự kiện này</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3.5 focus:border-[#13ec49] focus:bg-white outline-none transition-all font-bold"
                                    placeholder="Trống: Lấy chức danh mặc định"
                                    value={participantForm.role_at_event}
                                    onChange={e => setParticipantForm({ ...participantForm, role_at_event: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer font-bold">
                                    <input type="checkbox" className="size-5 accent-[#13ec49]" checked={participantForm.is_vip} onChange={e => setParticipantForm({ ...participantForm, is_vip: e.target.checked })} />
                                    Là khách mời VIP?
                                </label>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Chủ đề màu sắc viền</label>
                                <div className="flex gap-4">
                                    {['green', 'yellow', 'purple', 'blue'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setParticipantForm({ ...participantForm, color_theme: color })}
                                            className={`size-10 rounded-full border-4 transition-all ${participantForm.color_theme === color ? 'border-slate-800' : 'border-transparent'
                                                } ${color === 'green' ? 'bg-[#13ec49]' :
                                                    color === 'yellow' ? 'bg-yellow-400' :
                                                        color === 'purple' ? 'bg-purple-500' : 'bg-blue-500'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button onClick={() => setShowParticipantModal(false)} className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all">
                                    Hủy
                                </button>
                                <button onClick={handleAddParticipant} className="flex-1 h-12 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-bold rounded-2xl transition-all active:scale-95">
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Greeting */}
            {showGreetingModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Thiết lập lời chúc riêng</h2>
                            <button onClick={() => setShowGreetingModal(false)} className="size-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Người dùng (Public) *</label>
                                <select
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3.5 focus:border-[#13ec49] focus:bg-white outline-none transition-all font-bold"
                                    value={greetingForm.public_user_id}
                                    onChange={e => setGreetingForm({ ...greetingForm, public_user_id: e.target.value })}
                                >
                                    <option value="">-- Chọn người dùng --</option>
                                    {publicUsers.map(u => (
                                        <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nội dung lời chúc *</label>
                                <textarea
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3.5 focus:border-[#13ec49] focus:bg-white outline-none transition-all font-bold min-h-[120px]"
                                    placeholder="Nhập lời chúc riêng tư cho người này..."
                                    value={greetingForm.greeting_message}
                                    onChange={e => setGreetingForm({ ...greetingForm, greeting_message: e.target.value })}
                                />
                                <p className="mt-2 text-[10px] text-slate-400 font-bold italic">Lời chúc này sẽ hiện ra khi người dùng bấm "Tham gia" tại Showcase.</p>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button onClick={() => setShowGreetingModal(false)} className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all">
                                    Hủy
                                </button>
                                <button onClick={handleSaveGreeting} className="flex-1 h-12 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-bold rounded-2xl transition-all active:scale-95">
                                    Lưu lời chúc
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditShowcaseEvent;
