
import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    // Delay a bit to show the success state before entering app
    setTimeout(() => {
      onLoginSuccess();
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full max-w-md mx-auto bg-background-light dark:bg-background-dark animate-in fade-in duration-500 px-6">
        <div className="relative mb-8">
            {/* Green glow effect */}
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full"></div>
            <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <span className="material-symbols-outlined text-white text-5xl">check</span>
            </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Authentication Successful</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back, Alex Thompson</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-background-light dark:bg-background-dark overflow-hidden">
      <div className="flex items-center p-4">
        <div className="text-gray-800 dark:text-white flex size-12 items-center justify-start cursor-pointer">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
        </div>
        <h2 className="text-gray-800 dark:text-white text-lg font-bold flex-1 text-center pr-12">Login</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-6 pt-6">
        <div className="w-20 h-20 mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-4xl">inventory_2</span>
        </div>
        
        <div className="w-full text-center mb-8">
          <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight pb-1">Logistics Hub</h1>
          <p className="text-gray-500 dark:text-[#93a5c8] text-sm font-normal">Enter your credentials to access inventory</p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="flex flex-col w-full">
            <p className="text-gray-700 dark:text-white text-sm font-medium pb-2">Email or Username</p>
            <input 
              className="w-full rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-[#344465] bg-white dark:bg-[#1a2232] h-14 px-4 outline-none focus:ring-2 focus:ring-primary/50" 
              placeholder="Enter your worker ID" 
              type="text"
              required
            />
          </div>

          <div className="flex flex-col w-full">
            <p className="text-gray-700 dark:text-white text-sm font-medium pb-2">Password</p>
            <div className="relative">
              <input 
                className="w-full rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-[#344465] bg-white dark:bg-[#1a2232] h-14 px-4 outline-none focus:ring-2 focus:ring-primary/50" 
                placeholder="••••••••" 
                type="password"
                required
              />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <span className="material-symbols-outlined">visibility</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg text-lg shadow-lg shadow-primary/20 transition-all">
                Login
            </button>
          </div>

          <div className="pt-2">
            <button type="button" className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#1a2232] border border-gray-200 dark:border-[#344465] text-gray-700 dark:text-white font-semibold py-4 rounded-lg transition-all">
              <span className="material-symbols-outlined text-2xl">fingerprint</span>
              <span>Sign in with Biometrics</span>
            </button>
          </div>

          <div className="pt-2 text-center">
            <a className="text-primary font-medium hover:underline text-sm" href="#">Forgot Password?</a>
          </div>
        </form>
      </div>

      <div className="bg-background-light dark:bg-background-dark flex justify-center pb-2">
        <div className="w-32 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
      </div>
    </div>
  );
};

export default Login;
