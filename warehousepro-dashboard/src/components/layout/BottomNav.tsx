
import React from 'react';
import { Screen } from '../../App';

interface BottomNavProps {
  activeTab: Screen;
  onTabChange: (screen: Screen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: Screen; icon: string; label: string }[] = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'inventory', icon: 'inventory_2', label: 'Inventory' },
    { id: 'reports', icon: 'analytics', label: 'Reports' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 pt-3 pb-8 flex justify-between items-center z-40">
      {tabs.slice(0, 2).map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-primary' : 'text-slate-400'}`}
        >
          <span className={`material-symbols-outlined ${activeTab === tab.id ? 'material-fill' : ''}`}>{tab.icon}</span>
          <span className="text-[10px] font-bold">{tab.label}</span>
        </button>
      ))}

      {/* Center Scan Button Area */}
      <div className="-mt-12 group">
        <button
          onClick={() => onTabChange('scan')}
          className="bg-primary h-14 w-14 rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center text-white active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-2xl">barcode_scanner</span>
        </button>
      </div>

      {tabs.slice(2).map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-primary' : 'text-slate-400'}`}
        >
          <span className={`material-symbols-outlined ${activeTab === tab.id ? 'material-fill' : ''}`}>{tab.icon}</span>
          <span className="text-[10px] font-bold">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
