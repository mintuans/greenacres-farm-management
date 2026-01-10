import React from 'react';
import { Link } from 'react-router-dom';

const Register: React.FC = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111813] dark:text-white transition-colors duration-200">
            <div className="flex min-h-screen">
                {/* Left Side: Visual Branding (Desktop Only) */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDN76SobZt0EUeErvq_z1vuI0xD3LVAgEPqiFERdRE0VS5Orzb-AmQjiqWyYu6Wz6I4pSInNAKv90GpAZLpHCC5F0QX5WeGnGvQphB5oCW9RpwZYdKIWfQG1HAVCVMYzdt6SI6t4eyyjd4WvpIQiQS8pNzZ5dRNwkoj2QI50jw4q-clZoxuBgVhxTv7j2n3KgRr6K0zmGx3P3eeOPUtR_s7du0vVTU7wja3-XyPIXhycC3BUNiJaYHFPAt9yXuahH75REQIbU8w0ke0")' }}
                    >
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent"></div>
                    <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                        <div className="flex items-center gap-2 text-white">
                            <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-background-dark">
                                <span className="material-symbols-outlined font-bold">potted_plant</span>
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">AgriGrow</h2>
                        </div>
                        <div className="text-white max-w-md">
                            <h1 className="text-5xl font-extrabold leading-tight mb-6">Cultivate your success with ease.</h1>
                            <p className="text-lg text-white/80 leading-relaxed">Join over 10,000 farmers managing their expenses, inventory, and harvests in one powerful dashboard.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex -space-x-2">
                                <img alt="User" className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_2WMXLpF0ly-kYnW86c_1B-44uYnjzEwpH5udfOmr-wMzNzdFwo1D15pSAcatj_27zqLdZ4OEfhaO2DGz_URCoRB3vlf0-csC29bGSVJHbLLJY5GThuBxKezVnmFdDR9iSoXGD5ecMVqVdWIpgMDCLNKBF3H_PuAOZdc4Dt_KfWIeM4XbHCV7rYPUfrLxsS9KTa1VvHOS7FZFsQcsgo2DkE2TZMwCM_3gL-TjW7qGuW69_Yva8ZgJQB-FBQkWhmlvDGtaeFjq6Xej" />
                                <img alt="User" className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuGNgdk2Ocbz1SW-VKm700WkqnZZST_wp6XZpGxw8hre67F1cGpVH8gTJGTRJPMNmT9kztz89vezIfo4S14Y6-mGKEfzcavi4F96JCV4HM7uVinJwQkN1UfI6qSLKCaQZ9yUVQmREHuprRDkvidU8HP2_guaMzuKE3wYPt15Z80F2Bz6b1eA8jd-NIrfyWTPeDvky2F6d-M4PhU1XOdinwlIosd1oOgU7FPEvWrF0W45oJzH8uhD-ZpAYKo5Db9wdyNpXPovyOlzJH" />
                                <img alt="User" className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLN_wobeCY-G8hg0AsnPaCEK7kfxUQKiccxRf5g1tauHMG-EBrTToQxazu8DvVZWvfM__5oGBt32K8y7IdmqTdejWGzH7Q3ryqwX3a_s3769nZRVUx5zMqD_VyBWzGUkjX2hc8Xt4VQ4ZtUB5tsfkL5t00kcf7D1ZUJUsQMJuK_4QDpp33g4r6V__QgFNXdhbLQSSJk6VpRiaBkUH3Kyx_jwLnxEh7pKM4qmUiaH-1yRhjIoANp_5K5h71oC52AYTSyP4pJ1IzrGeG" />
                            </div>
                            <p className="text-sm text-white/70 self-center">Trusted by farmers worldwide</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Sign Up Form */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-24 bg-white dark:bg-background-dark">
                    <div className="w-full max-w-md">
                        {/* Mobile Header */}
                        <div className="lg:hidden flex items-center gap-2 mb-10">
                            <div className="size-8 bg-primary rounded flex items-center justify-center">
                                <span className="material-symbols-outlined text-background-dark text-lg font-bold">potted_plant</span>
                            </div>
                            <h2 className="text-xl font-bold dark:text-white">AgriGrow</h2>
                        </div>

                        <div className="mb-10">
                            <h2 className="text-3xl font-extrabold text-[#111813] dark:text-white mb-2">Create Your Account</h2>
                            <p className="text-[#61896b] dark:text-gray-400">Start managing your farm more efficiently today.</p>
                        </div>

                        {/* Social Sign Up */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button className="flex items-center justify-center gap-2 border border-[#dbe6de] dark:border-gray-700 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                </svg>
                                <span className="text-sm font-semibold dark:text-gray-200">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 border border-[#dbe6de] dark:border-gray-700 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                                </svg>
                                <span className="text-sm font-semibold dark:text-gray-200">Facebook</span>
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative mb-8">
                            <div aria-hidden="true" class="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#dbe6de] dark:border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white dark:bg-background-dark text-[#61896b] dark:text-gray-400">Or sign up with email</span>
                            </div>
                        </div>

                        {/* Form */}
                        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <label className="block text-sm font-semibold text-[#111813] dark:text-gray-300 mb-2" htmlFor="name">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-[#61896b] text-xl">person</span>
                                    </div>
                                    <input
                                        className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800/50 border border-[#dbe6de] dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-[#61896b]/60"
                                        id="name"
                                        placeholder="John Farmer"
                                        type="text"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#111813] dark:text-gray-300 mb-2" htmlFor="email">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-[#61896b] text-xl">mail</span>
                                    </div>
                                    <input
                                        className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800/50 border border-[#dbe6de] dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-[#61896b]/60"
                                        id="email"
                                        placeholder="john@farm.com"
                                        type="email"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-[#111813] dark:text-gray-300 mb-2" htmlFor="password">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-[#61896b] text-xl">lock</span>
                                        </div>
                                        <input
                                            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800/50 border border-[#dbe6de] dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-[#61896b]/60"
                                            id="password"
                                            placeholder="••••••••"
                                            type="password"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#111813] dark:text-gray-300 mb-2" htmlFor="confirm-password">Confirm Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-[#61896b] text-xl">verified_user</span>
                                        </div>
                                        <input
                                            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800/50 border border-[#dbe6de] dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-[#61896b]/60"
                                            id="confirm-password"
                                            placeholder="••••••••"
                                            type="password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 mt-6">
                                <input className="mt-1 rounded text-primary focus:ring-primary h-4 w-4 border-[#dbe6de]" id="terms" type="checkbox" />
                                <label className="text-xs text-[#61896b] dark:text-gray-400" htmlFor="terms">
                                    I agree to the <a className="text-primary font-bold hover:underline" href="#">Terms of Service</a> and <a className="text-primary font-bold hover:underline" href="#">Privacy Policy</a>.
                                </label>
                            </div>

                            <button className="w-full bg-primary hover:bg-opacity-90 text-background-dark font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 transform active:scale-[0.98] mt-4" type="submit">
                                Create My Account
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-[#61896b] dark:text-gray-400">
                                Already have an account?
                                <Link to="/login" className="text-primary font-bold hover:underline ml-1">Log In</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
