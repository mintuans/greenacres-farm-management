
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '@/src/templates/Sidebar';
import Header from '@/src/templates/Header';
import Dashboard from '@/src/pages/Dashboard';
import Schedule from '@/src/pages/Schedule';
import Inventory from '@/src/pages/Inventory';
import AddInventory from '@/src/pages/AddInventory';
import Seasons from '@/src/pages/Seasons';
import Transactions from '@/src/pages/Transactions';
import PersonalFinance from '@/src/pages/PersonalFinance';
import MasterData from '@/src/pages/MasterData';
import Categories from '@/src/pages/Categories';
import WorkShifts from '@/src/pages/WorkShifts';
import JobTypes from '@/src/pages/JobTypes';
import Workers from '@/src/pages/Workers';
import ProductionUnits from '@/src/pages/ProductionUnits';
import HouseholdWarehouse from '@/src/pages/HouseholdWarehouse';
import ElectronicsWarehouse from '@/src/pages/ElectronicsWarehouse';
import PlantsWarehouse from '@/src/pages/PlantsWarehouse';
import FarmEvents from '@/src/pages/FarmEvents';
import WorkSchedules from '@/src/pages/WorkSchedules';
import DailyWorkLogs from '@/src/pages/DailyWorkLogs';

// Showcase pages
import FarmShowcase from '@/src/pages/showcase/FarmShowcase';
import ShowcaseProducts from '@/src/pages/showcase/ShowcaseProducts';
import ShowcaseBlog from '@/src/pages/showcase/ShowcaseBlog';
import BlogDetail from '@/src/pages/showcase/BlogDetail';
import UserProfile from '@/src/pages/UserProfile';

// Management pages
import ManagementProducts from '@/src/pages/management/ManagementProducts';
import ManagementMedia from '@/src/pages/management/ManagementMedia';
import ManagementBlog from '@/src/pages/management/ManagementBlog';
import AddBlog from '@/src/pages/management/AddBlog';
import EditBlog from '@/src/pages/management/EditBlog';

// Auth pages
import Login from '@/src/pages/auth/Login';
import Register from '@/src/pages/auth/Register';
import LoginRequired from '@/src/pages/auth/LoginRequired';
import AuthCallback from '@/src/pages/auth/AuthCallback';

const App: React.FC = () => {
    return (
        <HashRouter>
            <Routes>
                {/* Public Routes - No Sidebar/Header */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login-required" element={<LoginRequired />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/showcase" element={<FarmShowcase />} />
                <Route path="/showcase/products" element={<ShowcaseProducts />} />
                <Route path="/showcase/blog" element={<ShowcaseBlog />} />
                <Route path="/showcase/blog/:slug" element={<BlogDetail />} />
                <Route path="/profile" element={<UserProfile />} />

                {/* Admin Routes - With Sidebar/Header */}
                <Route path="/*" element={
                    <div className="flex h-screen w-full overflow-hidden">
                        <Sidebar />
                        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                            <Header />
                            <main className="flex-1 overflow-y-auto bg-[#f6f8f6] scroll-smooth">
                                <Routes>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/schedule" element={<Schedule />} />
                                    <Route path="/inventory" element={<Inventory />} />
                                    <Route path="/inventory/add" element={<AddInventory />} />
                                    <Route path="/warehouse/household" element={<HouseholdWarehouse />} />
                                    <Route path="/warehouse/electronics" element={<ElectronicsWarehouse />} />
                                    <Route path="/warehouse/plants" element={<PlantsWarehouse />} />
                                    <Route path="/seasons" element={<Seasons />} />
                                    <Route path="/transactions" element={<Transactions />} />
                                    <Route path="/finance" element={<PersonalFinance />} />
                                    <Route path="/master-data/categories" element={<Categories />} />
                                    <Route path="/master-data/shifts" element={<WorkShifts />} />
                                    <Route path="/master-data/jobs" element={<JobTypes />} />
                                    <Route path="/master-data/workers" element={<Workers />} />
                                    <Route path="/master-data/units" element={<ProductionUnits />} />
                                    <Route path="/master-data/showcase-products" element={<ManagementProducts />} />
                                    <Route path="/master-data/media" element={<ManagementMedia />} />
                                    <Route path="/master-data/showcase-blog" element={<ManagementBlog />} />
                                    <Route path="/master-data/showcase-blog/add" element={<AddBlog />} />
                                    <Route path="/master-data/showcase-blog/edit/:id" element={<EditBlog />} />
                                    <Route path="/master-data/farm-events" element={<FarmEvents />} />
                                    <Route path="/master-data/work-schedules" element={<WorkSchedules />} />
                                    <Route path="/master-data/daily-work-logs" element={<DailyWorkLogs />} />
                                    <Route path="/settings" element={<MasterData />} />
                                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                                </Routes>
                            </main>
                        </div>
                    </div>
                } />
            </Routes>
        </HashRouter>
    );
};

export default App;
