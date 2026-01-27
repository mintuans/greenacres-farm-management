import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Get my notifications
router.get('/', notificationController.getMyNotifications);

// Mark as read
router.put('/:id/read', notificationController.markRead);

// Mark all as read
router.put('/read-all', notificationController.markAllRead);

// Remove notification
router.delete('/:id', notificationController.removeNotification);

// System/Admin send notification
router.post('/send', notificationController.sendNotify);

// Get sent history
router.get('/history', notificationController.getSentHistory);

// Revoke notification
router.delete('/revoke/:id', notificationController.revokeNotify);

export default router;
