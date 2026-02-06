
import pool from '../config/database';

export interface DailyWorkLog {
    id: string;
    partner_id: string;
    partner_name?: string;
    payroll_id?: string;
    payroll_code?: string;
    season_id?: string;
    unit_id?: string;
    schedule_id?: string;
    work_date: string;
    shift_id: string;
    shift_name?: string;
    job_type_id: string;
    job_name?: string;
    quantity: number;
    unit: string;
    applied_rate: number;
    total_amount: number;
    mandays: number;
    status: string;
    note?: string;
    created_at?: string;
}

export const getDailyWorkLogs = async (): Promise<DailyWorkLog[]> => {
    const query = `
        SELECT 
            dl.id, dl.partner_id, dl.payroll_id, dl.season_id, dl.unit_id, 
            dl.schedule_id, dl.work_date, dl.shift_id, dl.job_type_id, 
            dl.quantity, dl.unit, dl.applied_rate, dl.total_amount, 
            dl.mandays, dl.status, dl.note, dl.created_at,
            p.partner_name, s.shift_name, jt.job_name, pr.payroll_code, sn.season_name
        FROM daily_work_logs dl
        LEFT JOIN partners p ON dl.partner_id = p.id
        LEFT JOIN work_shifts s ON dl.shift_id = s.id
        LEFT JOIN job_types jt ON dl.job_type_id = jt.id
        LEFT JOIN payrolls pr ON dl.payroll_id = pr.id
        LEFT JOIN seasons sn ON dl.season_id = sn.id
        ORDER BY dl.work_date DESC, dl.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

export const getDailyWorkLogById = async (id: string): Promise<DailyWorkLog | null> => {
    const query = `
        SELECT 
            id, partner_id, payroll_id, season_id, unit_id, 
            schedule_id, work_date, shift_id, job_type_id, 
            quantity, unit, applied_rate, total_amount, 
            mandays, status, note, created_at
        FROM daily_work_logs 
        WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

export const createDailyWorkLog = async (data: any): Promise<DailyWorkLog> => {
    const client = await pool.connect();
    try {
        const query = `
            INSERT INTO daily_work_logs (
                partner_id, season_id, unit_id, schedule_id, work_date, 
                shift_id, job_type_id, quantity, unit, applied_rate, 
                total_amount, mandays, status, note
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `;
        const values = [
            data.partner_id,
            data.season_id && data.season_id !== '' ? data.season_id : null,
            data.unit_id && data.unit_id !== '' ? data.unit_id : null,
            data.schedule_id && data.schedule_id !== '' ? data.schedule_id : null,
            data.work_date,
            data.shift_id, data.job_type_id, data.quantity, data.unit, data.applied_rate,
            data.total_amount, data.mandays, data.status || 'DONE', data.note
        ];
        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

export const updateDailyWorkLog = async (id: string, data: any): Promise<DailyWorkLog | null> => {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
        'partner_id', 'season_id', 'unit_id', 'schedule_id', 'work_date',
        'shift_id', 'job_type_id', 'quantity', 'unit', 'applied_rate',
        'total_amount', 'mandays', 'status', 'note'
    ];

    const uuidFields = ['season_id', 'unit_id', 'schedule_id', 'payroll_id', 'partner_id', 'shift_id', 'job_type_id'];
    for (const key of allowedFields) {
        if (data[key] !== undefined) {
            fields.push(`${key} = $${paramIndex++}`);
            if (uuidFields.includes(key) && (data[key] === '' || data[key] === null)) {
                values.push(null);
            } else {
                values.push(data[key]);
            }
        }
    }

    if (fields.length === 0) return null;

    const client = await pool.connect();
    try {
        values.push(id);
        const query = `
            UPDATE daily_work_logs 
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        const result = await client.query(query, values);
        return result.rows[0] || null;
    } finally {
        client.release();
    }
};

export const deleteDailyWorkLog = async (id: string): Promise<boolean> => {
    const client = await pool.connect();
    try {
        const query = 'DELETE FROM daily_work_logs WHERE id = $1';
        const result = await client.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    } finally {
        client.release();
    }
};

// Gọi stored procedure confirm_schedule_to_log
export const confirmScheduleToLog = async (scheduleId: string, mandays: number): Promise<string> => {
    const client = await pool.connect();
    try {
        const query = 'SELECT confirm_schedule_to_log($1, $2) as log_id';
        const result = await client.query(query, [scheduleId, mandays]);
        return result.rows[0].log_id;
    } finally {
        client.release();
    }
};

// Gọi stored procedure calculate_payroll_from_log
export const calculatePayrollFromLog = async (logId: string): Promise<string> => {
    const client = await pool.connect();
    try {
        const query = 'SELECT calculate_payroll_from_log($1) as payroll_id';
        const result = await client.query(query, [logId]);
        return result.rows[0].payroll_id;
    } finally {
        client.release();
    }
};

// Gọi stored procedure calculate_payroll_bulk
export const calculatePayrollBulk = async (logIds: string[]): Promise<string> => {
    const client = await pool.connect();
    try {
        const query = 'SELECT calculate_payroll_bulk($1) as payroll_id';
        const result = await client.query(query, [logIds]);
        return result.rows[0].payroll_id;
    } finally {
        client.release();
    }
};
