import pool from '../config/database';

export interface Role {
    id: string;
    name: string;
    description?: string;
    is_system: boolean;
    created_at: Date;
}

export const getRoles = async (): Promise<Role[]> => {
    const query = 'SELECT * FROM roles ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
};

export const getRoleById = async (id: string): Promise<Role | null> => {
    const query = 'SELECT * FROM roles WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

export const createRole = async (data: Partial<Role>): Promise<Role> => {
    const client = await pool.connect();
    try {
        const query = `
            INSERT INTO roles (name, description, is_system)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [data.name, data.description, data.is_system || false];
        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

export const updateRole = async (id: string, data: Partial<Role>): Promise<Role | null> => {
    const client = await pool.connect();
    try {
        const query = `
            UPDATE roles 
            SET name = $1, description = $2 
            WHERE id = $3 AND is_system = FALSE
            RETURNING *
        `;
        const result = await client.query(query, [data.name, data.description, id]);
        return result.rows[0] || null;
    } finally {
        client.release();
    }
};

export const deleteRole = async (id: string): Promise<boolean> => {
    const client = await pool.connect();
    try {
        const query = 'DELETE FROM roles WHERE id = $1 AND is_system = FALSE';
        const result = await client.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    } finally {
        client.release();
    }
};

// Role-Permission assignment
export const assignPermissionToRole = async (roleId: string, permissionId: string) => {
    const client = await pool.connect();
    try {
        const query = 'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING';
        await client.query(query, [roleId, permissionId]);
    } finally {
        client.release();
    }
};

export const removePermissionFromRole = async (roleId: string, permissionId: string) => {
    const client = await pool.connect();
    try {
        const query = 'DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2';
        await client.query(query, [roleId, permissionId]);
    } finally {
        client.release();
    }
};

export const getRolePermissions = async (roleId: string) => {
    const query = `
        SELECT p.* FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = $1
    `;
    const result = await pool.query(query, [roleId]);
    return result.rows;
};
