import pool from '../config/database';

export interface AuditLog {
    id: string;
    user_id?: string;
    full_name?: string; // from join
    action: string;
    entity_table?: string;
    entity_id?: string;
    old_values?: any;
    new_values?: any;
    ip_address?: string;
    user_agent?: string;
    created_at: Date;
}

export const getAuditLogs = async (limit: number = 100): Promise<AuditLog[]> => {
    const query = `
        SELECT a.*, u.full_name 
        FROM audit_logs a
        LEFT JOIN public_users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
        LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
};

export const createAuditLog = async (data: Partial<AuditLog>): Promise<AuditLog> => {
    const client = await pool.connect();
    try {
        const query = `
            INSERT INTO audit_logs (user_id, action, entity_table, entity_id, old_values, new_values, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [
            data.user_id,
            data.action,
            data.entity_table,
            data.entity_id,
            data.old_values ? JSON.stringify(data.old_values) : null,
            data.new_values ? JSON.stringify(data.new_values) : null,
            data.ip_address,
            data.user_agent
        ];
        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

/**
 * Helper để ghi nhật ký hành động từ Express Request
 */
export const logActivity = async (
    req: any,
    action: string,
    entityTable?: string,
    entityId?: string,
    oldValues?: any,
    newValues?: any,
    manualUserId?: string
) => {
    try {
        await createAuditLog({
            user_id: manualUserId || req.user?.id,
            action,
            entity_table: entityTable,
            entity_id: entityId,
            old_values: oldValues,
            new_values: newValues,
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.headers['user-agent']
        });
    } catch (error) {
        console.error('Audit log failed:', error);
        // Không throw lỗi để tránh làm gián đoạn luồng xử lý chính
    }
};
