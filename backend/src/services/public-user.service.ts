import pool from '../config/database';
import { hashPassword } from '../helpers/hash.helper';

export interface PublicUser {
    id: string;
    email?: string;
    phone?: string;
    password_hash?: string;
    full_name?: string;
    avatar_id?: string;
    google_id?: string;
    facebook_id?: string;
    is_verified: boolean;
    is_active: boolean;
    login_attempts: number;
    created_at: Date;
    last_login_at?: Date;
    deleted_at?: Date;
}

export const getPublicUsers = async (): Promise<PublicUser[]> => {
    const query = 'SELECT id, email, phone, full_name, avatar_id, google_id, facebook_id, is_verified, is_active, login_attempts, created_at, last_login_at FROM public_users WHERE deleted_at IS NULL ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
};

export const getPublicUserById = async (id: string): Promise<PublicUser | null> => {
    const query = 'SELECT id, email, phone, full_name, avatar_id, google_id, facebook_id, is_verified, is_active, login_attempts, created_at, last_login_at FROM public_users WHERE id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

export const createPublicUser = async (data: any): Promise<PublicUser> => {
    let passwordHash = null;
    if (data.password) {
        passwordHash = await hashPassword(data.password);
    }

    const query = `
        INSERT INTO public_users (email, phone, password_hash, full_name, avatar_id, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, phone, full_name, avatar_id, is_verified, is_active, created_at
    `;
    const values = [
        data.email || null,
        data.phone || null,
        passwordHash,
        data.full_name || null,
        data.avatar_id || null,
        data.is_active !== undefined ? data.is_active : true
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const updatePublicUser = async (id: string, data: any): Promise<PublicUser | null> => {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.full_name !== undefined) {
        fields.push(`full_name = $${paramIndex++}`);
        values.push(data.full_name);
    }
    if (data.email !== undefined) {
        fields.push(`email = $${paramIndex++}`);
        values.push(data.email);
    }
    if (data.phone !== undefined) {
        fields.push(`phone = $${paramIndex++}`);
        values.push(data.phone);
    }
    if (data.is_active !== undefined) {
        fields.push(`is_active = $${paramIndex++}`);
        values.push(data.is_active);
    }
    if (data.password) {
        const passwordHash = await hashPassword(data.password);
        fields.push(`password_hash = $${paramIndex++}`);
        values.push(passwordHash);
    }

    if (fields.length === 0) return getPublicUserById(id);

    values.push(id);
    const query = `
        UPDATE public_users 
        SET ${fields.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING id, email, phone, full_name, avatar_id, is_verified, is_active, created_at
    `;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

export const deletePublicUser = async (id: string): Promise<boolean> => {
    const query = 'UPDATE public_users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
};

// User-Role assignment
export const getUserRoles = async (userId: string) => {
    const query = `
        SELECT r.* FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

export const assignRoleToUser = async (userId: string, roleId: string) => {
    const query = 'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING';
    await pool.query(query, [userId, roleId]);
};

export const removeRoleFromUser = async (userId: string, roleId: string) => {
    const query = 'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2';
    await pool.query(query, [userId, roleId]);
};
