import pool from '../config/database';

export interface ProductionUnit {
    id: string;
    unit_code: string;
    unit_name: string;
    type?: 'CROP' | 'LIVESTOCK';
    area_size?: number;
    description?: string;
}

export interface CreateProductionUnitInput {
    unit_code: string;
    unit_name: string;
    type?: 'CROP' | 'LIVESTOCK';
    area_size?: number;
    description?: string;
}

export interface UpdateProductionUnitInput {
    unit_name?: string;
    type?: 'CROP' | 'LIVESTOCK';
    area_size?: number;
    description?: string;
}

// Tạo đơn vị sản xuất mới
export const createProductionUnit = async (data: CreateProductionUnitInput): Promise<ProductionUnit> => {
    const client = await pool.connect();
    try {
        const query = `
            INSERT INTO production_units (unit_code, unit_name, type, area_size, description)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [data.unit_code, data.unit_name, data.type, data.area_size, data.description];
        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

// Lấy danh sách đơn vị sản xuất
export const getProductionUnits = async (type?: string): Promise<ProductionUnit[]> => {
    let query = 'SELECT * FROM production_units';
    const values: any[] = [];

    if (type) {
        query += ' WHERE type = $1';
        values.push(type);
    }

    query += ' ORDER BY unit_name ASC';

    const result = await pool.query(query, values);
    return result.rows;
};

// Lấy đơn vị sản xuất theo ID
export const getProductionUnitById = async (id: string): Promise<ProductionUnit | null> => {
    const query = 'SELECT * FROM production_units WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

// Cập nhật đơn vị sản xuất
export const updateProductionUnit = async (id: string, data: UpdateProductionUnitInput): Promise<ProductionUnit | null> => {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.unit_name !== undefined) {
        fields.push(`unit_name = $${paramIndex++}`);
        values.push(data.unit_name);
    }
    if (data.type !== undefined) {
        fields.push(`type = $${paramIndex++}`);
        values.push(data.type);
    }
    if (data.area_size !== undefined) {
        fields.push(`area_size = $${paramIndex++}`);
        values.push(data.area_size);
    }
    if (data.description !== undefined) {
        fields.push(`description = $${paramIndex++}`);
        values.push(data.description);
    }

    if (fields.length === 0) {
        return getProductionUnitById(id);
    }

    const client = await pool.connect();
    try {
        values.push(id);
        const query = `
            UPDATE production_units 
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

// Xóa đơn vị sản xuất
export const deleteProductionUnit = async (id: string): Promise<boolean> => {
    const client = await pool.connect();
    try {
        const query = 'DELETE FROM production_units WHERE id = $1';
        const result = await client.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    } finally {
        client.release();
    }
};

// Lấy thống kê theo loại
export const getProductionUnitStats = async (): Promise<any> => {
    const query = `
        SELECT 
            type,
            COUNT(*) as count,
            SUM(area_size) as total_area
        FROM production_units
        WHERE type IS NOT NULL
        GROUP BY type
    `;
    const result = await pool.query(query);
    return result.rows;
};
