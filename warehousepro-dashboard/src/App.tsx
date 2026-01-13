
import React, { useState } from 'react';
import Dashboard from './features/dashboard/screens/DashboardScreen';
import Inventory from './features/inventory/screens/InventoryScreen';
import ScanSKU from './features/scanning/screens/ScanningScreen';
import Reports from './features/reports/screens/ReportsScreen';
import Settings from './features/settings/screens/SettingsScreen';
import BottomNav from './components/layout/BottomNav';
import Login from './features/auth/screens/LoginScreen';

export type Screen = 'dashboard' | 'inventory' | 'scan' | 'reports' | 'settings' | 'login';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('dashboard');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentScreen} />;
      case 'inventory': return <Inventory onNavigate={setCurrentScreen} />;
      case 'scan': return <ScanSKU onBack={() => setCurrentScreen('dashboard')} />;
      case 'reports': return <Reports onNavigate={setCurrentScreen} />;
      case 'settings': return <Settings onNavigate={setCurrentScreen} onLogout={handleLogout} />;
      default: return <Dashboard onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto relative bg-background-light dark:bg-background-dark overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {renderScreen()}
      </div>

      {currentScreen !== 'scan' && (
        <BottomNav activeTab={currentScreen} onTabChange={setCurrentScreen} />
      )}

      {/* iOS Home Indicator Mockup */}
      <div className="bg-background-light dark:bg-background-dark flex justify-center pb-2">
        <div className="w-32 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
      </div>
    </div>
  );
};

export default App;
