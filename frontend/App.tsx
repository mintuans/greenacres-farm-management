
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './templates/Sidebar';
import Header from './templates/Header';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Seasons from './pages/Seasons';
import Transactions from './pages/Transactions';
import DebtManagement from './pages/DebtManagement';
import PersonalFinance from './pages/PersonalFinance';
import MasterData from './pages/MasterData';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <Header />
          <main className="flex-1 overflow-y-auto bg-[#f6f8f6] scroll-smooth">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/seasons" element={<Seasons />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/debts" element={<DebtManagement />} />
              <Route path="/finance" element={<PersonalFinance />} />
              <Route path="/settings" element={<MasterData />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
