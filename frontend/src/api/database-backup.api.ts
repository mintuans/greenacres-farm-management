import api from '../services/api';

export interface BackupFile {
    filename: string;
    size: number;
    created_at: string;
    path: string;
}

export interface BackupListResponse {
    success: boolean;
    data: BackupFile[];
}

export interface BackupResponse {
    success: boolean;
    message: string;
    data?: BackupFile;
}

/**
 * API service cho quản lý backup database
 */
export const databaseBackupApi = {
    /**
     * Lấy danh sách các file backup
     */
    getBackupList: async (): Promise<BackupListResponse> => {
        const response = await api.get('/management/database/backups');
        return response.data;
    },

    /**
     * Tạo backup mới
     */
    createBackup: async (): Promise<BackupResponse> => {
        const response = await api.post('/management/database/backups', {});
        return response.data;
    },

    /**
     * Restore database từ file backup
     */
    restoreBackup: async (filename: string): Promise<BackupResponse> => {
        const response = await api.post('/management/database/backups/restore', { filename });
        return response.data;
    },

    /**
     * Xóa file backup
     */
    deleteBackup: async (filename: string): Promise<BackupResponse> => {
        const response = await api.delete(`/management/database/backups/${filename}`);
        return response.data;
    },

    /**
     * Download file backup
     */
    downloadBackup: (filename: string): string => {
        const token = localStorage.getItem('farm_token');
        const baseURL = import.meta.env.VITE_API_URL || '/api';
        return `${baseURL}/management/database/backups/download/${filename}?token=${token}`;
    },
};
