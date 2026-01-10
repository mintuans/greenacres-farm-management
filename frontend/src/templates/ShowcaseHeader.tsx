import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';

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
    const displayName = user?.name || 'Du khách';
    const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=Du+Khach&background=13ec49&color=fff`;

    const isActive = (path: string) => location.pathname === path;

    const handleProfileClick = () => {
        if (isAuthenticated) {
            navigate('/profile');
        } else {
            navigate('/login-required');
        }
    };

    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e5e9e6] bg-white px-6 md:px-10 py-3 sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <Link to="/showcase" className="flex items-center gap-4 text-[#111813] hover:opacity-80 transition-opacity">
                    <div className="size-8 rounded bg-[#13ec49]/20 flex items-center justify-center text-[#13ec49]">
                        <span className="material-symbols-outlined">agriculture</span>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">GreenAcres</h2>
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
                        to="/showcase/blog"
                        className={`text-sm leading-normal transition-colors ${isActive('/showcase/blog') ? 'text-[#13ec49] font-bold' : 'text-[#111813] font-medium hover:text-[#13ec49]'}`}
                    >
                        Tin tức
                    </Link>
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

                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={handleProfileClick}
                >
                    <div className="hidden lg:flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-700 leading-none group-hover:text-[#13ec49] transition-colors">{displayName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Khách'}</span>
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
