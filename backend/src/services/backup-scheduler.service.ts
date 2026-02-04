import cron from 'node-cron';
import type { ScheduledTask } from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as fsSync from 'fs';

const execAsync = promisify(exec);

/**
 * Service quản lý tự động backup database theo lịch
 */
export class BackupSchedulerService {
    private static tasks: Map<string, ScheduledTask> = new Map();

    /**
     * Khởi động scheduler với cấu hình từ biến môi trường
     */
    static initialize(): void {
        const autoBackupEnabled = process.env.AUTO_BACKUP_ENABLED === 'true';
        const cronSchedule = process.env.AUTO_BACKUP_SCHEDULE || '0 2 * * *'; // Mặc định: 2:00 AM mỗi ngày

        if (autoBackupEnabled) {
            this.scheduleBackup('auto-backup', cronSchedule);
            console.log('✅ Auto backup scheduler initialized');
            console.log(`📅 Schedule: ${cronSchedule} (${this.describeCronSchedule(cronSchedule)})`);
        } else {
            console.log('ℹ️ Auto backup is disabled. Set AUTO_BACKUP_ENABLED=true in .env to enable.');
        }
    }

    /**
     * Lên lịch backup tự động
     */
    static scheduleBackup(taskName: string, cronExpression: string): void {
        // Hủy task cũ nếu có
        if (this.tasks.has(taskName)) {
            this.tasks.get(taskName)?.stop();
            this.tasks.delete(taskName);
        }

        // Validate cron expression
        if (!cron.validate(cronExpression)) {
            console.error(`❌ Invalid cron expression: ${cronExpression}`);
            return;
        }

        // Tạo task mới
        const task = cron.schedule(cronExpression, async () => {
            console.log(`🔄 [${taskName}] Starting scheduled backup...`);
            await this.performBackup(taskName);
        });

        this.tasks.set(taskName, task);
        console.log(`✅ Scheduled backup task: ${taskName} (${cronExpression})`);
    }

    /**
     * Thực hiện backup
     */
    private static async performBackup(taskName: string): Promise<void> {
        try {
            const backupDir = path.join(__dirname, '../../backups');

            // Tạo thư mục backups nếu chưa tồn tại
            if (!fsSync.existsSync(backupDir)) {
                fsSync.mkdirSync(backupDir, { recursive: true });
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `auto_backup_${timestamp}.sql`;
            const backupPath = path.join(backupDir, filename);

            // Lấy thông tin kết nối database
            const dbHost = process.env.DB_HOST || 'localhost';
            const dbPort = process.env.DB_PORT || '5432';
            const dbName = process.env.DB_NAME || 'quan_ly_nong_trai';
            const dbUser = process.env.DB_USER || 'postgres';
            const dbPassword = process.env.DB_PASSWORD || '';

            // Tạo command pg_dump
            // Determine Platform and Command
            const isWindows = process.platform === 'win32';
            let command = '';

            if (isWindows) {
                const pgBinPath = process.env.PG_BIN_PATH || 'C:\\Program Files\\PostgreSQL\\18\\bin';
                const pgDumpExe = `${pgBinPath}\\pg_dump.exe`;
                command = `powershell -Command "$env:PGPASSWORD='${dbPassword}'; & '${pgDumpExe}' -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p -f '${backupPath}'"`;
            } else {
                // Linux/Unix Logic
                // Use PGPASSWORD environment variable inline
                // Assuming pg_dump is in GLOBAL PATH on Linux (standard install)
                command = `PGPASSWORD='${dbPassword}' pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p -f '${backupPath}'`;
            }

            console.log(`📁 Backup path: ${backupPath}`);

            await execAsync(command);

            const stats = await fs.stat(backupPath);
            console.log(`✅ [${taskName}] Backup completed successfully: ${filename} (${this.formatFileSize(stats.size)})`);

            // Tự động xóa backup cũ nếu được cấu hình
            await this.cleanOldBackups(backupDir);
        } catch (error: any) {
            console.error(`❌ [${taskName}] Backup failed:`, error.message);
        }
    }

    /**
     * Xóa các backup cũ để tiết kiệm dung lượng
     */
    private static async cleanOldBackups(backupDir: string): Promise<void> {
        try {
            const maxBackups = parseInt(process.env.AUTO_BACKUP_MAX_FILES || '30');
            const maxDays = parseInt(process.env.AUTO_BACKUP_MAX_DAYS || '30');

            const files = await fs.readdir(backupDir);
            const backupFiles = await Promise.all(
                files
                    .filter(file => file.startsWith('auto_backup_') && file.endsWith('.sql'))
                    .map(async (file) => {
                        const filePath = path.join(backupDir, file);
                        const stats = await fs.stat(filePath);
                        return {
                            filename: file,
                            path: filePath,
                            created: stats.birthtime,
                            size: stats.size
                        };
                    })
            );

            // Sắp xếp theo thời gian tạo (mới nhất trước)
            backupFiles.sort((a, b) => b.created.getTime() - a.created.getTime());

            const now = new Date();
            let deletedCount = 0;

            for (let i = 0; i < backupFiles.length; i++) {
                const file = backupFiles[i];
                const ageInDays = (now.getTime() - file.created.getTime()) / (1000 * 60 * 60 * 24);

                // Xóa nếu vượt quá số lượng hoặc quá cũ
                if (i >= maxBackups || ageInDays > maxDays) {
                    await fs.unlink(file.path);
                    deletedCount++;
                    console.log(`🗑️ Deleted old backup: ${file.filename} (${Math.floor(ageInDays)} days old)`);
                }
            }

            if (deletedCount > 0) {
                console.log(`✅ Cleaned up ${deletedCount} old backup(s)`);
            }
        } catch (error: any) {
            console.error('❌ Error cleaning old backups:', error.message);
        }
    }

    /**
     * Dừng tất cả scheduled tasks
     */
    static stopAll(): void {
        this.tasks.forEach((task, name) => {
            task.stop();
            console.log(`⏹️ Stopped backup task: ${name}`);
        });
        this.tasks.clear();
    }

    /**
     * Lấy danh sách các task đang chạy
     */
    static getActiveTasks(): string[] {
        return Array.from(this.tasks.keys());
    }

    /**
     * Mô tả cron schedule bằng tiếng Việt
     */
    private static describeCronSchedule(cronExpression: string): string {
        const descriptions: { [key: string]: string } = {
            '0 2 * * *': 'Mỗi ngày lúc 2:00 AM',
            '0 */6 * * *': 'Mỗi 6 giờ',
            '0 0 * * 0': 'Mỗi Chủ nhật lúc 12:00 AM',
            '0 0 1 * *': 'Ngày đầu tiên mỗi tháng lúc 12:00 AM',
            '*/30 * * * *': 'Mỗi 30 phút',
        };

        return descriptions[cronExpression] || cronExpression;
    }

    /**
     * Format file size
     */
    private static formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}
