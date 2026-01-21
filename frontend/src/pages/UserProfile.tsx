import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';

const UserProfile: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Default values if data is missing
    const displayName = user?.name || 'John Doe';
    const email = user?.email || 'user@example.com';
    const role = user?.role || 'Farm Manager';
    const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=13ec49&color=fff&size=128`;

    return (
        <div className="bg-[#f6f8f6] min-h-screen flex flex-col font-['Plus_Jakarta_Sans',_sans-serif]">
            {/* Header removed as requested */}


            <div className="flex flex-1 justify-center py-8 px-4 md:px-10 lg:px-40">
                <div className="layout-content-container flex flex-col max-w-[1024px] flex-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <Link to="/dashboard" className="text-slate-500 text-sm font-medium leading-normal hover:underline">Tổng quan</Link>
                        <span className="text-slate-400 text-sm font-medium leading-normal">/</span>
                        <span className="text-slate-900 text-sm font-medium leading-normal">Hồ sơ cá nhân</span>
                    </div>

                    {/* Profile Header Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full">
                                <div className="relative group">
                                    <div className="aspect-square rounded-full h-32 w-32 ring-4 ring-[#13ec49]/20 overflow-hidden border-4 border-white shadow-lg shadow-[#13ec49]/10 transition-transform duration-500 hover:scale-105">
                                        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                                    </div>
                                    <button className="absolute bottom-0 right-0 bg-[#13ec49] text-slate-900 p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-4 border-white">
                                        <span className="material-symbols-outlined text-base">photo_camera</span>
                                    </button>
                                </div>
                                <div className="flex flex-col justify-center text-center md:text-left grow">
                                    <h1 className="text-slate-900 text-3xl font-bold leading-tight tracking-[-0.015em]">{displayName}</h1>
                                    <p className="text-slate-500 text-base font-normal leading-normal">{role} • Since 2021</p>
                                    <div className="flex items-center justify-center md:justify-start gap-2 mt-1 text-slate-500">
                                        <span className="material-symbols-outlined text-sm">location_on</span>
                                        <span className="text-sm">Central Valley Farm, CA</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                                        <span className="bg-[#13ec49]/10 text-slate-900 text-xs font-bold px-3 py-1 rounded-full border border-[#13ec49]/20 uppercase tracking-tighter">Active Owner</span>
                                        <span className="bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1 rounded-full border border-slate-200">3 Connected Farms</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex w-full md:w-auto gap-3 flex-col sm:flex-row shrink-0 mt-4 md:mt-0">
                                <button className="flex min-w-[120px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-12 px-5 bg-[#13ec49] text-slate-900 text-sm font-bold leading-normal tracking-[0.015em] hover:shadow-lg hover:shadow-[#13ec49]/30 transition-all hover:scale-[1.02] active:scale-95">
                                    <span className="material-symbols-outlined">edit</span>
                                    <span className="truncate">Edit Profile</span>
                                </button>
                                <button
                                    onClick={() => {
                                        logout();
                                        navigate('/showcase');
                                    }}
                                    className="flex min-w-[120px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-12 px-5 bg-rose-50 text-rose-600 text-sm font-bold leading-normal tracking-[0.015em] border border-rose-100 hover:bg-rose-100 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined">logout</span>
                                    <span className="truncate">Log Out</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Details Container */}
                    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
                        {/* Information Content Area */}
                        <div className="flex flex-col gap-6">
                            {/* Personal Information Section */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <h2 className="text-slate-900 text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-[#13ec49] rounded-full"></span>
                                    Personal Information
                                </h2>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-1.5 group">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-[#13ec49] transition-colors">Full Name</label>
                                            <div className="text-slate-900 text-base font-medium p-3.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-[#13ec49]/30 transition-colors shadow-inner">
                                                {displayName}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5 group">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-[#13ec49] transition-colors">Phone Number</label>
                                            <div className="text-slate-900 text-base font-medium p-3.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-[#13ec49]/30 transition-colors shadow-inner">
                                                +1 (555) 123-4567
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5 group">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-[#13ec49] transition-colors">Email Address</label>
                                        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-[#13ec49]/30 transition-colors shadow-inner">
                                            <span className="text-slate-900 text-base font-medium">{email}</span>
                                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                                <span className="material-symbols-outlined text-base">verified</span>
                                                <span className="text-[10px] font-bold uppercase tracking-tight">Verified</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5 group">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-[#13ec49] transition-colors">Bio / Notes</label>
                                        <div className="text-slate-600 text-sm leading-relaxed p-3.5 bg-slate-50 rounded-xl border border-slate-100 min-h-[100px] group-hover:border-[#13ec49]/30 transition-colors shadow-inner">
                                            Managing the Central Valley organic crops since 2021. Specializing in sustainable irrigation and automated harvest tracking.
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Branding */}
            <footer className="mt-auto py-10 text-center border-t border-slate-100 bg-white">
                <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
                    <span className="material-symbols-outlined text-[18px]">agriculture</span>
                    <p className="text-sm font-medium">© 2024 FarmTrack Management Systems</p>
                </div>
                <p className="text-slate-300 text-xs">Empowering farmers with smart digital tools.</p>
            </footer>
        </div>
    );
};

export default UserProfile;
