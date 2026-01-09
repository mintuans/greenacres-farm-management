
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <button className="md:hidden text-slate-500">
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <div className="relative hidden lg:block">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                        type="text"
                        className="bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm w-80 focus:ring-2 focus:ring-[#13ec49]/50 transition-all outline-none"
                        placeholder="Tìm kiếm mọi thứ..."
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex bg-[#13ec49]/5 rounded-full p-1 border border-[#13ec49]/10">
                    <div className="bg-white text-xs font-bold text-[#13ec49] py-1 px-3 rounded-full shadow-sm">Phiên bản v3.2</div>
                </div>

                <button className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <button className="size-9 bg-[#13ec49] text-black rounded-xl flex items-center justify-center shadow-lg shadow-[#13ec49]/20 hover:scale-105 active:scale-95 transition-all">
                    <span className="material-symbols-outlined">add</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
