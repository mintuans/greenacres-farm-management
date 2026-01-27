import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ShowcaseHeader from '../../templates/ShowcaseHeader';
import { getPublicEvents, ShowcaseEvent } from '../../services/events.service';
import { getMediaUrl } from '../../services/products.service';
import logoWeb from '../../assets/logo_web.png';

const ShowcaseEvents: React.FC = () => {
    const [events, setEvents] = useState<ShowcaseEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const response = await getPublicEvents();
            if (response.success) {
                setEvents(response.data);
            }
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit'
        });
    };

    const formatFullDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const featuredEvent = events.length > 0 ? events[0] : null;
    const upcomingEvents = events.length > 1 ? events.slice(1) : [];

    return (
        <div className="bg-[#f0f4f2] min-h-screen flex flex-col font-['Plus_Jakarta_Sans',_sans-serif]">
            <ShowcaseHeader />

            <main className="max-w-[1200px] mx-auto px-4 md:px-10 py-12 w-full flex-1">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="size-16 border-4 border-[#13ec49] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-[#61896b] font-bold">Đang tải những sự kiện đặc sắc...</p>
                    </div>
                ) : !featuredEvent ? (
                    <div className="text-center py-24 bg-white rounded-[2rem] shadow-sm border border-slate-100">
                        <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">calendar_today</span>
                        <h2 className="text-2xl font-bold text-[#111813]">Hiện chưa có sự kiện nào</h2>
                        <p className="text-[#61896b] mt-2">Hãy quay lại sau để cập nhật các sự kiện mới nhất từ Vườn Nhà Mình!</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-12">
                        {/* FEATURED EVENT SECTION */}
                        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/50 border border-white flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Left: Image */}
                            <div className="md:w-1/2 relative h-[300px] md:h-auto overflow-hidden">
                                <img
                                    src={featuredEvent.banner_id ? getMediaUrl(featuredEvent.banner_id) : 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'}
                                    className="w-full h-full object-cover"
                                    alt={featuredEvent.title}
                                />
                                <div className="absolute top-6 left-6 flex gap-2">
                                    <span className="bg-[#13ec49] text-black text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">Featured</span>
                                    <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">Social Event</span>
                                </div>
                            </div>

                            {/* Right: Info */}
                            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                <div className="flex items-center gap-2 text-[#13ec49] mb-4">
                                    <img src={logoWeb} alt="Logo" className="size-5 object-contain" />
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">Festive Gathering</span>
                                </div>
                                <h2 className="text-[#111813] text-3xl md:text-5xl font-black leading-tight mb-6">
                                    {featuredEvent.title}
                                </h2>
                                <div className="flex flex-wrap gap-6 mb-8 text-slate-500 font-bold text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                                        {formatDate(featuredEvent.event_date)}, {formatTime(featuredEvent.event_date)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">location_on</span>
                                        {featuredEvent.location || 'Main Community Barn'}
                                    </div>
                                </div>
                                <p className="text-slate-500 leading-relaxed mb-10 text-lg">
                                    {featuredEvent.description || 'Celebrate the harvest and toast to the new year with gourmet farm-to-table food, live bluegrass music, and our signature giant bonfire.'}
                                </p>

                                <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Who's coming?</span>
                                        <div className="flex items-center">
                                            <div className="flex -space-x-3 overflow-hidden">
                                                {featuredEvent.participants.slice(0, 4).map((p) => {
                                                    const colorMap: any = {
                                                        green: 'bg-[#13ec49] text-black',
                                                        yellow: 'bg-[#D4AF37] text-white',
                                                        blue: 'bg-blue-400 text-white',
                                                        purple: 'bg-purple-400 text-white',
                                                        pink: 'bg-pink-400 text-white'
                                                    };
                                                    const themeClass = colorMap[p.color_theme || 'green'] || colorMap.green;

                                                    return (
                                                        <div key={p.id} className="inline-block relative">
                                                            {p.avatar_id ? (
                                                                <img
                                                                    className="size-10 rounded-full ring-2 ring-white object-cover"
                                                                    src={getMediaUrl(p.avatar_id)}
                                                                    alt={p.full_name}
                                                                />
                                                            ) : (
                                                                <div className={`size-10 rounded-full ${themeClass} ring-2 ring-white flex items-center justify-center font-black text-xs`}>
                                                                    {p.full_name.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                {featuredEvent.participants.length > 4 && (
                                                    <div className="flex items-center justify-center size-10 rounded-full bg-slate-100 ring-2 ring-white text-slate-500 text-xs font-black">
                                                        +{featuredEvent.participants.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="ml-4 text-xs font-bold text-slate-400">Bạn bè & Người thân</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/showcase/events/${featuredEvent.id}`)}
                                        className="bg-[#13ec49] hover:bg-[#20bd4a] text-black font-black px-10 py-5 rounded-2xl shadow-xl shadow-[#13ec49]/20 transition-all active:scale-95 group"
                                    >
                                        Join Event
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* UPCOMING WORKSHOPS SECTION */}
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[#111813] text-2xl font-black">Sự kiện khác</h3>
                                <button className="text-[#13ec49] font-black text-xs uppercase tracking-wider hover:underline">View All</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {upcomingEvents.length > 0 ? (
                                    upcomingEvents.map((ev) => (
                                        <div key={ev.id} className="bg-white rounded-[2rem] overflow-hidden shadow-lg shadow-gray-200/30 border border-slate-50 group hover:-translate-y-2 transition-all duration-300">
                                            <div className="relative h-64 h-overflow-hidden">
                                                <img
                                                    src={ev.banner_id ? getMediaUrl(ev.banner_id) : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    alt={ev.title}
                                                />
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                                                    <span className="text-[#111813] text-[10px] font-black uppercase tracking-wider">{formatDate(ev.event_date)}</span>
                                                </div>
                                            </div>
                                            <div className="p-8">
                                                <span className="text-[#13ec49] text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Soil Health</span>
                                                <h4 className="text-[#111813] text-xl font-black mb-3 line-clamp-2 leading-snug group-hover:text-[#13ec49] transition-colors">{ev.title}</h4>
                                                <p className="text-slate-400 text-sm leading-relaxed mb-8 line-clamp-2">
                                                    {ev.description || 'Learn the secrets of black gold. We\'ll cover rotation, temperature, and moisture control for perfect yield.'}
                                                </p>
                                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                                    <div className="flex -space-x-2">
                                                        {ev.participants.slice(0, 2).map(p => {
                                                            const colorMap: any = {
                                                                green: 'bg-[#13ec49] text-black',
                                                                yellow: 'bg-[#D4AF37] text-white',
                                                                blue: 'bg-blue-400 text-white',
                                                                purple: 'bg-purple-400 text-white',
                                                                pink: 'bg-pink-400 text-white'
                                                            };
                                                            const themeClass = colorMap[p.color_theme || 'green'] || colorMap.green;

                                                            return (
                                                                <div key={p.id} className={`size-8 rounded-full ring-2 ring-white overflow-hidden ${themeClass}`}>
                                                                    {p.avatar_id ? (
                                                                        <img src={getMediaUrl(p.avatar_id)} className="size-full object-cover" alt="" />
                                                                    ) : (
                                                                        <div className="size-full flex items-center justify-center text-[10px] font-black">
                                                                            {p.full_name.charAt(0)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                        {ev.participants.length > 2 && (
                                                            <div className="size-8 rounded-full bg-slate-50 ring-2 ring-white flex items-center justify-center text-[8px] font-black text-slate-400">
                                                                +{ev.participants.length - 2}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/showcase/events/${ev.id}`)}
                                                        className="bg-[#f0f4f2] hover:bg-[#13ec49] text-[#111813] hover:text-black font-black text-[11px] px-6 py-2.5 rounded-full transition-all active:scale-95"
                                                    >
                                                        Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">event</span>
                                        <p className="text-slate-400 font-bold italic">Nhiều workshop hấp dẫn sắp được công bố!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t border-[#e5e9e6] bg-white py-8 px-10">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[#61896b] text-sm">
                    <div className="flex items-center gap-2">
                        <img src={logoWeb} alt="Logo" className="size-5 object-contain" />
                        <span className="font-bold text-[#111813]">Vườn Nhà Mình</span>
                        <span className="mx-2">|</span>
                        <span>© {new Date().getFullYear()} Vườn Nhà Mình. All rights reserved.</span>
                    </div>
                    <div className="flex gap-6">
                        <Link to="/showcase/privacy-policy" className="hover:text-[#13ec49] transition-colors">Chính sách bảo mật</Link>
                        <Link to="/showcase/terms-of-service" className="hover:text-[#13ec49] transition-colors">Điều khoản dịch vụ</Link>
                    </div>
                </div>
            </footer>

            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                    
                    body {
                        font-family: 'Plus_Jakarta_Sans', sans-serif;
                    }
                    
                    .line-clamp-2 {
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                `}
            </style>
        </div>
    );
};

export default ShowcaseEvents;
