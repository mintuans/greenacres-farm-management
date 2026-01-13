
import React from 'react';

import { Screen } from '../../../App';

const Reports: React.FC<{ onNavigate: (s: Screen) => void }> = () => {
  return (
    <div className="p-4 animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined">arrow_back_ios</span>
          <h1 className="text-lg font-bold">Warehouse Reports</h1>
        </div>
        <span className="material-symbols-outlined">ios_share</span>
      </header>

      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl mb-4 border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Report Period</span>
          <span className="material-symbols-outlined text-primary text-lg">calendar_month</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-lg font-bold">Oct 5 - Oct 30, 2023</p>
            <p className="text-xs text-slate-400">Selected range (25 days)</p>
          </div>
          <button className="px-4 py-2 bg-primary/10 text-primary font-bold text-xs rounded-lg">Edit</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between">
            <p className="text-xs text-slate-500 font-bold uppercase">Total Inbound</p>
            <span className="material-symbols-outlined text-emerald-500 text-sm">trending_up</span>
          </div>
          <p className="text-2xl font-black my-1">12,450</p>
          <p className="text-emerald-500 text-xs font-bold">+12.5%</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between">
            <p className="text-xs text-slate-500 font-bold uppercase">Total Outbound</p>
            <span className="material-symbols-outlined text-emerald-500 text-sm">trending_up</span>
          </div>
          <p className="text-2xl font-black my-1">9,820</p>
          <p className="text-emerald-500 text-xs font-bold">+5.2%</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-sm">Inbound vs Outbound Trends</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Flow</span>
          </div>
        </div>
        {/* Mockup Chart */}
        <div className="h-32 w-full flex items-end gap-1 px-1">
          {[40, 60, 45, 80, 55, 70, 40, 65, 30, 90, 45, 60, 75, 50, 85].map((h, i) => (
            <div key={i} className="flex-1 bg-primary/20 rounded-t-sm relative group" style={{ height: `${h}%` }}>
              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm"></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 px-1">
          <span className="text-[8px] font-bold text-slate-400">OCT 01</span>
          <span className="text-[8px] font-bold text-slate-400">OCT 15</span>
          <span className="text-[8px] font-bold text-slate-400">OCT 30</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">Top Moving Items</h3>
        <button className="text-primary text-xs font-bold">View All</button>
      </div>

      <div className="space-y-3 pb-24">
        {[
          { sku: 'SKU-78291-BL', name: 'Wireless Headphones Pro', qty: '2,140', prog: 85 },
          { sku: 'SKU-10443-GR', name: 'A5 Phone Case Silicone', qty: '1,892', prog: 60 }
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className="h-12 w-12 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-400">inventory_2</span>
            </div>
            <div className="flex-1">
              <p className="font-black text-sm">{item.sku}</p>
              <p className="text-xs text-slate-500 mb-2">{item.name}</p>
              <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${item.prog}%` }}></div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-sm">{item.qty}</p>
              <p className="text-[10px] text-emerald-500 font-bold uppercase">High</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
