import pool from '../config/database';

export interface JobType {
    id: string;
    job_code: string;
    job_name: string;
    base_rate: number;
    description?: string;
}

export interface CreateJobTypeInput {
    job_code: string;
    job_name: string;
    base_rate: number;
    description?: string;
}

export interface UpdateJobTypeInput {
    job_name?: string;
    base_rate?: number;
    description?: string;
}

// Tạo loại công việc mới
export const createJobType = async (data: CreateJobTypeInput): Promise<JobType> => {
    const query = `
        INSERT INTO job_types (job_code, job_name, base_rate, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const values = [data.job_code, data.job_name, data.base_rate, data.description];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Lấy danh sách loại công việc
export const getJobTypes = async (): Promise<JobType[]> => {
    const query = 'SELECT * FROM job_types ORDER BY job_name ASC';
    const result = await pool.query(query);
    return result.rows;
};

// Lấy loại công việc theo ID
export const getJobTypeById = async (id: string): Promise<JobType | null> => {
    const query = 'SELECT * FROM job_types WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

// Cập nhật loại công việc
export const updateJobType = async (id: string, data: UpdateJobTypeInput): Promise<JobType | null> => {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.job_name !== undefined) {
        fields.push(`job_name = $${paramIndex++}`);
        values.push(data.job_name);
    }
    if (data.base_rate !== undefined) {
        fields.push(`base_rate = $${paramIndex++}`);
        values.push(data.base_rate);
    }
    if (data.description !== undefined) {
        fields.push(`description = $${paramIndex++}`);
        values.push(data.description);
    }

    if (fields.length === 0) {
        return getJobTypeById(id);
    }

    values.push(id);
    const query = `
        UPDATE job_types 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

// Xóa loại công việc
export const deleteJobType = async (id: string): Promise<boolean> => {
    const query = 'DELETE FROM job_types WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
};

// Lấy thống kê
export const getJobTypeStats = async (): Promise<any> => {
    const query = `
        SELECT 
            COUNT(*) as total_job_types,
            AVG(base_rate) as average_rate,
            MIN(base_rate) as min_rate,
            MAX(base_rate) as max_rate
        FROM job_types
    `;
    const result = await pool.query(query);
    return result.rows[0];
};
