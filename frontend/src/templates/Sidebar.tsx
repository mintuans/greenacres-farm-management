import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { useSidebar } from '@/src/contexts/SidebarContext';
import logoWeb from '../assets/logo_web.png';
import { useTranslation } from 'react-i18next';

const Sidebar: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { isCollapsed, isMobileOpen, closeMobileMenu } = useSidebar();
    const { t } = useTranslation();

    const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
    const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);
    const [isPayrollOpen, setIsPayrollOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/showcase');
    };

    const navItems = [
        { label: t('sidebar.dashboard'), path: '/dashboard', icon: 'dashboard' },
        { label: t('sidebar.schedule'), path: '/schedule', icon: 'calendar_month' },
        { label: t('sidebar.inventory'), path: '/inventory', icon: 'inventory_2' },
        { label: t('sidebar.seasons'), path: '/seasons', icon: 'grass' },
        { label: t('sidebar.transactions'), path: '/transactions', icon: 'payments' },
    ];

    const settingsItems = [
        { label: t('sidebar.users'), path: '/settings/users', icon: 'person' },
        { label: t('sidebar.roles'), path: '/settings/roles', icon: 'admin_panel_settings' },
        { label: t('sidebar.permissions'), path: '/settings/permissions', icon: 'key' },
        { label: t('sidebar.role_permissions'), path: '/settings/role-permissions', icon: 'rule' },
        { label: t('sidebar.audit_logs'), path: '/settings/audit-logs', icon: 'history' },
        { label: t('sidebar.backup_restore'), path: '/settings/database-backup', icon: 'backup' },
    ];

    const masterDataItems = [
        { label: t('sidebar.events'), path: '/master-data/farm-events', icon: 'notification_important' },
        { label: t('sidebar.categories'), path: '/master-data/categories', icon: 'category' },
        { label: t('sidebar.units'), path: '/master-data/units', icon: 'agriculture' },
        { label: '─────────', path: '#', icon: '', disabled: true }, // Separator
        { label: t('sidebar.products'), path: '/master-data/showcase-products', icon: 'shopping_bag' },
        { label: t('sidebar.media'), path: '/master-data/media', icon: 'image' },
        { label: t('sidebar.news'), path: '/master-data/showcase-blog', icon: 'article' },
        { label: t('sidebar.event_mgmt'), path: '/master-data/showcase-events', icon: 'event_available' },
        { label: t('sidebar.guest_mgmt'), path: '/master-data/showcase-guests', icon: 'groups' },
        { label: t('sidebar.notifications'), path: '/master-data/notifications', icon: 'send' },
    ];

    const payrollItems = [
        { label: t('sidebar.workers'), path: '/master-data/workers', icon: 'group' },
        { label: t('sidebar.shifts'), path: '/master-data/shifts', icon: 'schedule' },
        { label: t('sidebar.jobs'), path: '/master-data/jobs', icon: 'work' },
        { label: t('sidebar.work_schedules'), path: '/master-data/work-schedules', icon: 'event_note' },
        { label: t('sidebar.daily_work_logs'), path: '/master-data/daily-work-logs', icon: 'assignment' },
        { label: t('sidebar.payroll'), path: '/master-data/payroll', icon: 'payments' },
    ];

    const warehouseItems = [
        { label: t('sidebar.warehouse_items'), path: '/warehouse/management', icon: 'inventory' },
        { label: t('sidebar.warehouse_types'), path: '/warehouse/types', icon: 'list_alt' },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] md:hidden transition-all duration-300"
                    onClick={closeMobileMenu}
                />
            )}

            <aside
                style={{ willChange: 'transform' }}
                className={`
                fixed md:relative inset-y-0 left-0 z-[50]
                ${isCollapsed ? 'md:w-16' : 'md:w-56'} 
                ${isMobileOpen ? 'translate-x-0 w-60' : '-translate-x-full md:translate-x-0'}
                bg-white border-r border-slate-200 flex flex-col h-full shrink-0
                transition-transform duration-300 ease-in-out md:transition-all md:duration-300
            `}>
                <div
                    onClick={() => {
                        navigate('/dashboard');
                        window.innerWidth < 768 && closeMobileMenu();
                    }}
                    className={`p-3 flex flex-col items-center gap-1 text-center border-b border-slate-50 overflow-hidden cursor-pointer hover:bg-slate-50/50 transition-colors group`}
                >
                    <div className={`flex items-center gap-2 w-full ${isCollapsed ? 'md:justify-center' : 'justify-start'}`}>
                        <img src={logoWeb} alt="Logo" className="size-8 object-contain shrink-0 group-hover:scale-110 transition-transform" />
                        <div className={`transition-all duration-300 ${isCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>
                            <h1 className="text-slate-900 text-xs font-black tracking-tight whitespace-nowrap">{t('sidebar.app_name')}</h1>
                            <p className="text-slate-500 text-[7px] font-black uppercase tracking-wider leading-tight whitespace-nowrap">{t('sidebar.app_subtitle')}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto no-scrollbar scroll-smooth">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => window.innerWidth < 768 && closeMobileMenu()}
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all group relative ${isActive
                                    ? 'bg-[#13ec49]/10 text-slate-900 font-bold'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={`material-symbols-outlined text-[20px] transition-colors shrink-0 ${isActive ? 'text-[#13ec49]' : 'text-slate-400 group-hover:text-[#13ec49]'
                                        }`}>
                                        {item.icon}
                                    </span>
                                    <span className={`text-[13px] transition-all duration-300 origin-left ${isCollapsed ? 'md:opacity-0 md:scale-0 md:absolute' : 'opacity-100 scale-100'}`}>{item.label}</span>
                                    {isCollapsed && (
                                        <div className="hidden md:group-hover:block absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-[100]">
                                            {item.label}
                                        </div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}

                    {/* Payroll Management Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsPayrollOpen(!isPayrollOpen)}
                            className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl transition-all group text-slate-500 hover:bg-slate-50 hover:text-slate-900`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`material-symbols-outlined text-slate-400 group-hover:text-[#13ec49] transition-colors shrink-0 ${isPayrollOpen ? 'text-[#13ec49]' : ''}`}>
                                    badge
                                </span>
                                <span className={`text-[13px] font-medium transition-all duration-300 origin-left ${isCollapsed ? 'md:opacity-0 md:scale-0 md:absolute' : 'opacity-100 scale-100'}`}>{t('sidebar.payroll_management')}</span>
                            </div>
                            {!isCollapsed && (
                                <span className={`material-symbols-outlined text-sm transition-transform ${isPayrollOpen ? 'rotate-180' : ''}`}>
                                    expand_more
                                </span>
                            )}
                            {isCollapsed && (
                                <div className="hidden md:group-hover:block absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-[100]">
                                    {t('sidebar.payroll_management')}
                                </div>
                            )}
                        </button>

                        <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: isPayrollOpen && !isCollapsed ? '1fr' : '0fr' }}>
                            <div className="overflow-hidden">
                                <div className="pl-6 mt-1 space-y-1">
                                    {payrollItems.map((item) => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => window.innerWidth < 768 && closeMobileMenu()}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${isActive
                                                    ? 'bg-[#13ec49]/10 text-slate-900 font-bold'
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <span className={`material-symbols-outlined text-[18px] transition-colors shrink-0 ${isActive ? 'text-[#13ec49]' : 'text-slate-400 group-hover:text-[#13ec49]'}`}>
                                                        {item.icon}
                                                    </span>
                                                    <span className="text-xs">{item.label}</span>
                                                </>
                                            )}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Master Data Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsMasterDataOpen(!isMasterDataOpen)}
                            className="w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl transition-all group text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        >
                            <div className="flex items-center gap-2.5">
                                <span className={`material-symbols-outlined text-slate-400 group-hover:text-[#13ec49] transition-colors shrink-0 ${isMasterDataOpen ? 'text-[#13ec49]' : ''}`}>
                                    folder_open
                                </span>
                                <span className={`text-[13px] font-medium transition-all duration-300 origin-left ${isCollapsed ? 'md:opacity-0 md:scale-0 md:absolute' : 'opacity-100 scale-100'}`}>{t('sidebar.master_data')}</span>
                            </div>
                            {!isCollapsed && (
                                <span className={`material-symbols-outlined text-sm transition-transform ${isMasterDataOpen ? 'rotate-180' : ''}`}>
                                    expand_more
                                </span>
                            )}
                            {isCollapsed && (
                                <div className="hidden md:group-hover:block absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-[100]">
                                    {t('sidebar.master_data')}
                                </div>
                            )}
                        </button>

                        <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: isMasterDataOpen && !isCollapsed ? '1fr' : '0fr' }}>
                            <div className="overflow-hidden">
                                <div className="pl-6 mt-1 space-y-1">
                                    {masterDataItems.map((item) => (
                                        item.disabled ? (
                                            <div key={item.label} className="px-3 py-1 text-slate-300 text-[10px] uppercase font-bold tracking-widest">
                                                {item.label}
                                            </div>
                                        ) : (
                                            <NavLink
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => window.innerWidth < 768 && closeMobileMenu()}
                                                className={({ isActive }) =>
                                                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${isActive
                                                        ? 'bg-[#13ec49]/10 text-slate-900 font-bold'
                                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                                    }`
                                                }
                                            >
                                                {({ isActive }) => (
                                                    <>
                                                        <span className={`material-symbols-outlined text-[18px] transition-colors shrink-0 ${isActive ? 'text-[#13ec49]' : 'text-slate-400 group-hover:text-[#13ec49]'}`}>
                                                            {item.icon}
                                                        </span>
                                                        <span className="text-xs">{item.label}</span>
                                                    </>
                                                )}
                                            </NavLink>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Warehouse Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsWarehouseOpen(!isWarehouseOpen)}
                            className="w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl transition-all group text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        >
                            <div className="flex items-center gap-2.5">
                                <span className={`material-symbols-outlined text-slate-400 group-hover:text-[#13ec49] transition-colors shrink-0 ${isWarehouseOpen ? 'text-[#13ec49]' : ''}`}>
                                    warehouse
                                </span>
                                <span className={`text-[13px] font-medium transition-all duration-300 origin-left ${isCollapsed ? 'md:opacity-0 md:scale-0 md:absolute' : 'opacity-100 scale-100'}`}>{t('sidebar.warehouse')}</span>
                            </div>
                            {!isCollapsed && (
                                <span className={`material-symbols-outlined text-sm transition-transform ${isWarehouseOpen ? 'rotate-180' : ''}`}>
                                    expand_more
                                </span>
                            )}
                            {isCollapsed && (
                                <div className="hidden md:group-hover:block absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-[100]">
                                    {t('sidebar.warehouse')}
                                </div>
                            )}
                        </button>

                        <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: isWarehouseOpen && !isCollapsed ? '1fr' : '0fr' }}>
                            <div className="overflow-hidden">
                                <div className="pl-6 mt-1 space-y-1">
                                    {warehouseItems.map((item) => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => window.innerWidth < 768 && closeMobileMenu()}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${isActive
                                                    ? 'bg-[#13ec49]/10 text-slate-900 font-bold'
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <span className={`material-symbols-outlined text-[18px] transition-colors shrink-0 ${isActive ? 'text-[#13ec49]' : 'text-slate-400 group-hover:text-[#13ec49]'}`}>
                                                        {item.icon}
                                                    </span>
                                                    <span className="text-xs">{item.label}</span>
                                                </>
                                            )}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Settings Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className="w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl transition-all group text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        >
                            <div className="flex items-center gap-2.5">
                                <span className={`material-symbols-outlined text-slate-400 group-hover:text-[#13ec49] transition-colors shrink-0 ${isSettingsOpen ? 'text-[#13ec49]' : ''}`}>
                                    settings
                                </span>
                                <span className={`text-[13px] font-medium transition-all duration-300 origin-left ${isCollapsed ? 'md:opacity-0 md:scale-0 md:absolute' : 'opacity-100 scale-100'}`}>{t('sidebar.settings')}</span>
                            </div>
                            {!isCollapsed && (
                                <span className={`material-symbols-outlined text-sm transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`}>
                                    expand_more
                                </span>
                            )}
                            {isCollapsed && (
                                <div className="hidden md:group-hover:block absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-[100]">
                                    {t('sidebar.settings')}
                                </div>
                            )}
                        </button>

                        <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: isSettingsOpen && !isCollapsed ? '1fr' : '0fr' }}>
                            <div className="overflow-hidden">
                                <div className="pl-6 mt-1 space-y-1">
                                    {settingsItems.map((item) => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => window.innerWidth < 768 && closeMobileMenu()}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${isActive
                                                    ? 'bg-[#13ec49]/10 text-slate-900 font-bold'
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <span className={`material-symbols-outlined text-[18px] transition-colors shrink-0 ${isActive ? 'text-[#13ec49]' : 'text-slate-400 group-hover:text-[#13ec49]'}`}>
                                                        {item.icon}
                                                    </span>
                                                    <span className="text-xs">{item.label}</span>
                                                </>
                                            )}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="p-2 border-t border-slate-100 flex flex-col gap-1 mt-auto">
                    <button
                        onClick={() => {
                            navigate('/showcase');
                            window.innerWidth < 768 && closeMobileMenu();
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all text-blue-600 hover:bg-blue-50 group relative"
                    >
                        <span className="material-symbols-outlined transition-colors shrink-0">
                            visibility
                        </span>
                        <span className={`text-[13px] font-bold transition-all duration-300 origin-left ${isCollapsed ? 'md:opacity-0 md:scale-0 md:absolute' : 'opacity-100 scale-100'}`}>{t('sidebar.view_website')}</span>
                        {isCollapsed && (
                            <div className="hidden md:group-hover:block absolute left-full ml-4 px-2 py-1 bg-blue-600 text-white text-xs rounded shadow-lg whitespace-nowrap z-[100]">
                                {t('sidebar.view_website')}
                            </div>
                        )}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all text-slate-500 hover:bg-red-50 hover:text-red-600 group relative"
                    >
                        <span className="material-symbols-outlined transition-colors group-hover:text-red-500 shrink-0">
                            logout
                        </span>
                        <span className={`text-[13px] font-medium transition-all duration-300 origin-left ${isCollapsed ? 'md:opacity-0 md:scale-0 md:absolute' : 'opacity-100 scale-100'}`}>{t('sidebar.logout')}</span>
                        {isCollapsed && (
                            <div className="hidden md:group-hover:block absolute left-full ml-4 px-2 py-1 bg-red-600 text-white text-xs rounded shadow-lg whitespace-nowrap z-[100]">
                                {t('sidebar.logout')}
                            </div>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
