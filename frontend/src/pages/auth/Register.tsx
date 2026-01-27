import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { showcaseRegister } from '@/src/services/auth.service';
import logoWeb from '../../assets/logo_web.png';

const Register: React.FC = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await showcaseRegister({
                full_name: fullName,
                email,
                password
            });

            if (result.success) {
                const userData = {
                    ...result.data.user,
                    name: result.data.user.full_name
                };
                login(userData);
                localStorage.setItem('farm_token', result.data.token);
                navigate('/dashboard');
            } else {
                setError(result.message || 'Đăng ký thất bại');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đã xảy ra lỗi khi đăng ký');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    Bạn đã có tài khoản?
                    <span className="text-[#13ec49] ml-1">Đăng nhập</span>
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
                </Link>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] pointer-events-none opacity-40">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#13ec49]/30 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-200/40 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                {/* Register Card */}
                <div className="w-full max-w-[540px] bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white p-8 md:p-12 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex flex-col items-center mb-10">
                        <h1 className="text-[#111813] text-4xl font-black leading-tight tracking-tight mb-3">Tạo tài khoản</h1>
                        <p className="text-[#61896b] text-base font-bold text-center leading-relaxed italic opacity-80">Bắt đầu hành trình nông nghiệp hiện đại của bạn</p>

                        {error && (
                            <div className="mt-6 flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm w-full font-bold animate-in fade-in zoom-in duration-300">
                                <span className="material-symbols-outlined text-xl">error</span>
                                {error}
                            </div>
                        )}
                    </div>

                    <form className="space-y-6" onSubmit={handleRegister}>
                        {/* Name Field */}
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-[#61896b] uppercase tracking-[0.2em] ml-2 block transition-colors group-focus-within:text-[#13ec49]">Họ và tên</label>
                            <div className="relative">
                                <input
                                    className="w-full rounded-2xl bg-[#f0f4f1] border-2 border-transparent focus:bg-white focus:border-[#13ec49] h-14 text-[#111813] font-bold px-6 transition-all placeholder:text-[#61896b]/40 outline-none"
                                    placeholder="VD: Nguyễn Văn A"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#61896b] opacity-40 group-focus-within:opacity-100 group-focus-within:text-[#13ec49] transition-all">person</span>
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-[#61896b] uppercase tracking-[0.2em] ml-2 block transition-colors group-focus-within:text-[#13ec49]">Email đăng ký</label>
                            <div className="relative">
                                <input
                                    className="w-full rounded-2xl bg-[#f0f4f1] border-2 border-transparent focus:bg-white focus:border-[#13ec49] h-14 text-[#111813] font-bold px-6 transition-all placeholder:text-[#61896b]/40 outline-none"
                                    placeholder="your@email.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#61896b] opacity-40 group-focus-within:opacity-100 group-focus-within:text-[#13ec49] transition-all">alternate_email</span>
                            </div>
                        </div>

                        {/* Passwords Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-[#61896b] uppercase tracking-[0.2em] ml-2 block">Mật khẩu</label>
                                <input
                                    className="w-full rounded-2xl bg-[#f0f4f1] border-2 border-transparent focus:bg-white focus:border-[#13ec49] h-14 text-[#111813] font-bold px-6 transition-all placeholder:text-[#61896b]/40 outline-none"
                                    placeholder="••••••••"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-[#61896b] uppercase tracking-[0.2em] ml-2 block">Xác nhận</label>
                                <input
                                    className="w-full rounded-2xl bg-[#f0f4f1] border-2 border-transparent focus:bg-white focus:border-[#13ec49] h-14 text-[#111813] font-bold px-6 transition-all placeholder:text-[#61896b]/40 outline-none"
                                    placeholder="••••••••"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-3 px-2">
                            <input className="mt-1 accent-[#13ec49] h-4 w-4 border-[#dbe6de]" id="terms" type="checkbox" required />
                            <label className="text-xs text-[#61896b] font-bold italic" htmlFor="terms">
                                Tôi đồng ý với <a className="text-[#13ec49] underline" href="#">Điều khoản dịch vụ</a> và <a className="text-[#13ec49] underline" href="#">Chính sách bảo mật</a> của Vườn Nhà Mình.
                            </label>
                        </div>

                        {/* Register Button */}
                        <button
                            className="w-full h-16 rounded-2xl bg-[#13ec49] text-black text-lg font-black shadow-xl shadow-[#13ec49]/20 hover:bg-[#13ec49]/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            <span>{isSubmitting ? 'ĐANG KHỞI TẠO...' : 'TẠO TÀI KHOẢN NGAY'}</span>
                            {!isSubmitting && <span className="material-symbols-outlined">how_to_reg</span>}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-10">
                        <div className="flex-1 h-[2px] bg-[#f0f4f1]"></div>
                        <span className="px-4 text-[10px] font-black text-[#61896b] uppercase tracking-[0.3em]">Hoặc với</span>
                        <div className="flex-1 h-[2px] bg-[#f0f4f1]"></div>
                    </div>

                    {/* Social Logins */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center h-14 rounded-2xl border-2 border-[#f0f4f1] hover:border-[#13ec49]/30 hover:bg-[#13ec49]/5 transition-all active:scale-95 group">
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                            </svg>
                        </button>
                        <button className="flex items-center justify-center h-14 rounded-2xl border-2 border-[#f0f4f1] hover:border-[#13ec49]/30 hover:bg-[#13ec49]/5 transition-all active:scale-95 group">
                            <svg className="w-6 h-6 text-[#1877F2] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                            </svg>
                        </button>
                    </div>
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

export default Register;
