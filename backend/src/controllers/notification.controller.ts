import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';

export const getMyNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const notifications = await notificationService.getUserNotifications(userId, limit, offset);
        const unreadCount = await notificationService.getUnreadCount(userId);

        return res.json({
            success: true,
            data: {
                notifications,
                unreadCount
            }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const markRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        await notificationService.markAsRead(userId, id);
        return res.json({ success: true, message: 'Marked as read' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const markAllRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        await notificationService.markAllAsRead(userId);
        return res.json({ success: true, message: 'All marked as read' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const removeNotification = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        await notificationService.deleteNotification(userId, id);
        return res.json({ success: true, message: 'Notification removed' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Admin/System endpoint to broadcast or send notification
export const sendNotify = async (req: Request, res: Response) => {
    try {
        const { title, content, recipient_ids, type, category, link, metadata } = req.body;
        const sender_id = (req as any).user?.id;

        if (!title || !content || !recipient_ids || !Array.isArray(recipient_ids)) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        await notificationService.sendNotification({
            title,
            content,
            recipient_ids,
            type,
            category,
            link,
            metadata,
            sender_id
        });

        return res.json({ success: true, message: 'Notification sent' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getSentHistory = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const notifications = await notificationService.getSentNotifications(userId, limit, offset);

        return res.json({
            success: true,
            data: notifications
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const revokeNotify = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { id } = req.params;

        const success = await notificationService.revokeNotification(id, userId);
        if (!success) {
            return res.status(403).json({ success: false, message: 'Cannot revoke this notification' });
        }

        return res.json({ success: true, message: 'Notification revoked' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
