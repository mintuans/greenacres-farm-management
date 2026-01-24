import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';

const Sidebar: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
    const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);
    const [isPayrollOpen, setIsPayrollOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/showcase');
    };


    const navItems = [
        { label: 'Tổng quan', path: '/dashboard', icon: 'dashboard' },
        { label: 'Lịch sự kiện', path: '/schedule', icon: 'calendar_month' },
        { label: 'Vật tư Nông nghiệp', path: '/inventory', icon: 'inventory_2' },
        { label: 'Mùa vụ', path: '/seasons', icon: 'grass' },
        { label: 'Giao dịch', path: '/transactions', icon: 'payments' },
    ];

    const settingsItems = [
        { label: 'Tài khoản', path: '/settings/users', icon: 'person' },
        { label: 'Nhóm quyền', path: '/settings/roles', icon: 'admin_panel_settings' },
        { label: 'Danh sách quyền', path: '/settings/permissions', icon: 'key' },
        { label: 'Gán quyền', path: '/settings/role-permissions', icon: 'rule' },
        { label: 'Nhật ký hệ thống', path: '/settings/audit-logs', icon: 'history' },
        { label: 'Backup & Restore', path: '/settings/database-backup', icon: 'backup' },
    ];

    const masterDataItems = [
        { label: 'Sự kiện', path: '/master-data/farm-events', icon: 'notification_important' },
        { label: 'Thể loại', path: '/master-data/categories', icon: 'category' },
        { label: 'Đơn vị sản xuất', path: '/master-data/units', icon: 'agriculture' },
        { label: '─────────', path: '#', icon: '', disabled: true }, // Separator
        { label: 'Sản phẩm ', path: '/master-data/showcase-products', icon: 'shopping_bag' },
        { label: 'Quản lý Ảnh', path: '/master-data/media', icon: 'image' },
        { label: 'Tin tức ', path: '/master-data/showcase-blog', icon: 'article' },
        { label: 'Quản lý Sự kiện', path: '/master-data/showcase-events', icon: 'event_available' },
        { label: 'Quản lý Khách mời', path: '/master-data/showcase-guests', icon: 'groups' },
    ];

    const payrollItems = [
        { label: 'Nhân viên', path: '/master-data/workers', icon: 'group' },
        { label: 'Ca làm việc', path: '/master-data/shifts', icon: 'schedule' },
        { label: 'Công việc', path: '/master-data/jobs', icon: 'work' },
        { label: 'Lịch làm việc', path: '/master-data/work-schedules', icon: 'event_note' },
        { label: 'Nhật ký làm việc', path: '/master-data/daily-work-logs', icon: 'assignment' },
        { label: 'Phiếu lương', path: '/master-data/payroll', icon: 'payments' },
    ];

    const warehouseItems = [
        { label: 'Vật phẩm kho', path: '/warehouse/management', icon: 'inventory' },
        { label: 'Phân loại', path: '/warehouse/types', icon: 'list_alt' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col h-full shrink-0">
            <div className="p-6 flex flex-col gap-1">
                <h1 className="text-slate-900 text-xl font-black tracking-tight flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#13ec49] text-3xl">agriculture</span>
                    GreenAcres
                </h1>
                <p className="text-slate-500 text-[11px] font-bold pl-9 uppercase tracking-widest">Quản lý nông trại</p>
            </div>

            <nav className="flex-1 px-4 py-4 flex flex-col gap-2 overflow-y-auto no-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive
                                ? 'bg-[#13ec49]/10 text-slate-900 font-bold shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`material-symbols-outlined transition-colors ${isActive ? 'text-[#13ec49]' : 'text-slate-400 group-hover:text-[#13ec49]'
                                    }`}>
                                    {item.icon}
                                </span>
                                <span className="text-sm">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}

                {/* Payroll Management Dropdown */}
                <div>
                    <button
                        onClick={() => setIsPayrollOpen(!isPayrollOpen)}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all group text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-[#13ec49] transition-colors">
                                badge
                            </span>
                            <span className="text-sm font-medium">Chấm công</span>
                        </div>
                        <span className={`material-symbols-outlined text-sm transition-transform ${isPayrollOpen ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    {/* Submenu */}
                    <div className={`overflow-hidden transition-all duration-300 ${isPayrollOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="pl-6 mt-1 space-y-1">
                            {payrollItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${isActive
                                            ? 'bg-[#13ec49]/10 text-slate-900 font-bold'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <span className={`material-symbols-outlined text-[18px] transition-colors ${isActive ? 'text-[#13ec49]' : 'text-slate-400 group-hover:text-[#13ec49]'
                                                }`}>
                                                {item.icon}
                                            </span>
                                            <span className="text-sm">{item.label}</span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Master Data Dropdown */}
                <div>
                    <button
                        onClick={() => setIsMasterDataOpen(!isMasterDataOpen)}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all group text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-[#13ec49] transition-colors">
                                folder_open
                            </span>
                            <span className="text-sm">Danh mục</span>
                        </div>
                        <span className={`material-symbols-outlined text-sm transition-transform ${isMasterDataOpen ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    {/* Submenu */}
                    <div className={`overflow-hidden transition-all duration-300 ${isMasterDataOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="pl-6 mt-1 space-y-1">
                            {masterDataItems.map((item) => (
                                item.disabled ? (
                                    <div key={item.label} className="px-3 py-1 text-slate-300 text-xs">
                                        {item.label}
                                    </div>
                                ) : (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${isActive
                                                ? 'bg-[#13ec49]/10 text-slate-900 font-bold'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <span className={`material-symbols-outlined text-[18px] transition-colors ${isActive ? 'text-[#13ec49]' : 'text-slate-400 group-hover:text-[#13ec49]'
                                                    }`}>
                                                    {item.icon}
                                                </span>
                                                <span className="text-sm">{item.label}</span>
                                            </>
                                        )}
                                    </NavLink>
                                )
                            ))}
                        </div>
                    </div>
                </div>

                {/* Warehouse Dropdown */}
                <div>
                    <button
                        onClick={() => setIsWarehouseOpen(!isWarehouseOpen)}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all group text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-[#13ec49] transition-colors">
                                warehouse
                            </span>
                            <span className="text-sm">Nhà kho</span>
                        </div>
                        <span className={`material-symbols-outlined text-sm transition-transform ${isWarehouseOpen ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    {/* Submenu */}
                    <div className={`overflow-hidden transition-all duration-300 ${isWarehouseOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="pl-6 mt-1 space-y-1">
                            {warehouseItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${isActive
                                            ? 'bg-[#13ec49]/10 text-slate-900 font-bold'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <span className={`material-symbols-outlined text-[18px] transition-colors ${isActive ? 'text-[#13ec49]' : 'text-slate-400 group-hover:text-[#13ec49]'
                                                }`}>
                                                {item.icon}
                                            </span>
                                            <span className="text-sm">{item.label}</span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>

                {/* System Settings Dropdown */}
                <div>
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all group text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-[#13ec49] transition-colors">
                                settings
                            </span>
                            <span className="text-sm font-medium">Cài đặt hệ thống</span>
                        </div>
                        <span className={`material-symbols-outlined text-sm transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    {/* Submenu */}
                    <div className={`overflow-hidden transition-all duration-300 ${isSettingsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="pl-6 mt-1 space-y-1">
                            {settingsItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${isActive
                                            ? 'bg-[#13ec49]/10 text-slate-900 font-bold'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <span className={`material-symbols-outlined text-[18px] transition-colors ${isActive ? 'text-[#13ec49]' : 'text-slate-400 group-hover:text-[#13ec49]'
                                                }`}>
                                                {item.icon}
                                            </span>
                                            <span className="text-sm">{item.label}</span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="p-4 border-t border-slate-100 mt-auto">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-slate-500 hover:bg-red-50 hover:text-red-600 group"
                >
                    <span className="material-symbols-outlined transition-colors group-hover:text-red-500">
                        logout
                    </span>
                    <span className="text-sm font-medium">Đăng xuất</span>
                </button>
            </div>
        </aside>

    );
};

export default Sidebar;
