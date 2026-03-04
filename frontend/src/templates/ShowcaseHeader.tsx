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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleProfileClick = () => {
        if (isAuthenticated) {
            navigate('/profile');
        } else {
            navigate('/login');
        }
        setIsMobileMenuOpen(false);
    };

    const navLinks = [
        { to: '/showcase', label: 'Trang chủ' },
        { to: '/showcase/products', label: 'Sản phẩm' },
        { to: '/showcase/events', label: 'Sự kiện' },
        { to: '/showcase/blog', label: 'Tin tức' },
    ];

    return (
        <header className="border-b border-solid border-b-[#e5e9e6] bg-white sticky top-0 z-50">
            <div className="flex items-center justify-between whitespace-nowrap px-4 md:px-10 py-3">
                {/* Logo */}
                <Link to="/showcase" className="flex items-center gap-3 text-[#111813] hover:opacity-80 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
                    <img src={logoWeb} alt="Vườn Nhà Mình Logo" className="size-10 md:size-14 object-contain" />
                    <h2 className="text-base md:text-lg font-bold leading-tight tracking-[-0.015em]">Vườn Nhà Mình</h2>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-9">
                    {navLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`text-sm leading-normal transition-colors ${isActive(link.to) ? 'text-[#13ec49] font-bold' : 'text-[#111813] font-medium hover:text-[#13ec49]'}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {user?.role === 'SUPER_ADMIN' && (
                        <Link
                            to="/dashboard"
                            className="text-sm leading-normal font-bold text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                            Trang quản trị
                        </Link>
                    )}
                </div>

                {/* Right: Search + Notif + Avatar + Mobile Toggle */}
                <div className="flex flex-1 justify-end gap-2 md:gap-8 items-center">
                    {/* Desktop Search */}
                    <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-64">
                        <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                            <div className="text-[#61896b] flex border-none bg-[#f0f4f1] items-center justify-center pl-4 rounded-l-xl border-r-0">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </div>
                            <input
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111813] focus:outline-0 focus:ring-0 border-none bg-[#f0f4f1] focus:border-none h-full placeholder:text-[#61896b] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                                placeholder={placeholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm?.(e.target.value)}
                            />
                        </div>
                    </label>

                    {/* Notification */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className={`relative p-2 transition-colors rounded-xl ${isNotifOpen ? 'bg-[#13ec49]/10 text-[#13ec49]' : 'text-slate-400 hover:text-[#13ec49] hover:bg-slate-50'}`}
                        >
                            <span className="material-symbols-outlined text-[22px]">notifications</span>
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center animate-pulse">
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
                            <span className="text-sm font-semibold text-slate-700 leading-none group-hover:text-[#13ec49] transition-colors">{displayName}</span>
                        </div>
                        <div className="size-9 md:size-10 rounded-full border-2 border-[#13ec49] p-0.5 shadow-sm overflow-hidden group-hover:scale-110 transition-all">
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

                    {/* Mobile hamburger button */}
                    <button
                        className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-[#13ec49] transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className="material-symbols-outlined text-[24px]">
                            {isMobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 pb-4 pt-1 flex flex-col gap-1 border-t border-[#e5e9e6] bg-white">
                    {/* Mobile Search */}
                    {setSearchTerm && (
                        <div className="flex items-center rounded-xl bg-[#f0f4f1] px-3 py-2 gap-2 mt-2 mb-1">
                            <span className="material-symbols-outlined text-[#61896b] text-[20px]">search</span>
                            <input
                                className="flex-1 bg-transparent outline-none text-sm text-[#111813] placeholder:text-[#61896b]"
                                placeholder={placeholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm?.(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Nav links */}
                    {navLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${isActive(link.to)
                                ? 'bg-[#13ec49]/10 text-[#13ec49] font-bold'
                                : 'text-[#111813] hover:bg-[#f0f4f1] hover:text-[#13ec49]'
                                }`}
                        >
                            {link.label}
                            {isActive(link.to) && <span className="ml-auto material-symbols-outlined text-[16px]">check</span>}
                        </Link>
                    ))}

                    {user?.role === 'SUPER_ADMIN' && (
                        <Link
                            to="/dashboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-orange-600 hover:bg-orange-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                            Trang quản trị
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default ShowcaseHeader;
