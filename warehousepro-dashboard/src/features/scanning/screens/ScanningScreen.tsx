
import React from 'react';

const ScanSKU: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="h-full flex flex-col bg-background-dark animate-in zoom-in-95 duration-300">
      <nav className="flex items-center justify-between p-4 z-20">
        <button onClick={onBack} className="text-white p-2">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h2 className="text-white font-bold">Scan SKU</h2>
        <button className="text-primary p-2">
          <span className="material-symbols-outlined">flashlight_on</span>
        </button>
      </nav>

      <div className="relative flex-1 flex flex-col items-center justify-center">
        {/* Mock Camera View */}
        <div className="absolute inset-0 bg-slate-900 overflow-hidden">
           <div className="w-full h-full bg-cover bg-center opacity-40" style={{ backgroundImage: 'url("https://picsum.photos/seed/warehouse/800/1200")' }}></div>
        </div>

        {/* Viewfinder Overlay */}
        <div className="relative z-10 w-64 h-64 border-2 border-transparent">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
          <div className="scanning-line"></div>
          
          <div className="absolute inset-0 flex items-center justify-center gap-12 text-white">
             <button className="bg-black/40 backdrop-blur-md p-3 rounded-full"><span className="material-symbols-outlined">image</span></button>
             <button className="bg-black/40 backdrop-blur-md p-3 rounded-full"><span className="material-symbols-outlined">keyboard</span></button>
          </div>
        </div>
        <p className="mt-8 text-white/60 text-sm font-medium z-10">Align barcode within the frame</p>
      </div>

      <div className="bg-background-dark p-6 rounded-t-3xl border-t border-slate-800 shadow-2xl relative z-20">
        <div className="bg-slate-800 p-1.5 rounded-xl flex mb-6">
          <button className="flex-1 py-2 rounded-lg bg-primary text-white font-bold text-sm">Check-In (+1)</button>
          <button className="flex-1 py-2 rounded-lg text-slate-400 font-bold text-sm">Check-Out (-1)</button>
        </div>

        <div className="bg-[#1a2232] rounded-2xl p-4 border border-primary/20 flex gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Recently Scanned</p>
            </div>
            <h3 className="text-white font-bold text-lg">Sony WH-1000XM5</h3>
            <p className="text-primary text-xs font-mono font-bold">SNY-WH1K-M5-BLK</p>
            
            <div className="flex items-center gap-4 my-4">
               <div>
                 <p className="text-[9px] uppercase font-black text-slate-500">Current</p>
                 <p className="text-xl font-black text-white">24 <span className="text-[10px] font-normal">units</span></p>
               </div>
               <span className="material-symbols-outlined text-primary">trending_flat</span>
               <div>
                 <p className="text-[9px] uppercase font-black text-primary">Updated</p>
                 <p className="text-xl font-black text-primary">25 <span className="text-[10px] font-normal">units</span></p>
               </div>
            </div>

            <button className="w-full bg-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined">check_circle</span> Confirm Update
            </button>
          </div>
          <img src="https://picsum.photos/seed/sony/200/200" className="w-28 rounded-xl object-cover" />
        </div>

        <div className="flex gap-4 mt-6">
          <div className="flex-1 bg-slate-800 p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Session Scans</p>
            <p className="text-xl font-black text-white">128</p>
          </div>
          <div className="flex-1 bg-slate-800 p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Success Rate</p>
            <div className="flex items-center gap-1">
              <p className="text-xl font-black text-white">99.2%</p>
              <span className="material-symbols-outlined text-green-500 text-sm">verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanSKU;
