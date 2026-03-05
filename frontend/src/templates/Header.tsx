import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { getMediaUrl } from '../services/products.service';
import NotificationDropdown from '../components/NotificationDropdown';
import { useSidebar } from '@/src/contexts/SidebarContext';

const Header: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toggleCollapsed, toggleMobileMenu } = useSidebar();

    // Default values for Guest
    const displayName = user?.full_name || user?.name || 'Du khách';
    const avatarUrl = user?.avatar_id
        ? getMediaUrl(user.avatar_id)
        : (user?.avatar || `https://ui-avatars.com/api/?name=Du+Khach&background=13ec49&color=fff`);

    const handleProfileClick = () => {
        navigate('/profile');
    };

    const [isNotifOpen, setIsNotifOpen] = React.useState(false);
    const [unreadCount, setUnreadCount] = React.useState(0);

    return (
        <header className="h-12 bg-white border-b border-slate-200 px-3 flex items-center justify-between shrink-0 sticky top-0 z-20 transition-all duration-300">
            <div className="flex items-center gap-2">
                {/* Mobile Toggle */}
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>

                {/* Desktop Toggle */}
                <button
                    onClick={toggleCollapsed}
                    className="hidden md:flex p-2 text-slate-400 hover:text-[#13ec49] hover:bg-slate-50 rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined">menu_open</span>
                </button>

                <div className="relative hidden lg:block">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                        type="text"
                        className="bg-slate-100/50 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm w-96 focus:ring-2 focus:ring-[#13ec49]/50 transition-all outline-none text-slate-600 placeholder:text-slate-400"
                        placeholder="Search"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button
                    onClick={() => navigate('/showcase')}
                    className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-white border border-slate-200 text-slate-600 rounded-lg md:rounded-xl hover:border-[#13ec49] hover:text-[#13ec49] transition-all text-[10px] md:text-xs font-bold shrink-0"
                >
                    <span className="material-symbols-outlined text-[18px] md:text-[20px]">visibility</span>
                    <span className="hidden sm:inline">Trang Showcase</span>
                </button>
                <div className="relative">
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className={`relative p-2 transition-colors rounded-xl ${isNotifOpen ? 'bg-[#13ec49]/10 text-[#13ec49]' : 'text-slate-400 hover:text-[#13ec49] hover:bg-slate-50'}`}
                    >
                        <span className="material-symbols-outlined">notifications</span>
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
                <div
                    className="hidden lg:flex items-center gap-3 cursor-pointer group"
                    onClick={handleProfileClick}
                >
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-700 leading-none group-hover:text-[#13ec49] transition-colors">{displayName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) : 'Khách'}</span>
                    </div>
                    <div className="size-10 rounded-full border-2 border-[#13ec49] p-0.5 shadow-sm overflow-hidden group-hover:scale-110 transition-all">
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

                <div className="flex items-center gap-3">

                </div>
            </div>
        </header>
    );
};

export default Header;

