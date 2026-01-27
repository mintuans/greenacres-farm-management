import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ShowcaseHeader from '../../templates/ShowcaseHeader';
import { getPublicEventById, joinEvent, ShowcaseEvent } from '../../services/events.service';
import { getMediaUrl } from '../../services/products.service';
import { useAuth } from '@/src/contexts/AuthContext';

const EventDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [event, setEvent] = useState<ShowcaseEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [forbidden, setForbidden] = useState(false);

    useEffect(() => {
        if (id) {
            loadEvent(id);
        }
    }, [id]);

    const loadEvent = async (eventId: string) => {
        try {
            setLoading(true);
            setForbidden(false);
            const response = await getPublicEventById(eventId);
            if (response.success) {
                setEvent(response.data);
            }
        } catch (error: any) {
            console.error('Error loading showcase event:', error);
            if (error.response?.status === 401) {
                if (window.confirm('Bạn cần đăng nhập để xem chi tiết sự kiện. Chuyển đến trang đăng nhập?')) {
                    navigate('/showcase/login');
                } else {
                    navigate('/showcase/events');
                }
            } else if (error.response?.status === 403) {
                setForbidden(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!isAuthenticated) {
            if (window.confirm('Bạn cần đăng nhập để tham gia sự kiện. Chuyển đến trang đăng nhập?')) {
                navigate('/showcase/login');
            }
            return;
        }

        if (!id) return;

        try {
            setJoining(true);
            const response = await joinEvent(id);
            if (response.success) {
                alert(response.message || 'Hẹn gặp lại bạn tại sự kiện!');
                // Reload event to see new participant list
                loadEvent(id);
            } else {
                alert(response.message || 'Có lỗi xảy ra khi tham gia sự kiện');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Không thể tham gia sự kiện vào lúc này');
        } finally {
            setJoining(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isUserJoined = event?.participants?.some(p => p.full_name === user?.name);

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f6]">
            <ShowcaseHeader />

            <main className="max-w-[1200px] mx-auto px-4 py-8 w-full">
                {/* Breadcrumb */}
                <div className="flex flex-wrap gap-2 items-center mb-6">
                    <Link to="/showcase" className="text-[#61896b] hover:text-[#13ec49] text-sm font-medium hover:underline transition-colors">
                        Trang chủ
                    </Link>
                    <span className="material-symbols-outlined text-sm text-[#61896b]">chevron_right</span>
                    <Link to="/showcase/events" className="text-[#61896b] hover:text-[#13ec49] text-sm font-medium hover:underline transition-colors">
                        Sự kiện
                    </Link>
                    <span className="material-symbols-outlined text-sm text-[#61896b]">chevron_right</span>
                    <span className="text-[#111813] text-sm font-semibold truncate max-w-[200px]">
                        {event?.title || 'Chi tiết sự kiện'}
                    </span>
                </div>

                {loading ? (
                    <div className="py-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#13ec49]"></div>
                        <p className="mt-4 text-[#61896b] font-bold italic">Đang tải chi tiết sự kiện...</p>
                    </div>
                ) : forbidden ? (
                    <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-red-200 shadow-xl shadow-red-50">
                        <div className="size-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-5xl text-red-400">lock</span>
                        </div>
                        <h2 className="text-2xl font-black text-[#111813] mb-4">Truy cập bị từ chối</h2>
                        <p className="text-slate-500 font-medium max-w-md mx-auto mb-8 leading-relaxed">
                            Rất tiếc, bạn không được mời tham gia sự kiện này. Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là một sự nhầm lẫn.
                        </p>
                        <Link to="/showcase/events" className="inline-flex items-center gap-2 bg-[#13ec49] hover:bg-[#10d63f] text-black font-black px-8 py-4 rounded-2xl transition-all shadow-lg active:scale-95">
                            <span className="material-symbols-outlined">arrow_back</span>
                            Quay lại danh sách sự kiện
                        </Link>
                    </div>
                ) : !event ? (
                    <div className="py-20 text-center bg-white rounded-3xl border border-[#dbe6de]">
                        <span className="material-symbols-outlined text-6xl text-[#dbe6de] mb-4">event_busy</span>
                        <h2 className="text-xl font-bold text-[#111813]">Không tìm thấy sự kiện</h2>
                        <Link to="/showcase/events" className="text-[#13ec49] font-bold mt-4 inline-block hover:underline">
                            Quay lại danh sách sự kiện
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Wall of Fame Section */}
                        <section className="mb-10 overflow-hidden">
                            <div className="flex items-center justify-between mb-6 px-2">
                                <div>
                                    <h2 className="text-2xl font-black text-[#111813] flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#13ec49] text-3xl">groups</span>
                                        Danh sách tham gia
                                    </h2>
                                    <p className="text-[#61896b] text-sm font-medium">Gặp gỡ những người chuyên gia và khách mời tham gia sự kiện!</p>
                                </div>
                                <button
                                    onClick={handleJoin}
                                    disabled={joining || isUserJoined}
                                    className={`${isUserJoined ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-[#13ec49] hover:bg-[#13ec49]/90 text-[#111813] shadow-[#13ec49]/20'} px-6 py-2.5 rounded-full font-bold shadow-lg transition-all flex items-center gap-2`}
                                >
                                    {isUserJoined ? 'Đã tham gia' : joining ? 'Đang đăng ký...' : 'Tham gia ngay'}
                                    <span className="material-symbols-outlined text-lg">{isUserJoined ? 'check_circle' : 'celebration'}</span>
                                </button>
                            </div>

                            {/* Scrollable Attendees */}
                            <div className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar px-2 -mx-2">
                                {event.participants && event.participants.length > 0 ? (
                                    event.participants.map((p) => {
                                        const colorMap: any = {
                                            green: 'border-[#13ec49] bg-[#13ec49]/20',
                                            yellow: 'border-[#D4AF37] bg-[#D4AF37]/20',
                                            blue: 'border-blue-400 bg-blue-400/20',
                                            purple: 'border-purple-400 bg-purple-400/20',
                                            pink: 'border-pink-400 bg-pink-400/20'
                                        };
                                        const themeClass = colorMap[p.color_theme || 'green'] || colorMap.green;
                                        const shadowColor = themeClass.split(' ')[1];

                                        return (
                                            <div key={p.id} className="flex-none group">
                                                <div className="relative">
                                                    <div className={`absolute inset-0 ${shadowColor} rounded-full scale-110 blur-md group-hover:scale-125 transition-all`}></div>
                                                    <div className={`relative size-28 rounded-full border-4 ${themeClass.split(' ')[0]} p-1 bg-white overflow-hidden shadow-xl transition-transform group-hover:scale-105`}>
                                                        {p.avatar_id ? (
                                                            <img
                                                                src={getMediaUrl(p.avatar_id)}
                                                                alt={p.full_name}
                                                                className="size-full rounded-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name)}&background=13ec49&color=fff`;
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="size-full rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-2xl">
                                                                {p.full_name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {(p.is_vip || p.role_at_event) && (
                                                        <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 ${p.is_vip ? 'bg-[#D4AF37]' : 'bg-[#13ec49]'} text-white text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm uppercase tracking-tighter z-10 border border-white`}>
                                                            {p.is_vip ? 'VIP' : (p.role_at_event || 'Member')}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-4 text-center">
                                                    <p className="font-bold text-sm leading-tight text-[#111813] group-hover:text-[#13ec49] transition-colors">{p.full_name}</p>
                                                    <p className="text-[10px] text-[#61896b] uppercase font-black tracking-widest mt-0.5 opacity-70">
                                                        {p.role_at_event || p.default_title || 'Khách mời'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-10 text-center w-full italic text-[#61896b] font-medium opacity-50">
                                        Công tác mời khách đang được triển khai...
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Main Event Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Event Details */}
                            <div className="lg:col-span-2 flex flex-col gap-8">
                                {/* Hero Image */}
                                <div className="relative overflow-hidden rounded-3xl bg-[#102215] min-h-[460px] flex flex-col justify-end group shadow-2xl">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                                        style={{
                                            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.9) 100%), url("${event.banner_id ? getMediaUrl(event.banner_id) : 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200'}")`
                                        }}
                                    ></div>
                                    <div className="relative p-10">
                                        <div className="flex gap-2 mb-4">
                                            <span className="inline-block px-4 py-1.5 bg-[#D4AF37] text-black text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg">Sự kiện nổi bật</span>
                                            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em]">Vườn Nhà Mình</span>
                                        </div>
                                        <h1 className="text-white text-4xl md:text-6xl font-black leading-[1.1] mb-6 tracking-tight drop-shadow-2xl">
                                            {event.title}
                                        </h1>
                                        <div className="flex flex-wrap gap-6 text-white/90 items-center">
                                            <div className="flex items-center gap-3 backdrop-blur-md bg-white/10 px-4 py-2 rounded-2xl">
                                                <span className="material-symbols-outlined text-[#13ec49] text-2xl">calendar_today</span>
                                                <span className="text-sm font-bold">{formatDate(event.event_date)}</span>
                                            </div>
                                            <div className="flex items-center gap-3 backdrop-blur-md bg-white/10 px-4 py-2 rounded-2xl">
                                                <span className="material-symbols-outlined text-[#13ec49] text-2xl">schedule</span>
                                                <span className="text-sm font-bold">{formatTime(event.event_date)} - Kết thúc</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Event Description */}
                                <div className="bg-white p-10 rounded-3xl border border-[#dbe6de] shadow-xl shadow-slate-200/50">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="size-12 bg-[#13ec49]/10 rounded-2xl flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[#13ec49] text-3xl">description</span>
                                        </div>
                                        <h2 className="text-2xl font-black text-[#111813] tracking-tight">Chi tiết sự kiện</h2>
                                    </div>
                                    <div className="text-[#4b6b53] leading-[1.8] mb-10 text-lg font-medium whitespace-pre-wrap italic">
                                        {event.description || 'Thông tin chi tiết về sự kiện sẽ được cập nhật sớm nhất. Hãy sẵn sàng cho những trải nghiệm tuyệt vời tại Vườn Nhà Mình!'}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#dbe6de] pt-10">
                                        <div className="group">
                                            <h3 className="text-[10px] font-black text-[#61896b] uppercase tracking-[0.2em] mb-6">Địa điểm tổ chức</h3>
                                            <div className="flex gap-4">
                                                <div className="bg-[#13ec49] size-14 rounded-2xl flex items-center justify-center shadow-lg shadow-[#13ec49]/30 transition-transform group-hover:rotate-12">
                                                    <span className="material-symbols-outlined text-white text-3xl">location_on</span>
                                                </div>
                                                <div>
                                                    <p className="font-black text-[#111813] text-lg leading-tight mb-1">{event.location || 'Tại Vườn Nhà Mình'}</p>
                                                    <p className="text-sm text-[#61896b] font-bold">Mỹ Tho, Tiền Giang, Việt Nam</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <h3 className="text-[10px] font-black text-[#61896b] uppercase tracking-[0.2em] mb-6">Trang phục</h3>
                                            <div className="flex gap-4">
                                                <div className="bg-[#D4AF37] size-14 rounded-2xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/30 transition-transform group-hover:-rotate-12">
                                                    <span className="material-symbols-outlined text-white text-3xl">apparel</span>
                                                </div>
                                                <div>
                                                    <p className="font-black text-[#111813] text-lg leading-tight mb-1">Lễ hội / Tự do</p>
                                                    <p className="text-sm text-[#61896b] font-bold">Khuyến nghị phong cách Nông trại</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - RSVP & Info */}
                            <div className="flex flex-col gap-8">
                                {/* RSVP Card */}
                                <div className="bg-white p-8 rounded-[40px] border-2 border-[#13ec49] shadow-2xl shadow-[#13ec49]/10 sticky top-24 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 size-32 bg-[#13ec49]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                    <h3 className="text-2xl font-black mb-3 tracking-tight">Đăng ký ngay!</h3>
                                    <p className="text-[#61896b] text-sm font-bold mb-8 leading-relaxed">Tham gia cùng chúng tôi để có một trải nghiệm đáng nhớ nhất trong năm!</p>
                                    <button
                                        onClick={handleJoin}
                                        disabled={joining || isUserJoined}
                                        className={`w-full ${isUserJoined ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#13ec49] hover:bg-[#13ec49]/90 text-black shadow-[#13ec49]/30 active:scale-95'} h-16 rounded-3xl font-black text-lg transition-all flex items-center justify-center gap-3 group mb-4 shadow-xl`}
                                    >
                                        {isUserJoined ? 'Bạn đã trong danh sách' : joining ? 'Đang thực hiện...' : 'Tham gia ngay'}
                                        <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">{isUserJoined ? 'check' : 'celebration'}</span>
                                    </button>
                                    <button className="w-full bg-slate-50 hover:bg-slate-100 text-[#111813] font-bold h-14 rounded-2xl transition-all active:scale-95 border border-slate-100">
                                        Tôi quan tâm
                                    </button>
                                </div>

                                {/* Pro Tip */}
                                <div className="bg-slate-900 p-8 rounded-[40px] relative overflow-hidden group shadow-2xl transform hover:-translate-y-2 transition-transform">
                                    <div className="absolute top-0 right-0 size-24 bg-[#D4AF37]/20 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                    <h4 className="font-black text-[#D4AF37] flex items-center gap-2 mb-4 uppercase tracking-widest text-xs">
                                        <span className="material-symbols-outlined text-xl">stars</span>
                                        Vườn Nhà Mình Tip
                                    </h4>
                                    <p className="text-sm text-slate-300 font-bold leading-loose italic">
                                        "Hãy mang theo máy ảnh của bạn để lưu lại những khoảnh khắc tuyệt đẹp cùng các chuyên gia của chúng tôi tại sự kiện này!"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>

            <style>
                {`
                    .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .hide-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>
        </div>
    );
};

export default EventDetail;

