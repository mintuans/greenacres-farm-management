
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '@/src/templates/Sidebar';
import Header from '@/src/templates/Header';

// Lazy load page components
const Dashboard = lazy(() => import('@/src/pages/Dashboard'));
const Schedule = lazy(() => import('@/src/pages/Schedule'));
const Inventory = lazy(() => import('@/src/pages/Inventory'));
const AddInventory = lazy(() => import('@/src/pages/AddInventory'));
const Seasons = lazy(() => import('@/src/pages/Seasons'));
const Transactions = lazy(() => import('@/src/pages/Transactions'));
const PersonalFinance = lazy(() => import('@/src/pages/PersonalFinance'));
const MasterData = lazy(() => import('@/src/pages/MasterData'));
const Categories = lazy(() => import('@/src/pages/Categories'));
const WorkShifts = lazy(() => import('@/src/pages/WorkShifts'));
const JobTypes = lazy(() => import('@/src/pages/JobTypes'));
const Workers = lazy(() => import('@/src/pages/Workers'));
const ProductionUnits = lazy(() => import('@/src/pages/ProductionUnits'));
const WarehouseManagement = lazy(() => import('@/src/pages/WarehouseManagement'));
const WarehouseTypes = lazy(() => import('@/src/pages/WarehouseTypes'));
const FarmEvents = lazy(() => import('@/src/pages/FarmEvents'));
const WorkSchedules = lazy(() => import('@/src/pages/WorkSchedules'));
const DailyWorkLogs = lazy(() => import('@/src/pages/DailyWorkLogs'));
const PayrollManagement = lazy(() => import('@/src/pages/PayrollManagement'));
const Notifications = lazy(() => import('@/src/pages/Notifications'));

// Showcase pages
const FarmShowcase = lazy(() => import('@/src/pages/showcase/FarmShowcase'));
const ShowcaseProducts = lazy(() => import('@/src/pages/showcase/ShowcaseProducts'));
const ShowcaseEvents = lazy(() => import('@/src/pages/showcase/ShowcaseEvents'));
const EventDetail = lazy(() => import('@/src/pages/showcase/EventDetail'));
const ShowcaseBlog = lazy(() => import('@/src/pages/showcase/ShowcaseBlog'));
const BlogDetail = lazy(() => import('@/src/pages/showcase/BlogDetail'));
const PrivacyPolicy = lazy(() => import('@/src/pages/showcase/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/src/pages/showcase/TermsOfService'));
const UserProfile = lazy(() => import('@/src/pages/UserProfile'));

// Management pages
const ManagementProducts = lazy(() => import('@/src/pages/management/ManagementProducts'));
const ManagementMedia = lazy(() => import('@/src/pages/management/ManagementMedia'));
const ManagementBlog = lazy(() => import('@/src/pages/management/ManagementBlog'));
const AddBlog = lazy(() => import('@/src/pages/management/AddBlog'));
const EditBlog = lazy(() => import('@/src/pages/management/EditBlog'));
const ManagementShowcaseEvents = lazy(() => import('@/src/pages/management/ManagementShowcaseEvents'));
const EditShowcaseEvent = lazy(() => import('@/src/pages/management/EditShowcaseEvent'));
const ManagementGuests = lazy(() => import('@/src/pages/management/ManagementGuests'));
const Users = lazy(() => import('@/src/pages/settings/Users'));
const Roles = lazy(() => import('@/src/pages/settings/Roles'));
const Permissions = lazy(() => import('@/src/pages/settings/Permissions'));
const RolePermissions = lazy(() => import('@/src/pages/settings/RolePermissions'));
const AuditLogs = lazy(() => import('@/src/pages/settings/AuditLogs'));
const DatabaseBackup = lazy(() => import('@/src/pages/settings/DatabaseBackup'));

// Auth pages
const Login = lazy(() => import('@/src/pages/auth/Login'));
const Register = lazy(() => import('@/src/pages/auth/Register'));
const LoginRequired = lazy(() => import('@/src/pages/auth/LoginRequired'));
const AuthCallback = lazy(() => import('@/src/pages/auth/AuthCallback'));
const ForgotPassword = lazy(() => import('@/src/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/src/pages/auth/ResetPassword'));

import { useAuth } from '@/src/contexts/AuthContext';
import { SidebarProvider, useSidebar } from '@/src/contexts/SidebarContext';

// Admin Layout Wrapper to use Sidebar Context
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isCollapsed } = useSidebar();
    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f6f8f6]">
            <Sidebar />
            <div className={`flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300`}>
                <Header />
                <main className="flex-1 overflow-y-auto scroll-smooth p-2 md:p-3">
                    <Suspense fallback={<PageLoader />}>
                        {children}
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

// Loading component
const PageLoader = () => (
    <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);

const App: React.FC = () => {
    const { user, isAuthenticated } = useAuth();

    return (
        <HashRouter>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Public Routes - No Sidebar/Header */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login-required" element={<LoginRequired />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/showcase" element={<FarmShowcase />} />
                    <Route path="/showcase/products" element={<ShowcaseProducts />} />
                    <Route path="/showcase/events" element={<ShowcaseEvents />} />
                    <Route path="/showcase/events/:id" element={<EventDetail />} />
                    <Route path="/showcase/blog" element={<ShowcaseBlog />} />
                    <Route path="/showcase/blog/:slug" element={<BlogDetail />} />
                    <Route path="/showcase/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/showcase/terms-of-service" element={<TermsOfService />} />
                    <Route path="/profile" element={<UserProfile />} />

                    {/* Admin Routes - With Sidebar/Header */}
                    <Route path="/*" element={
                        isAuthenticated && user?.role === 'SUPER_ADMIN' ? (
                            <SidebarProvider>
                                <AdminLayout>
                                    <Routes>
                                        <Route path="/dashboard" element={<Dashboard />} />
                                        <Route path="/schedule" element={<Schedule />} />
                                        <Route path="/inventory" element={<Inventory />} />
                                        <Route path="/inventory/add" element={<AddInventory />} />
                                        <Route path="/warehouse/management" element={<WarehouseManagement />} />
                                        <Route path="/warehouse/types" element={<WarehouseTypes />} />
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
                                        <Route path="/master-data/showcase-events" element={<ManagementShowcaseEvents />} />
                                        <Route path="/master-data/showcase-events/add" element={<EditShowcaseEvent />} />
                                        <Route path="/master-data/showcase-events/edit/:id" element={<EditShowcaseEvent />} />
                                        <Route path="/master-data/showcase-guests" element={<ManagementGuests />} />
                                        <Route path="/master-data/farm-events" element={<FarmEvents />} />
                                        <Route path="/master-data/work-schedules" element={<WorkSchedules />} />
                                        <Route path="/master-data/daily-work-logs" element={<DailyWorkLogs />} />
                                        <Route path="/master-data/payroll" element={<PayrollManagement />} />
                                        <Route path="/master-data/notifications" element={<Notifications />} />
                                        <Route path="/settings/users" element={<Users />} />
                                        <Route path="/settings/roles" element={<Roles />} />
                                        <Route path="/settings/permissions" element={<Permissions />} />
                                        <Route path="/settings/role-permissions" element={<RolePermissions />} />
                                        <Route path="/settings/audit-logs" element={<AuditLogs />} />
                                        <Route path="/settings/database-backup" element={<DatabaseBackup />} />
                                        <Route path="/settings" element={<MasterData />} />
                                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                                    </Routes>
                                </AdminLayout>
                            </SidebarProvider>
                        ) : (
                            <Navigate to="/showcase" replace />
                        )
                    } />

                </Routes>
            </Suspense>
        </HashRouter>
    );
};

export default App;
