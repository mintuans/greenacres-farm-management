import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginRequired: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-[#f6f8f6] min-h-screen flex flex-col font-['Plus_Jakarta_Sans',_sans-serif]">
            {/* Main Content Area */}
            <main className="flex-1 flex items-center justify-center p-6 bg-[#f6f8f6]">
                <div className="max-w-[520px] w-full bg-white rounded-xl shadow-sm border border-[#e2e8e3] overflow-hidden animate-in fade-in zoom-in duration-500">
                    {/* Empty State Component Variation */}
                    <div className="flex flex-col items-center gap-8 p-8 md:p-12">
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden flex items-center justify-center bg-[#f6f8f6] border border-dashed border-[#cbd5cb] group">
                            <div className="flex flex-col items-center gap-3 transition-transform duration-500 group-hover:scale-110">
                                <span className="material-symbols-outlined text-6xl text-[#13ec49]/40">lock_person</span>
                                <div className="h-1.5 w-24 bg-[#13ec49]/20 rounded-full"></div>
                            </div>
                            {/* Decorative background element */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#13ec49] via-transparent to-transparent pointer-events-none"></div>
                        </div>
                        <div className="flex flex-col items-center gap-3 text-center">
                            <h1 className="text-[#111813] text-2xl font-bold leading-tight tracking-tight">Please log in to see your profile</h1>
                            <p className="text-[#61896b] text-base font-normal leading-relaxed max-w-[400px]">
                                To view and manage your farm profile, track expenses, and monitor inventory, please sign in to your account.
                            </p>
                        </div>
                        <div className="flex flex-col w-full gap-3">
                            <button
                                onClick={() => navigate('/login')}
                                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-[#13ec49] text-[#111813] text-base font-bold leading-normal tracking-[0.015em] hover:scale-[1.02] transition-transform active:scale-100 shadow-md shadow-[#13ec49]/20"
                            >
                                <span className="truncate">Log In to Continue</span>
                            </button>
                            <button
                                onClick={() => navigate('/showcase')}
                                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-transparent text-[#111813] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#f6f8f6] transition-colors"
                            >
                                <span className="truncate">Back to Home</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Component */}
            <footer className="flex flex-col gap-6 px-10 py-10 text-center bg-white border-t border-[#e2e8e3]">
                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
                    <a className="text-[#61896b] text-sm font-normal hover:text-[#13ec49] transition-colors" href="#">Privacy Policy</a>
                    <a className="text-[#61896b] text-sm font-normal hover:text-[#13ec49] transition-colors" href="#">Terms of Service</a>
                    <a className="text-[#61896b] text-sm font-normal hover:text-[#13ec49] transition-colors" href="#">Help Center</a>
                    <a className="text-[#61896b] text-sm font-normal hover:text-[#13ec49] transition-colors" href="#">Contact Support</a>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-[#13ec49]/60">
                        <span className="material-symbols-outlined text-sm">agriculture</span>
                        <p className="text-[#61896b] text-sm font-normal leading-normal">© 2024 FarmTrack Management Systems</p>
                    </div>
                    <p className="text-[#61896b]/60 text-xs">Empowering farmers with smart digital tools.</p>
                </div>
            </footer>
        </div>
    );
};

export default LoginRequired;
