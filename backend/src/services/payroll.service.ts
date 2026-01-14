
import pool from '../config/database';

export interface Payroll {
    id: string;
    payroll_code: string;
    partner_id: string;
    partner_name?: string;
    total_amount: number;
    bonus: number;
    deductions: number;
    final_amount: number;
    status: string;
    transaction_id?: string;
    payment_date?: string;
    created_at: string;
}

export const getPayrollsBySeason = async (seasonId: string): Promise<Payroll[]> => {
    // Để lấy được lương theo vụ mùa, ta phải Join qua bảng daily_work_logs
    const query = `
        SELECT DISTINCT p.*, pt.partner_name
        FROM payrolls p
        JOIN partners pt ON p.partner_id = pt.id
        JOIN daily_work_logs dl ON p.id = dl.payroll_id
        WHERE dl.season_id = $1
        ORDER BY p.created_at DESC
    `;
    const result = await pool.query(query, [seasonId]);
    return result.rows;
};
