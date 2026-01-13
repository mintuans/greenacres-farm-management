
import React from 'react';
import { Screen } from '../../../App';

const Settings: React.FC<{ onNavigate: (s: Screen) => void, onLogout?: () => void }> = ({ onNavigate, onLogout }) => {
  return (
    <div className="p-4 animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-6">
        <span className="material-symbols-outlined text-primary">arrow_back_ios</span>
        <h1 className="text-lg font-bold">App Settings</h1>
        <div className="w-6"></div>
      </header>

      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl flex items-center gap-4 mb-8 border border-slate-100 dark:border-slate-700 shadow-sm">
        <img src="https://picsum.photos/seed/alex/150/150" className="h-16 w-16 rounded-full border-2 border-primary" />
        <div className="flex-1">
          <h2 className="text-xl font-bold">Alex Thompson</h2>
          <p className="text-slate-500 text-sm">Warehouse Manager</p>
          <p className="text-primary text-xs font-medium">alex.t@inventory-pro.com</p>
        </div>
        <span className="material-symbols-outlined text-slate-300">chevron_right</span>
      </div>

      <div className="space-y-8 pb-32">
        <section>
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1 mb-4">Scanner Settings</h3>
          <div className="space-y-1 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
            <SettingRow icon="volume_up" label="Sound Feedback" type="toggle" defaultChecked />
            <SettingRow icon="vibration" label="Haptic Vibration" type="toggle" defaultChecked />
            <SettingRow icon="task_alt" label="Auto-confirm Scans" type="toggle" />
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1 mb-4">Warehouse & Logistics</h3>
          <div className="space-y-1 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
            <SettingRow icon="location_on" label="Warehouse Locations" type="arrow" />
            <SettingRow icon="inventory_2" label="Default Storage Zone" sublabel="Zone A - High Priority" type="arrow" />
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1 mb-4">Account Security</h3>
          <div className="space-y-1 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
            <SettingRow icon="lock" label="Change Password" type="arrow" />
            <SettingRow icon="verified_user" label="Two-Factor Auth" sublabel="Enabled" type="arrow" />
          </div>
        </section>

        <button
          onClick={onLogout}
          className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined">logout</span> Logout
        </button>

        <p className="text-center text-slate-400 text-[10px] font-bold">InventoryPro v2.4.12 (Build 884)</p>
      </div>
    </div>
  );
};

const SettingRow: React.FC<{ icon: string, label: string, sublabel?: string, type: 'toggle' | 'arrow', defaultChecked?: boolean }> = ({ icon, label, sublabel, type, defaultChecked }) => (
  <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-bold">{label}</p>
        {sublabel && <p className="text-[10px] text-slate-400 font-bold uppercase">{sublabel}</p>}
      </div>
    </div>
    {type === 'toggle' ? (
      <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ${defaultChecked ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${defaultChecked ? 'translate-x-5' : 'translate-x-0'}`}></div>
      </div>
    ) : (
      <span className="material-symbols-outlined text-slate-300">chevron_right</span>
    )}
  </div>
);

export default Settings;
