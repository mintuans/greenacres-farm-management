import { RouteObject } from 'react-router-dom';
import Dashboard from '@/src/pages/Dashboard';
import Schedule from '@/src/pages/Schedule';
import Inventory from '@/src/pages/Inventory';
import AddInventory from '@/src/pages/AddInventory';
import Seasons from '@/src/pages/Seasons';
import Transactions from '@/src/pages/Transactions';
import PersonalFinance from '@/src/pages/PersonalFinance';
import MasterData from '@/src/pages/MasterData';

/**
 * Cấu hình routes cho ứng dụng
 */
export const routes: RouteObject[] = [
    {
        path: '/dashboard',
        element: <Dashboard />,
    },
    {
        path: '/schedule',
        element: <Schedule />,
    },
    {
        path: '/inventory',
        element: <Inventory />,
    },
    {
        path: '/inventory/add',
        element: <AddInventory />,
    },
    {
        path: '/seasons',
        element: <Seasons />,
    },
    {
        path: '/transactions',
        element: <Transactions />,
    },

    {
        path: '/finance',
        element: <PersonalFinance />,
    },
    {
        path: '/settings',
        element: <MasterData />,
    },
];

/**
 * Route metadata cho navigation
 */
export const routeMetadata = {
    '/dashboard': {
        title: 'Tổng quan',
        icon: 'dashboard',
        description: 'Xem tổng quan hoạt động nông trại',
    },
    '/schedule': {
        title: 'Lịch làm việc',
        icon: 'calendar_month',
        description: 'Quản lý ca làm việc và sự kiện',
    },
    '/inventory': {
        title: 'Vật tư Nông nghiệp',
        icon: 'inventory_2',
        description: 'Quản lý vật tư và nguyên liệu',
    },
    '/seasons': {
        title: 'Mùa vụ',
        icon: 'grass',
        description: 'Theo dõi các mùa vụ canh tác',
    },
    '/transactions': {
        title: 'Giao dịch',
        icon: 'payments',
        description: 'Quản lý giao dịch thu chi',
    },

    '/finance': {
        title: 'Tài chính cá nhân',
        icon: 'savings',
        description: 'Quản lý tài chính cá nhân',
    },
    '/settings': {
        title: 'Cài đặt hệ thống',
        icon: 'settings',
        description: 'Cấu hình hệ thống',
    },
} as const;
