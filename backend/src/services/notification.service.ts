import pool from '../config/database';
import { getIO } from '../config/socket';

export interface Notification {
    id: string;
    title: string;
    content: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ALERT';
    category: string;
    link?: string;
    metadata?: any;
    sender_id?: string;
    created_at: Date;
    expires_at?: Date;
    is_read?: boolean;
    read_at?: Date;
}

export interface SendNotificationInput {
    title: string;
    content: string;
    type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ALERT';
    category?: string;
    link?: string;
    metadata?: any;
    sender_id?: string;
    recipient_ids: string[]; // List of users to receive this notification
}

// Send notification to one or more users
export const sendNotification = async (input: SendNotificationInput): Promise<void> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Create the notification content
        const notifQuery = `
            INSERT INTO notifications (title, content, type, category, link, metadata, sender_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, title, content, type, category, link, metadata, created_at
        `;
        const notifValues = [
            input.title,
            input.content,
            input.type || 'INFO',
            input.category || 'SYSTEM',
            input.link,
            input.metadata ? JSON.stringify(input.metadata) : null,
            input.sender_id
        ];
        const notifResult = await client.query(notifQuery, notifValues);
        const notification = notifResult.rows[0];

        // 2. Map to recipients
        const recipientQuery = `
            INSERT INTO notification_recipients (notification_id, user_id)
            SELECT $1, unnest($2::uuid[])
        `;
        await client.query(recipientQuery, [notification.id, input.recipient_ids]);

        await client.query('COMMIT');

        // 3. Socket emit to each user (if online)
        const io = getIO();
        input.recipient_ids.forEach(userId => {
            // We can emit to a user-specific room: 'user_{userId}'
            io.to(`user_${userId}`).emit('new_notification', {
                ...notification,
                is_read: false
            });
        });

    } catch (error) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error('ROLLBACK failed:', rollbackError);
        }
        console.error('Error sending notification:', error);
        throw error;
    } finally {
        client.release();
    }
};

// Get notifications for a specific user
export const getUserNotifications = async (userId: string, limit = 50, offset = 0): Promise<Notification[]> => {
    const query = `
        SELECT 
            n.id, n.title, n.content, n.type, n.category, n.link, n.metadata, 
            n.sender_id, n.created_at, nr.is_read, nr.read_at
        FROM notifications n
        JOIN notification_recipients nr ON n.id = nr.notification_id
        WHERE nr.user_id = $1 AND nr.deleted_at IS NULL
        ORDER BY n.created_at DESC
        LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
};

// Count unread notifications
export const getUnreadCount = async (userId: string): Promise<number> => {
    const query = `
        SELECT COUNT(*) as count 
        FROM notification_recipients 
        WHERE user_id = $1 AND is_read = false AND deleted_at IS NULL
    `;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
};

// Mark notification as read
export const markAsRead = async (userId: string, notificationId: string): Promise<void> => {
    const client = await pool.connect();
    try {
        const query = `
            UPDATE notification_recipients 
            SET is_read = true, read_at = CURRENT_TIMESTAMP 
            WHERE user_id = $1 AND notification_id = $2
        `;
        await client.query(query, [userId, notificationId]);
    } finally {
        client.release();
    }
};

// Mark all as read for a user
export const markAllAsRead = async (userId: string): Promise<void> => {
    const client = await pool.connect();
    try {
        const query = `
            UPDATE notification_recipients 
            SET is_read = true, read_at = CURRENT_TIMESTAMP 
            WHERE user_id = $1 AND is_read = false
        `;
        await client.query(query, [userId]);
    } finally {
        client.release();
    }
};

// Soft delete notification (for user)
export const deleteNotification = async (userId: string, notificationId: string): Promise<void> => {
    const client = await pool.connect();
    try {
        const query = `
            UPDATE notification_recipients 
            SET deleted_at = CURRENT_TIMESTAMP 
            WHERE user_id = $1 AND notification_id = $2
        `;
        await client.query(query, [userId, notificationId]);
    } finally {
        client.release();
    }
};

// Get notifications sent by a user
export const getSentNotifications = async (senderId: string, limit = 50, offset = 0): Promise<any[]> => {
    const query = `
        SELECT 
            n.*,
            (SELECT COUNT(*) FROM notification_recipients nr WHERE nr.notification_id = n.id) as total_recipients,
            (SELECT COUNT(*) FROM notification_recipients nr WHERE nr.notification_id = n.id AND nr.is_read = true) as read_count
        FROM notifications n
        WHERE n.sender_id = $1
        ORDER BY n.created_at DESC
        LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [senderId, limit, offset]);
    return result.rows;
};

// Revoke/Delete notification globally
export const revokeNotification = async (notificationId: string, senderId: string): Promise<boolean> => {
    const client = await pool.connect();
    try {
        // Check if the user is the sender (or could check if Super Admin)
        const checkQuery = `SELECT id FROM notifications WHERE id = $1 AND sender_id = $2`;
        const checkResult = await client.query(checkQuery, [notificationId, senderId]);

        if (checkResult.rows.length === 0) return false;

        const query = `DELETE FROM notifications WHERE id = $1`;
        const result = await client.query(query, [notificationId]);
        return (result.rowCount ?? 0) > 0;
    } finally {
        client.release();
    }
};
