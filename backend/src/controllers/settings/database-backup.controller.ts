import { Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as fsSync from 'fs';

const execAsync = promisify(exec);

/**
 * Controller xử lý backup và restore database
 */
export class DatabaseBackupController {
    /**
     * Lấy danh sách các file backup
     */
    static async getBackupList(_req: Request, res: Response): Promise<void> {
        try {
            const backupDir = path.join(__dirname, '../../../backups');

            // Tạo thư mục backups nếu chưa tồn tại
            if (!fsSync.existsSync(backupDir)) {
                fsSync.mkdirSync(backupDir, { recursive: true });
            }

            const files = await fs.readdir(backupDir);
            const backupFiles = await Promise.all(
                files
                    .filter(file => file.endsWith('.sql'))
                    .map(async (file) => {
                        const filePath = path.join(backupDir, file);
                        const stats = await fs.stat(filePath);
                        return {
                            filename: file,
                            size: stats.size,
                            created_at: stats.birthtime,
                            path: filePath
                        };
                    })
            );

            // Sắp xếp theo thời gian tạo mới nhất
            backupFiles.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

            res.json({
                success: true,
                data: backupFiles
            });
        } catch (error: any) {
            console.error('Error getting backup list:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách backup',
                error: error.message
            });
        }
    }

    /**
     * Tạo backup database
     */
    static async createBackup(_req: Request, res: Response): Promise<void> {
        try {
            const backupDir = path.join(__dirname, '../../../backups');

            // Tạo thư mục backups nếu chưa tồn tại
            if (!fsSync.existsSync(backupDir)) {
                fsSync.mkdirSync(backupDir, { recursive: true });
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `backup_${timestamp}.sql`;
            const backupPath = path.join(backupDir, filename);

            // Lấy thông tin kết nối database từ biến môi trường
            const dbHost = process.env.DB_HOST || 'localhost';
            const dbPort = process.env.DB_PORT || '5432';
            const dbName = process.env.DB_NAME || 'greenacres';
            const dbUser = process.env.DB_USER || 'postgres';
            const dbPassword = process.env.DB_PASSWORD || '';

            // Tạo command pg_dump (Windows-compatible)
            // Sử dụng đường dẫn đầy đủ vì PowerShell spawn từ Node không kế thừa PATH
            const pgBinPath = process.env.PG_BIN_PATH || 'C:\\Program Files\\PostgreSQL\\18\\bin';
            const pgDumpExe = `${pgBinPath}\\pg_dump.exe`;
            const command = `powershell -Command "$env:PGPASSWORD='${dbPassword}'; & '${pgDumpExe}' -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p -f '${backupPath}'"`;

            console.log('🔧 Executing backup command...');
            console.log('📁 Backup path:', backupPath);
            console.log('🗄️ Database:', `${dbUser}@${dbHost}:${dbPort}/${dbName}`);
            console.log('🔨 pg_dump path:', pgDumpExe);

            const { stdout, stderr } = await execAsync(command);

            if (stderr) {
                console.warn('⚠️ pg_dump stderr:', stderr);
            }
            if (stdout) {
                console.log('✅ pg_dump stdout:', stdout);
            }

            // Kiểm tra file có được tạo không
            if (!fsSync.existsSync(backupPath)) {
                throw new Error('File backup không được tạo. Vui lòng kiểm tra log.');
            }

            const stats = await fs.stat(backupPath);

            console.log('✅ Backup created successfully:', filename, `(${stats.size} bytes)`);

            res.json({
                success: true,
                message: 'Backup database thành công',
                data: {
                    filename,
                    size: stats.size,
                    created_at: stats.birthtime,
                    path: backupPath
                }
            });
        } catch (error: any) {
            console.error('❌ Error creating backup:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                stderr: error.stderr,
                stdout: error.stdout
            });

            res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo backup',
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? {
                    stderr: error.stderr,
                    stdout: error.stdout,
                    code: error.code
                } : undefined
            });
        }
    }

    /**
     * Restore database từ file backup
     */
    static async restoreBackup(req: Request, res: Response): Promise<void> {
        try {
            const { filename } = req.body;

            if (!filename) {
                res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp tên file backup'
                });
                return;
            }

            const backupDir = path.join(__dirname, '../../../backups');
            const backupPath = path.join(backupDir, filename);

            // Kiểm tra file có tồn tại không
            if (!fsSync.existsSync(backupPath)) {
                res.status(404).json({
                    success: false,
                    message: 'File backup không tồn tại'
                });
                return;
            }

            // Lấy thông tin kết nối database từ biến môi trường
            const dbHost = process.env.DB_HOST || 'localhost';
            const dbPort = process.env.DB_PORT || '5432';
            const dbName = process.env.DB_NAME || 'greenacres';
            const dbUser = process.env.DB_USER || 'postgres';
            const dbPassword = process.env.DB_PASSWORD || '';

            // Tạo command psql để restore (Windows-compatible)
            const pgBinPath = process.env.PG_BIN_PATH || 'C:\\Program Files\\PostgreSQL\\18\\bin';
            const psqlExe = `${pgBinPath}\\psql.exe`;
            const command = `powershell -Command "$env:PGPASSWORD='${dbPassword}'; & '${psqlExe}' -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f '${backupPath}'"`;

            await execAsync(command);

            res.json({
                success: true,
                message: 'Restore database thành công'
            });
        } catch (error: any) {
            console.error('Error restoring backup:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi restore database',
                error: error.message
            });
        }
    }

    /**
     * Xóa file backup
     */
    static async deleteBackup(req: Request, res: Response): Promise<void> {
        try {
            const { filename } = req.params;

            if (!filename) {
                res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp tên file backup'
                });
                return;
            }

            const backupDir = path.join(__dirname, '../../../backups');
            const backupPath = path.join(backupDir, filename);

            // Kiểm tra file có tồn tại không
            if (!fsSync.existsSync(backupPath)) {
                res.status(404).json({
                    success: false,
                    message: 'File backup không tồn tại'
                });
                return;
            }

            await fs.unlink(backupPath);

            res.json({
                success: true,
                message: 'Xóa file backup thành công'
            });
        } catch (error: any) {
            console.error('Error deleting backup:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa file backup',
                error: error.message
            });
        }
    }

    /**
     * Download file backup
     */
    static async downloadBackup(req: Request, res: Response): Promise<void> {
        try {
            const { filename } = req.params;

            if (!filename) {
                res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp tên file backup'
                });
                return;
            }

            const backupDir = path.join(__dirname, '../../../backups');
            const backupPath = path.join(backupDir, filename);

            // Kiểm tra file có tồn tại không
            if (!fsSync.existsSync(backupPath)) {
                res.status(404).json({
                    success: false,
                    message: 'File backup không tồn tại'
                });
                return;
            }

            res.download(backupPath, filename);
        } catch (error: any) {
            console.error('Error downloading backup:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi tải file backup',
                error: error.message
            });
        }
    }
}
