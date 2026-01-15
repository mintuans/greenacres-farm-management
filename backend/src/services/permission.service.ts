import pool from '../config/database';

export interface Permission {
    id: string;
    module?: string;
    action?: string;
    code: string;
    description?: string;
    created_at: Date;
}

export const getPermissions = async (): Promise<Permission[]> => {
    const query = 'SELECT * FROM permissions ORDER BY module, code';
    const result = await pool.query(query);
    return result.rows;
};

export const getPermissionById = async (id: string): Promise<Permission | null> => {
    const query = 'SELECT * FROM permissions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

export const createPermission = async (data: Partial<Permission>): Promise<Permission> => {
    const query = `
        INSERT INTO permissions (module, action, code, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const values = [data.module, data.action, data.code, data.description];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const updatePermission = async (id: string, data: Partial<Permission>): Promise<Permission | null> => {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.module !== undefined) {
        fields.push(`module = $${paramIndex++}`);
        values.push(data.module);
    }
    if (data.action !== undefined) {
        fields.push(`action = $${paramIndex++}`);
        values.push(data.action);
    }
    if (data.code !== undefined) {
        fields.push(`code = $${paramIndex++}`);
        values.push(data.code);
    }
    if (data.description !== undefined) {
        fields.push(`description = $${paramIndex++}`);
        values.push(data.description);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
        UPDATE permissions 
        SET ${fields.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

export const deletePermission = async (id: string): Promise<boolean> => {
    const query = 'DELETE FROM permissions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
};

export const getDatabaseTables = async (): Promise<string[]> => {
    const query = "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename";
    const result = await pool.query(query);
    return result.rows.map(row => row.tablename);
};
