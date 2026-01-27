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

    // Default values for Guest
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

    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e5e9e6] bg-white px-6 md:px-10 py-3 sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <Link to="/showcase" className="flex items-center gap-4 text-[#111813] hover:opacity-80 transition-opacity">
                    <img src={logoWeb} alt="Vườn Nhà Mình Logo" className="size-14 object-contain" />
                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Vườn Nhà Mình</h2>
                </Link>
                <div className="hidden md:flex items-center gap-9">
                    <Link
                        to="/showcase"
                        className={`text-sm leading-normal transition-colors ${isActive('/showcase') ? 'text-[#13ec49] font-bold' : 'text-[#111813] font-medium hover:text-[#13ec49]'}`}
                    >
                        Trang chủ
                    </Link>
                    <Link
                        to="/showcase/products"
                        className={`text-sm leading-normal transition-colors ${isActive('/showcase/products') ? 'text-[#13ec49] font-bold' : 'text-[#111813] font-medium hover:text-[#13ec49]'}`}
                    >
                        Sản phẩm
                    </Link>
                    <Link
                        to="/showcase/events"
                        className={`text-sm leading-normal transition-colors ${isActive('/showcase/events') ? 'text-[#13ec49] font-bold' : 'text-[#111813] font-medium hover:text-[#13ec49]'}`}
                    >
                        Sự kiện
                    </Link>
                    <Link
                        to="/showcase/blog"
                        className={`text-sm leading-normal transition-colors ${isActive('/showcase/blog') ? 'text-[#13ec49] font-bold' : 'text-[#111813] font-medium hover:text-[#13ec49]'}`}
                    >
                        Tin tức
                    </Link>
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

            </div>
            <div className="flex flex-1 justify-end gap-4 md:gap-8 items-center">
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

                <div className="relative">
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className={`relative p-2 transition-colors rounded-xl ${isNotifOpen ? 'bg-[#13ec49]/10 text-[#13ec49]' : 'text-slate-400 hover:text-[#13ec49] hover:bg-slate-50'}`}
                    >
                        <span className="material-symbols-outlined text-[24px]">notifications</span>
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
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={handleProfileClick}
                >
                    <div className="hidden lg:flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-700 leading-none group-hover:text-[#13ec49] transition-colors">{displayName}</span>
                    </div>
                    <div className="size-10 rounded-full border-2 border-[#13ec49] p-0.5 shadow-sm overflow-hidden group-hover:scale-110 transition-all">
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                                e.currentTarget.src = 'https://ui-avatars.com/api/?name=Du+Khach&background=13ec49&color=fff';
                            }}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ShowcaseHeader;
