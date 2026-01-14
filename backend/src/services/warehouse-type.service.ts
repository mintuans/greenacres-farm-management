import pool from '../config/database';

export interface WarehouseType {
    id: string;
    warehouse_code: string;
    warehouse_name: string;
    description?: string;
    created_at?: string;
}

export const getAll = async (): Promise<WarehouseType[]> => {
    const result = await pool.query('SELECT * FROM warehouse_types ORDER BY created_at DESC');
    return result.rows;
};

export const getById = async (id: string): Promise<WarehouseType | null> => {
    const result = await pool.query('SELECT * FROM warehouse_types WHERE id = $1', [id]);
    return result.rows[0] || null;
};

export const create = async (data: Omit<WarehouseType, 'id'>): Promise<WarehouseType> => {
    const query = `
        INSERT INTO warehouse_types (warehouse_code, warehouse_name, description)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const values = [data.warehouse_code, data.warehouse_name, data.description];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const update = async (id: string, data: Partial<WarehouseType>): Promise<WarehouseType | null> => {
    const fields = ['warehouse_name', 'description'];
    const values: any[] = [];
    const setClauses = fields
        .map((field) => {
            if (data[field as keyof WarehouseType] !== undefined) {
                values.push(data[field as keyof WarehouseType]);
                return `${field} = $${values.length}`;
            }
            return null;
        })
        .filter(Boolean);

    if (setClauses.length === 0) return null;

    values.push(id);
    const query = `
        UPDATE warehouse_types 
        SET ${setClauses.join(', ')} 
        WHERE id = $${values.length} 
        RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const remove = async (id: string): Promise<boolean> => {
    const result = await pool.query('DELETE FROM warehouse_types WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
};
