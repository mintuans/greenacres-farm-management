import pool from '../config/database';

export interface WorkSchedule {
    id: string;
    partner_id: string;
    shift_id: string;
    job_type_id: string;
    work_date: string;
    status: string;
    note?: string;
    partner_name?: string;
    shift_name?: string;
    job_name?: string;
    season_id?: string;
    season_name?: string;
}

export const getWorkSchedules = async (): Promise<WorkSchedule[]> => {
    const query = `
        SELECT ws.*, p.partner_name, s.shift_name, j.job_name, sn.season_name
        FROM work_schedules ws
        LEFT JOIN partners p ON ws.partner_id = p.id
        LEFT JOIN work_shifts s ON ws.shift_id = s.id
        LEFT JOIN job_types j ON ws.job_type_id = j.id
        LEFT JOIN seasons sn ON ws.season_id = sn.id
        ORDER BY ws.work_date DESC, s.start_time ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

export const createWorkSchedule = async (data: any): Promise<WorkSchedule> => {
    // Chuyển empty string thành null để tránh lỗi UUID trong Postgres
    const seasonId = data.season_id && data.season_id !== '' ? data.season_id : null;

    const query = `
        INSERT INTO work_schedules (partner_id, shift_id, job_type_id, work_date, status, note, season_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `;
    const values = [data.partner_id, data.shift_id, data.job_type_id, data.work_date, data.status, data.note, seasonId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const updateWorkSchedule = async (id: string, data: any): Promise<WorkSchedule | null> => {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = ['partner_id', 'shift_id', 'job_type_id', 'work_date', 'status', 'note', 'season_id'];
    for (const key of allowedFields) {
        if (data[key] !== undefined) {
            fields.push(`${key} = $${paramIndex++}`);
            // Chuyển empty string thành null cho season_id
            if (key === 'season_id' && (data[key] === '' || data[key] === null)) {
                values.push(null);
            } else {
                values.push(data[key]);
            }
        }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
        UPDATE work_schedules 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

export const deleteWorkSchedule = async (id: string): Promise<boolean> => {
    const query = 'DELETE FROM work_schedules WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
};
