import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { getMediaUrl } from '../services/products.service';
import logoWeb from '../assets/logo_web.png';
import NotificationDropdown from '../components/NotificationDropdown';

interface ShowcaseHeaderProps {
    searchTerm?: string;
    setSearchTerm?: (value: string) => void;
    placeholder?: string;
}

const ShowcaseHeader: React.FC<ShowcaseHeaderProps> = ({
    searchTerm = '',
    setSearchTerm,
    placeholder = 'Search'
}) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const displayName = user?.full_name || user?.name || 'Du khách';
    const avatarUrl = user?.avatar_id
        ? getMediaUrl(user.avatar_id)
        : (user?.avatar || `https://ui-avatars.com/api/?name=Du+Khach&background=13ec49&color=fff`);

    const isActive = (path: string) => location.pathname === path;

    const [isNotifOpen, setIsNotifOpen] = React.useState(false);
    const [unreadCount, setUnreadCount] = React.useState(0);

    const handleProfileClick = () => {
        if (isAuthenticated) {
            navigate('/profile');
        } else {
            navigate('/login');
        }
    };

    const navLinks = [
        { to: '/showcase', label: 'Trang chủ' },
        { to: '/showcase/products', label: 'Sản phẩm' },
        { to: '/showcase/events', label: 'Sự kiện' },
        { to: '/showcase/blog', label: 'Tin tức' },
    ];

    return (
        <header className="border-b border-solid border-b-[#e5e9e6] bg-white sticky top-0 z-50">
            <div className="flex items-center gap-2 px-3 md:px-10 py-2.5 md:py-3">

                {/* Logo */}
                <Link to="/showcase" className="flex items-center gap-2 text-[#111813] hover:opacity-80 transition-opacity shrink-0">
                    <img src={logoWeb} alt="Vườn Nhà Mình Logo" className="size-9 md:size-12 object-contain" />
                    <span className="text-sm md:text-base font-bold leading-tight tracking-tight hidden sm:block">Vườn Nhà Mình</span>
                </Link>

                {/* Nav Links - scrollable on mobile, fills the middle space */}
                <nav className="flex-1 flex items-center overflow-x-auto no-scrollbar gap-1 px-1 md:px-4">
                    {navLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`shrink-0 text-xs md:text-sm px-2.5 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${isActive(link.to)
                                    ? 'bg-[#13ec49]/10 text-[#13ec49] font-bold'
                                    : 'text-[#111813] hover:bg-[#f0f4f1] hover:text-[#13ec49]'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {user?.role === 'SUPER_ADMIN' && (
                        <Link
                            to="/dashboard"
                            className="shrink-0 flex items-center gap-1 text-xs md:text-sm px-2.5 py-1.5 rounded-lg font-bold text-orange-600 hover:bg-orange-50 transition-colors whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                            <span className="hidden sm:inline">Quản trị</span>
                        </Link>
                    )}
                </nav>

                {/* Right: Search (desktop) + Notif + Avatar */}
                <div className="flex items-center gap-1.5 shrink-0">
                    {/* Desktop Search */}
                    {setSearchTerm && (
                        <label className="hidden md:flex flex-col min-w-32 !h-9 max-w-52">
                            <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                                <div className="text-[#61896b] flex border-none bg-[#f0f4f1] items-center justify-center pl-3 rounded-l-xl border-r-0">
                                    <span className="material-symbols-outlined text-[18px]">search</span>
                                </div>
                                <input
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111813] focus:outline-0 focus:ring-0 border-none bg-[#f0f4f1] focus:border-none h-full placeholder:text-[#61896b] px-3 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal"
                                    placeholder={placeholder}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm?.(e.target.value)}
                                />
                            </div>
                        </label>
                    )}

                    {/* Notification */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className={`relative p-1.5 transition-colors rounded-xl ${isNotifOpen ? 'bg-[#13ec49]/10 text-[#13ec49]' : 'text-slate-400 hover:text-[#13ec49] hover:bg-slate-50'}`}
                        >
                            <span className="material-symbols-outlined text-[22px]">notifications</span>
                            {unreadCount > 0 && (
                                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>
                        <NotificationDropdown
                            isOpen={isNotifOpen}
                            onClose={() => setIsNotifOpen(false)}
                            onUnreadCountChange={setUnreadCount}
                        />
                    </div>

                    {/* Avatar */}
                    <div
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={handleProfileClick}
                    >
                        <div className="hidden lg:flex flex-col items-end">
                            <span className="text-xs font-semibold text-slate-700 leading-none group-hover:text-[#13ec49] transition-colors">{displayName}</span>
                        </div>
                        <div className="size-8 md:size-9 rounded-full border-2 border-[#13ec49] p-0.5 shadow-sm overflow-hidden group-hover:scale-110 transition-all">
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                    const target = e.currentTarget;
                                    if (target.getAttribute('data-error-handled')) return;
                                    target.setAttribute('data-error-handled', 'true');
                                    target.src = 'https://ui-avatars.com/api/?name=Du+Khach&background=13ec49&color=fff';
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ShowcaseHeader;
