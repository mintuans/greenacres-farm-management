
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

// Lấy tất cả payrolls
export const getAllPayrolls = async (): Promise<Payroll[]> => {
    const query = `
        SELECT p.*, pt.partner_name
        FROM payrolls p
        JOIN partners pt ON p.partner_id = pt.id
        ORDER BY p.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

// Lấy payroll theo ID
export const getPayrollById = async (id: string): Promise<Payroll | null> => {
    const query = `
        SELECT p.*, pt.partner_name
        FROM payrolls p
        JOIN partners pt ON p.partner_id = pt.id
        WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

// Lấy payrolls theo season
export const getPayrollsBySeason = async (seasonId: string): Promise<Payroll[]> => {
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

// Lấy payrolls theo partner (nhân viên)
export const getPayrollsByPartner = async (partnerId: string): Promise<Payroll[]> => {
    const query = `
        SELECT p.*, pt.partner_name
        FROM payrolls p
        JOIN partners pt ON p.partner_id = pt.id
        WHERE p.partner_id = $1
        ORDER BY p.created_at DESC
    `;
    const result = await pool.query(query, [partnerId]);
    return result.rows;
};

// Tạo payroll mới
export const createPayroll = async (data: any): Promise<Payroll> => {
    const query = `
        INSERT INTO payrolls (
            payroll_code, partner_id, total_amount, bonus, 
            deductions, final_amount, status, payment_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;
    const values = [
        data.payroll_code,
        data.partner_id,
        data.total_amount || 0,
        data.bonus || 0,
        data.deductions || 0,
        data.final_amount,
        data.status || 'DRAFT',
        data.payment_date || null
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Cập nhật payroll
export const updatePayroll = async (id: string, data: any): Promise<Payroll | null> => {
    const fields = ['total_amount', 'bonus', 'deductions', 'final_amount', 'status', 'payment_date'];
    const values: any[] = [];
    const setClauses = fields
        .map((field) => {
            if (data[field] !== undefined) {
                values.push(data[field]);
                return `${field} = $${values.length}`;
            }
            return null;
        })
        .filter(Boolean);

    if (setClauses.length === 0) return null;

    values.push(id);
    const query = `
        UPDATE payrolls 
        SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${values.length} 
        RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Cập nhật trạng thái payroll (Quan trọng: Trigger sẽ tự động tạo transaction khi chuyển sang PAID)
export const updatePayrollStatus = async (id: string, status: string, paymentDate?: string): Promise<Payroll | null> => {
    const query = `
        UPDATE payrolls 
        SET status = $1, 
            payment_date = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 
        RETURNING *
    `;
    const values = [status, paymentDate || new Date().toISOString(), id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Xóa payroll
export const deletePayroll = async (id: string): Promise<boolean> => {
    const result = await pool.query('DELETE FROM payrolls WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
};

// Lấy thống kê payroll
export const getPayrollStats = async (): Promise<any> => {
    const query = `
        SELECT 
            COUNT(*)::INTEGER as total_payrolls,
            COUNT(CASE WHEN status = 'DRAFT' THEN 1 END)::INTEGER as draft_count,
            COUNT(CASE WHEN status = 'APPROVED' THEN 1 END)::INTEGER as approved_count,
            COUNT(CASE WHEN status = 'PAID' THEN 1 END)::INTEGER as paid_count,
            COALESCE(SUM(CASE WHEN status = 'PAID' THEN final_amount ELSE 0 END), 0)::NUMERIC as total_paid_amount,
            COALESCE(SUM(CASE WHEN status IN ('DRAFT', 'APPROVED') THEN final_amount ELSE 0 END), 0)::NUMERIC as pending_amount
        FROM payrolls
    `;
    const result = await pool.query(query);
    return result.rows[0];
};
