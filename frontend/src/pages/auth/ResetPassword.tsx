import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { showcaseResetPassword } from '@/src/services/auth.service';
import logoWeb from '../../assets/logo_web.png';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (!token) {
            setError('Token không hợp lệ hoặc đã thiếu');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await showcaseResetPassword({ token, password });
            if (result.success) {
                setMessage(result.message);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(result.message || 'Đã xảy ra lỗi');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f6f8f6] p-6">
                <div className="max-w-md w-full bg-white p-8 rounded-[40px] shadow-2xl text-center">
                    <span className="material-symbols-outlined text-6xl text-rose-500 mb-4">error</span>
                    <h1 className="text-2xl font-black mb-4">Liên kết không hợp lệ</h1>
                    <p className="text-[#61896b] font-bold mb-6">Liên kết khôi phục mật khẩu này không hợp lệ hoặc đã hết hạn.</p>
                    <Link to="/login" className="inline-block px-8 py-4 bg-[#13ec49] text-black font-black rounded-2xl">QUAY LẠI ĐĂNG NHẬP</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f6f8f6] min-h-screen flex flex-col font-['Plus_Jakarta_Sans',_sans-serif]">
            {/* Minimal Header */}
            <header className="flex items-center justify-between px-6 md:px-10 py-6">
                <Link to="/showcase" className="flex items-center gap-2 group">
                    <img src={logoWeb} alt="Vườn Nhà Mình Logo" className="size-20 object-contain group-hover:scale-110 transition-transform" />
                    <div>
                        <h2 className="text-[#111813] text-xl font-black leading-none tracking-tight">Vườn Nhà Mình</h2>
                        <span className="text-[10px] font-black text-[#61896b] uppercase tracking-widest leading-none">Hệ thống quản lý</span>
                    </div>
                </Link>
                <Link to="/login" className="text-sm font-bold text-[#61896b] hover:text-[#13ec49] transition-colors flex items-center gap-1 group">
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>
                    Hủy bỏ
                </Link>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] pointer-events-none opacity-40">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#13ec49]/30 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-200/40 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                {/* Card */}
                <div className="w-full max-w-[480px] bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white p-8 md:p-12 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex flex-col items-center mb-10">
                        <h1 className="text-[#111813] text-4xl font-black leading-tight tracking-tight mb-3">Đặt lại mật khẩu</h1>
                        <p className="text-[#61896b] text-base font-bold text-center leading-relaxed italic opacity-80">Nhập mật khẩu mới cho tài khoản của bạn</p>

                        {error && (
                            <div className="mt-6 flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm w-full font-bold animate-in fade-in zoom-in duration-300">
                                <span className="material-symbols-outlined text-xl">error</span>
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="mt-6 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-sm w-full font-bold animate-in fade-in zoom-in duration-300">
                                <span className="material-symbols-outlined text-xl">check_circle</span>
                                {message}
                            </div>
                        )}
                    </div>

                    {!message ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Password Field */}
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-[#61896b] uppercase tracking-[0.2em] ml-2 block transition-colors group-focus-within:text-[#13ec49]">Mật khẩu mới</label>
                                <div className="relative">
                                    <input
                                        className="w-full rounded-2xl bg-[#f0f4f1] border-2 border-transparent focus:bg-white focus:border-[#13ec49] h-14 text-[#111813] font-bold px-6 pr-14 transition-all placeholder:text-[#61896b]/40 outline-none"
                                        placeholder="••••••••"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#61896b] opacity-40 hover:opacity-100 transition-all"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-[#61896b] uppercase tracking-[0.2em] ml-2 block transition-colors group-focus-within:text-[#13ec49]">Xác nhận mật khẩu mới</label>
                                <div className="relative">
                                    <input
                                        className="w-full rounded-2xl bg-[#f0f4f1] border-2 border-transparent focus:bg-white focus:border-[#13ec49] h-14 text-[#111813] font-bold px-6 transition-all placeholder:text-[#61896b]/40 outline-none"
                                        placeholder="••••••••"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#61896b] opacity-40 group-focus-within:opacity-100 group-focus-within:text-[#13ec49] transition-all">key</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                className="w-full h-16 rounded-2xl bg-[#13ec49] text-black text-lg font-black shadow-xl shadow-[#13ec49]/20 hover:bg-[#13ec49]/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                <span>{isSubmitting ? 'ĐANG CẬP NHẬT...' : 'CẬP NHẬT MẬT KHẨU'}</span>
                                {!isSubmitting && <span className="material-symbols-outlined">update</span>}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center">
                            <p className="text-[#61896b] font-bold mb-4 italic">Đang chuyển hướng về trang đăng nhập...</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Premium Footer */}
            <footer className="py-10 text-center relative z-10">
                <div className="flex justify-center gap-8 mb-4 font-black">
                    <Link className="text-[10px] text-[#61896b] uppercase tracking-widest hover:text-[#13ec49] transition-colors" to="/showcase/privacy-policy">Chính sách</Link>
                    <Link className="text-[10px] text-[#61896b] uppercase tracking-widest hover:text-[#13ec49] transition-colors" to="/showcase/terms-of-service">Điều khoản</Link>
                </div>
                <p className="text-[#61896b] text-[10px] font-bold opacity-50 italic">© 2026 Vườn Nhà Mình. Đất lành, trái ngọt.</p>
            </footer>
        </div>
    );
};

export default ResetPassword;
