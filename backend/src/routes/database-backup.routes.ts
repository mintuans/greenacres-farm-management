import { Router } from 'express';
import { DatabaseBackupController } from '../controllers/settings/database-backup.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * Routes cho quản lý backup database
 * Tất cả routes đều yêu cầu authentication
 */

// Lấy danh sách backup
router.get('/backups', authenticate, DatabaseBackupController.getBackupList);

// Tạo backup mới
router.post('/backups', authenticate, DatabaseBackupController.createBackup);

// Restore từ backup
router.post('/backups/restore', authenticate, DatabaseBackupController.restoreBackup);

// Xóa backup
router.delete('/backups/:filename', authenticate, DatabaseBackupController.deleteBackup);

// Download backup
router.get('/backups/download/:filename', authenticate, DatabaseBackupController.downloadBackup);

export default router;
