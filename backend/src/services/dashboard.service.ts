import pool from '../config/database';

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
export const getDashboardStats = async (startDate?: string, endDate?: string): Promise<DashboardStats> => {
    const query = `SELECT * FROM get_dashboard_stats($1, $2)`;
    const values = [startDate || null, endDate || null];

    const result = await pool.query(query, values);
    return result.rows[0];
};

/**
 * Lấy lịch sử dòng tiền (Thu nhập vs Chi phí theo tháng)
 */
export const getCashFlowHistory = async (months: number = 6): Promise<CashFlowData[]> => {
    const query = `SELECT * FROM get_cash_flow_history($1)`;
    const result = await pool.query(query, [months]);
    return result.rows;
};

/**
 * Lấy danh sách vật tư sắp hết
 */
export const getLowStockItems = async (limit: number = 10): Promise<LowStockItem[]> => {
    const query = `SELECT * FROM get_low_stock_items($1)`;
    const result = await pool.query(query, [limit]);
    return result.rows;
};

/**
 * Lấy danh sách nhân viên có số dư cao nhất
 */
export const getTopWorkers = async (limit: number = 10): Promise<TopWorker[]> => {
    const query = `SELECT * FROM get_top_workers_by_balance($1)`;
    const result = await pool.query(query, [limit]);
    return result.rows;
};
