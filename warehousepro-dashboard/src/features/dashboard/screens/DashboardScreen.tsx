
import React from 'react';
import { Screen } from '../../../App';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between mb-6">
        <span className="material-symbols-outlined text-2xl">menu</span>
        <h1 className="text-lg font-bold">Warehouse Dashboard</h1>
        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
          <span className="material-symbols-outlined material-fill">account_circle</span>
        </div>
      </header>

      {/* Search */}
      <div className="mb-6">
        <div className="flex items-center bg-white dark:bg-card-dark rounded-xl px-4 h-12 border border-transparent dark:border-border-dark shadow-sm">
          <span className="material-symbols-outlined text-slate-400 mr-2">search</span>
          <input
            type="text"
            placeholder="Search SKU or item name..."
            className="bg-transparent border-none outline-none w-full text-sm"
          />
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white dark:bg-card-dark p-5 rounded-2xl border border-slate-200 dark:border-border-dark">
          <p className="text-slate-500 text-sm font-medium mb-1">Total Items</p>
          <p className="text-2xl font-bold">12,450</p>
          <div className="flex items-center text-emerald-500 text-xs font-bold mt-2">
            <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
            +2.5%
          </div>
        </div>
        <div className="bg-white dark:bg-card-dark p-5 rounded-2xl border border-slate-200 dark:border-border-dark">
          <p className="text-slate-500 text-sm font-medium mb-1">Low Stock</p>
          <p className="text-2xl font-bold">18</p>
          <div className="flex items-center text-rose-500 text-xs font-bold mt-2">
            <span className="material-symbols-outlined text-sm mr-1">warning</span>
            Critical
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-card-dark p-5 rounded-2xl border border-slate-200 dark:border-border-dark flex justify-between items-center mb-8">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">Today's Transactions</p>
          <p className="text-2xl font-bold">142</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">sync_alt</span>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recent Activities</h2>
        <button className="text-primary font-semibold text-sm">View all</button>
      </div>

      <div className="space-y-4">
        {[
          { name: 'Steel Bolts M8', sku: '#SKU-9920', time: '2 mins ago', value: '+50', type: 'in' },
          { name: 'Hydraulic Pump X1', sku: '#SKU-4412', time: '15 mins ago', value: '-2', type: 'out' },
          { name: 'Copper Wiring 50m', sku: '#SKU-1088', time: '1 hour ago', value: '+12', type: 'in' },
          { name: 'Safety Gloves L', sku: '#SKU-2929', time: '3 hours ago', value: '-10', type: 'out' }
        ].map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${item.type === 'in' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                <span className="material-symbols-outlined">{item.type === 'in' ? 'add_circle' : 'do_not_disturb_on'}</span>
              </div>
              <div>
                <p className="font-bold text-sm">{item.name}</p>
                <p className="text-xs text-slate-500">{item.sku} • {item.time}</p>
              </div>
            </div>
            <p className={`font-bold ${item.type === 'in' ? 'text-emerald-500' : 'text-rose-500'}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => onNavigate('scan')}
        className="fixed bottom-28 right-6 h-16 w-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-30"
      >
        <span className="material-symbols-outlined text-3xl">barcode_scanner</span>
      </button>
    </div>
  );
};

export default Dashboard;
