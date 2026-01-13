
import React from 'react';
import { Screen } from '../../../App';

const Inventory: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  const items = [
    { name: 'Organic Coffee Beans 1kg', sku: 'CF-001', status: 'Healthy', qty: 142, color: 'emerald', img: 'https://picsum.photos/seed/coffee/100/100' },
    { name: 'Wireless Mouse G502', sku: 'MS-992', status: 'Low', qty: 8, color: 'red', img: 'https://picsum.photos/seed/mouse/100/100' },
    { name: 'Mechanical Keyboard K2', sku: 'KB-410', status: 'Healthy', qty: 45, color: 'emerald', img: 'https://picsum.photos/seed/kb/100/100' },
    { name: 'Smart Desk Lamp Pro', sku: 'LP-088', status: 'Out', qty: 0, color: 'slate', img: 'https://picsum.photos/seed/lamp/100/100' },
    { name: 'Studio Headphones X1', sku: 'HP-102', status: 'Healthy', qty: 22, color: 'emerald', img: 'https://picsum.photos/seed/audio/100/100' },
    { name: 'USB-C Hub Multi-port', sku: 'HB-303', status: 'Transit', qty: 50, color: 'amber', img: 'https://picsum.photos/seed/usb/100/100' }
  ];

  return (
    <div className="p-4 animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <span className="material-symbols-outlined material-fill">inventory_2</span>
          </div>
          <h1 className="text-xl font-bold">Inventory</h1>
        </div>
        <button className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <div className="flex gap-2 mb-6">
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl px-4 flex items-center h-12 shadow-sm border border-transparent dark:border-slate-700">
          <span className="material-symbols-outlined text-slate-400 mr-2">search</span>
          <input type="text" placeholder="Search SKU or name..." className="bg-transparent border-none outline-none w-full text-sm" />
          <button onClick={() => onNavigate('scan')} className="ml-2 text-primary">
            <span className="material-symbols-outlined">qr_code_scanner</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
        <button className="px-4 py-2 bg-primary text-white rounded-full text-sm font-bold whitespace-nowrap">All Items</button>
        <button className="px-4 py-2 bg-white dark:bg-slate-800 rounded-full text-sm font-medium whitespace-nowrap border border-slate-200 dark:border-slate-700 flex items-center gap-1">
          <span className="material-symbols-outlined text-red-500 text-sm">error</span> Low Stock
        </button>
        <button className="px-4 py-2 bg-white dark:bg-slate-800 rounded-full text-sm font-medium whitespace-nowrap border border-slate-200 dark:border-slate-700 flex items-center gap-1">
          <span className="material-symbols-outlined text-amber-500 text-sm">local_shipping</span> In Transit
        </button>
      </div>

      <div className="space-y-3 pb-24">
        {items.map((item, i) => (
          <div key={i} className="flex gap-4 bg-white dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 items-center">
            <img src={item.img} className="h-16 w-16 rounded-xl object-cover bg-slate-100" alt={item.name} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{item.name}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">SKU: {item.sku}</p>
              <div className={`mt-1.5 flex items-center gap-1.5 px-2 py-0.5 rounded-md w-fit bg-${item.color}-500/10`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-${item.color}-500`}></span>
                <p className={`text-[10px] font-black uppercase text-${item.color}-500`}>
                  {item.status} STOCK: {item.qty} UNITS
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
          </div>
        ))}
      </div>

      <button className="fixed bottom-28 right-6 h-14 w-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform">
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
    </div>
  );
};

export default Inventory;
