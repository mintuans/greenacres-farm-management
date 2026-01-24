import api from '../services/api';

export interface DashboardStats {
    total_income: number;
    total_expense: number;
    net_profit: number;
    total_season_investment: number;
    income_growth_rate: number;
    expense_growth_rate: number;
    active_seasons_count: number;
    total_workers: number;
}

export interface CashFlowData {
    month_label: string;
    month_number: number;
    year_number: number;
    total_income: number;
    total_expense: number;
    net_profit: number;
}

export interface LowStockItem {
    item_id: string;
    item_code: string;
    item_name: string;
    category_name: string;
    current_quantity: number;
    min_stock_level: number;
    unit_of_measure: string;
    shortage_amount: number;
    shortage_percentage: number;
    last_import_price: number;
    thumbnail_url: string | null;
    urgency_level: 'CRITICAL' | 'WARNING' | 'LOW';
}

export interface TopWorker {
    worker_id: string;
    worker_code: string;
    worker_name: string;
    current_balance: number;
    total_paid: number;
    balance_percentage: number;
}

/**
 * Lấy thống kê tổng quan Dashboard
 */
export const getDashboardStats = async (startDate?: string, endDate?: string, seasonId?: string): Promise<DashboardStats> => {
    const response = await api.get('/management/dashboard/stats', {
        params: {
            start_date: startDate,
            end_date: endDate,
            season_id: seasonId
        }
    });
    return response.data.data;
};

/**
 * Lấy lịch sử dòng tiền
 */
export const getCashFlowHistory = async (months: number = 6): Promise<CashFlowData[]> => {
    const response = await api.get('/management/dashboard/cash-flow', {
        params: { months }
    });
    return response.data.data;
};

/**
 * Lấy danh sách vật tư sắp hết
 */
export const getLowStockItems = async (limit: number = 10): Promise<LowStockItem[]> => {
    const response = await api.get('/management/dashboard/low-stock', {
        params: { limit }
    });
    return response.data.data;
};

/**
 * Lấy danh sách nhân viên có số dư cao nhất
 */
export const getTopWorkers = async (limit: number = 10): Promise<TopWorker[]> => {
    const response = await api.get('/management/dashboard/top-workers', {
        params: { limit }
    });
    return response.data.data;
};
