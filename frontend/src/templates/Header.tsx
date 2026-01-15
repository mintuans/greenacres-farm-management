import React from 'react';
import { useAuth } from '@/src/contexts/AuthContext';

const Header: React.FC = () => {
    const { user } = useAuth();

    // Default values for Guest
    const displayName = user?.name || 'Du khách';
    const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=Du+Khach&background=13ec49&color=fff`;

    return (
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <button className="md:hidden text-slate-500">
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <div className="relative hidden md:block">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                        type="text"
                        className="bg-slate-100/50 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm w-96 focus:ring-2 focus:ring-[#13ec49]/50 transition-all outline-none text-slate-600 placeholder:text-slate-400"
                        placeholder="Search"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden lg:flex items-center gap-2">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-700 leading-none">{displayName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Khách'}</span>
                    </div>
                    <div className="size-10 rounded-full border-2 border-[#13ec49] p-0.5 shadow-sm overflow-hidden cursor-pointer hover:scale-105 transition-all">
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

                <div className="flex items-center gap-3">
                    <button className="relative p-2 text-slate-400 hover:text-[#13ec49] transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
