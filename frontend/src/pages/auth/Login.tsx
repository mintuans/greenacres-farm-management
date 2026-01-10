import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';

const Login: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock standard login
        login({
            id: '1',
            name: 'Nguyễn Văn A',
            email: 'admin@farm.com',
            role: 'admin'
        });
        navigate('/dashboard');
    };

    const handleGoogleLogin = () => {
        // Mock Google login with avatar
        login({
            id: 'google-123',
            name: 'John Doe',
            email: 'johndoe@gmail.com',
            avatar: 'https://lh3.googleusercontent.com/a/ACg8ocL_XF-y_3Z-Z-Z-Z-Z=s96-c',
            role: 'user'
        });
        navigate('/dashboard');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display">
            <div className="layout-container flex h-full grow flex-col">
                {/* Header / Navigation */}
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-gray-200 dark:border-b-gray-800 px-10 py-3 bg-white dark:bg-background-dark/50 backdrop-blur-sm sticky top-0 z-50">
                    <div className="flex items-center gap-4 text-[#111813] dark:text-white">
                        <div className="size-6 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl">potted_plant</span>
                        </div>
                        <h2 className="text-[#111813] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Farm App</h2>
                    </div>
                    <div className="flex flex-1 justify-end gap-8">
                        <div className="hidden md:flex items-center gap-9">
                            <a className="text-[#111813] dark:text-gray-300 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Features</a>
                            <a className="text-[#111813] dark:text-gray-300 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Pricing</a>
                            <a className="text-[#111813] dark:text-gray-300 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">About</a>
                        </div>
                        <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-primary text-[#111813] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 transition-all shadow-sm">
                            <span className="truncate">Contact Sales</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center p-6 relative">
                    {/* Background Decoration */}
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-10">
                        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary rounded-full blur-[80px]"></div>
                    </div>

                    {/* Login Card Container */}
                    <div className="w-full max-w-[480px] bg-white dark:bg-gray-900/50 dark:backdrop-blur-xl rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 z-10">
                        <div className="flex flex-col items-center mb-8">
                            <div className="p-3 bg-primary/10 rounded-full mb-4">
                                <span className="material-symbols-outlined text-primary text-3xl">agriculture</span>
                            </div>
                            <h1 className="text-[#111813] dark:text-white tracking-light text-[32px] font-bold leading-tight text-center">Welcome Back</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal text-center mt-2">Enter your credentials to access your farm dashboard.</p>
                        </div>

                        <form className="space-y-4" onSubmit={handleLogin}>
                            {/* Email Field */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[#111813] dark:text-gray-200 text-sm font-semibold leading-normal ml-1">Email Address</label>
                                <div className="relative">
                                    <input
                                        className="form-input flex w-full rounded-xl text-[#111813] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#dbe6de] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-14 placeholder:text-gray-400 p-[15px] text-base font-normal transition-all"
                                        placeholder="e.g. farmer@example.com"
                                        type="email"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[#111813] dark:text-gray-200 text-sm font-semibold leading-normal">Password</label>
                                    <a className="text-primary text-xs font-semibold hover:underline" href="#">Forgot password?</a>
                                </div>
                                <div className="flex w-full items-stretch rounded-xl group">
                                    <input
                                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111813] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#dbe6de] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-14 placeholder:text-gray-400 p-[15px] rounded-r-none border-r-0 text-base font-normal transition-all"
                                        placeholder="Enter your password"
                                        type={showPassword ? "text" : "password"}
                                    />
                                    <div
                                        className="text-[#61896b] flex border border-[#dbe6de] dark:border-gray-700 bg-white dark:bg-gray-800 items-center justify-center pr-[15px] rounded-r-xl border-l-0 cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Login Button */}
                            <button className="w-full flex h-14 items-center justify-center overflow-hidden rounded-xl bg-primary text-[#111813] text-base font-bold leading-normal tracking-[0.015em] hover:shadow-lg transition-all active:scale-[0.98] mt-2" type="submit">
                                <span>Log In</span>
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center my-8">
                            <div className="flex-1 border-t border-gray-200 dark:border-gray-800"></div>
                            <span className="px-4 text-gray-400 text-sm font-medium">OR CONTINUE WITH</span>
                            <div className="flex-1 border-t border-gray-200 dark:border-gray-800"></div>
                        </div>

                        {/* Social Logins */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handleGoogleLogin}
                                className="flex items-center justify-center gap-2 h-12 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                </svg>
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 h-12 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                                </svg>
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Facebook</span>
                            </button>
                        </div>

                        {/* Sign Up Link */}
                        <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-8">
                            Don't have an account?
                            <Link className="text-primary font-bold hover:underline transition-all" to="/register">Sign up for free</Link>
                        </p>
                    </div>
                </main>

                {/* Footer */}
                <footer className="p-8 text-center text-gray-400 text-sm">
                    <div className="flex justify-center gap-6 mb-4">
                        <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                        <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                        <a className="hover:text-primary transition-colors" href="#">Help Center</a>
                    </div>
                    <p>© 2024 Farm App Management Solutions. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default Login;
