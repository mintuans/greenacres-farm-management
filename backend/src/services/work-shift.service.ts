import pool from '../config/database';

export interface WorkShift {
    id: string;
    shift_code: string;
    shift_name: string;
    start_time?: string;
    end_time?: string;
}

export interface CreateWorkShiftInput {
    shift_code: string;
    shift_name: string;
    start_time?: string;
    end_time?: string;
}

export interface UpdateWorkShiftInput {
    shift_name?: string;
    start_time?: string;
    end_time?: string;
}

// Tạo ca làm việc mới
export const createWorkShift = async (data: CreateWorkShiftInput): Promise<WorkShift> => {
    const query = `
        INSERT INTO work_shifts (shift_code, shift_name, start_time, end_time)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const values = [data.shift_code, data.shift_name, data.start_time, data.end_time];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Lấy danh sách ca làm việc
export const getWorkShifts = async (): Promise<WorkShift[]> => {
    const query = 'SELECT * FROM work_shifts ORDER BY start_time ASC';
    const result = await pool.query(query);
    return result.rows;
};

// Lấy ca làm việc theo ID
export const getWorkShiftById = async (id: string): Promise<WorkShift | null> => {
    const query = 'SELECT * FROM work_shifts WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

// Cập nhật ca làm việc
export const updateWorkShift = async (id: string, data: UpdateWorkShiftInput): Promise<WorkShift | null> => {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.shift_name !== undefined) {
        fields.push(`shift_name = $${paramIndex++}`);
        values.push(data.shift_name);
    }
    if (data.start_time !== undefined) {
        fields.push(`start_time = $${paramIndex++}`);
        values.push(data.start_time);
    }
    if (data.end_time !== undefined) {
        fields.push(`end_time = $${paramIndex++}`);
        values.push(data.end_time);
    }

    if (fields.length === 0) {
        return getWorkShiftById(id);
    }

    values.push(id);
    const query = `
        UPDATE work_shifts 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

// Xóa ca làm việc
export const deleteWorkShift = async (id: string): Promise<boolean> => {
    const query = 'DELETE FROM work_shifts WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
};
