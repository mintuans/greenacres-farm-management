import pool from '../config/database';

export interface Season {
    id: string;
    unit_id: string;
    season_code: string;
    season_name: string;
    start_date: Date;
    end_date?: Date;
    status: string;
    expected_revenue?: number;
    unit_name?: string; // Join field
}

export interface CreateSeasonInput {
    unit_id: string;
    season_code: string;
    season_name: string;
    start_date: string;
    end_date?: string;
    expected_revenue?: number;
}

export interface UpdateSeasonInput {
    unit_id?: string;
    season_name?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    expected_revenue?: number;
}

// Tạo mùa vụ mới
export const createSeason = async (data: CreateSeasonInput): Promise<Season> => {
    const client = await pool.connect();
    try {
        const query = `
            INSERT INTO seasons (unit_id, season_code, season_name, start_date, end_date, expected_revenue)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            data.unit_id,
            data.season_code,
            data.season_name,
            data.start_date,
            data.end_date || null,
            data.expected_revenue || null
        ];
        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

// Lấy danh sách mùa vụ
export const getSeasons = async (status?: string, unitId?: string): Promise<Season[]> => {
    let query = `
        SELECT 
            s.id, s.unit_id, s.season_code, s.season_name, 
            s.start_date, s.end_date, s.status, s.expected_revenue,
            pu.unit_name
        FROM seasons s
        LEFT JOIN production_units pu ON s.unit_id = pu.id
        WHERE 1=1
    `;
    const values: any[] = [];
    let paramIndex = 1;

    if (status) {
        query += ` AND s.status = $${paramIndex++}`;
        values.push(status);
    }

    if (unitId) {
        query += ` AND s.unit_id = $${paramIndex++}`;
        values.push(unitId);
    }

    query += ' ORDER BY s.start_date DESC';

    const result = await pool.query(query, values);
    return result.rows;
};

// Lấy mùa vụ theo ID
export const getSeasonById = async (id: string): Promise<Season | null> => {
    const query = `
        SELECT 
            s.id, s.unit_id, s.season_code, s.season_name, 
            s.start_date, s.end_date, s.status, s.expected_revenue,
            pu.unit_name
        FROM seasons s
        LEFT JOIN production_units pu ON s.unit_id = pu.id
        WHERE s.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

// Cập nhật mùa vụ
export const updateSeason = async (id: string, data: UpdateSeasonInput): Promise<Season | null> => {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.unit_id !== undefined) {
        fields.push(`unit_id = $${paramIndex++}`);
        values.push(data.unit_id);
    }
    if (data.season_name !== undefined) {
        fields.push(`season_name = $${paramIndex++}`);
        values.push(data.season_name);
    }
    if (data.start_date !== undefined) {
        fields.push(`start_date = $${paramIndex++}`);
        values.push(data.start_date);
    }
    if (data.end_date !== undefined) {
        fields.push(`end_date = $${paramIndex++}`);
        values.push(data.end_date);
    }
    if (data.status !== undefined) {
        fields.push(`status = $${paramIndex++}`);
        values.push(data.status);
    }
    if (data.expected_revenue !== undefined) {
        fields.push(`expected_revenue = $${paramIndex++}`);
        values.push(data.expected_revenue);
    }

    if (fields.length === 0) {
        return getSeasonById(id);
    }

    const client = await pool.connect();
    try {
        values.push(id);
        const query = `
            UPDATE seasons 
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

// Xóa mùa vụ
export const deleteSeason = async (id: string): Promise<boolean> => {
    const client = await pool.connect();
    try {
        const query = 'DELETE FROM seasons WHERE id = $1';
        const result = await client.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    } finally {
        client.release();
    }
};

// Đóng mùa vụ
export const closeSeason = async (id: string): Promise<Season | null> => {
    const client = await pool.connect();
    try {
        const query = `
            UPDATE seasons 
            SET status = 'CLOSED', end_date = CURRENT_DATE
            WHERE id = $1
            RETURNING *
        `;
        const result = await client.query(query, [id]);
        return result.rows[0] || null;
    } finally {
        client.release();
    }
};

// Thống kê mùa vụ
export const getSeasonStats = async (): Promise<any> => {
    const query = `
        SELECT 
            status,
            COUNT(*) as count,
            SUM(expected_revenue) as total_expected_revenue
        FROM seasons
        GROUP BY status
    `;
    const result = await pool.query(query);
    return result.rows;
};

// Lấy mã vụ mùa tiếp theo (MUAVU01, MUAVU02...)
export const getNextSeasonCode = async (): Promise<string> => {
    const query = `
        SELECT season_code 
        FROM seasons 
        WHERE season_code LIKE 'MUAVU%' 
        ORDER BY season_code DESC 
        LIMIT 1
    `;
    const result = await pool.query(query);

    if (result.rows.length === 0) {
        return 'MUAVU01';
    }

    const lastCode = result.rows[0].season_code;
    const lastNumber = parseInt(lastCode.replace('MUAVU', ''), 10);
    const nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;

    // Format thành MUAVUXX (ít nhất 2 chữ số)
    return `MUAVU${nextNumber.toString().padStart(2, '0')}`;
};
