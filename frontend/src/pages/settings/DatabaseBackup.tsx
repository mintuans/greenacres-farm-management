import React, { useState, useEffect } from 'react';
import { databaseBackupApi, BackupFile } from '@/src/api/database-backup.api';

const DatabaseBackup: React.FC = () => {
    const [backups, setBackups] = useState<BackupFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [restoring, setRestoring] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Load danh sách backup khi component mount
    useEffect(() => {
        loadBackups();
    }, []);

    /**
     * Tải danh sách backup
     */
    const loadBackups = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await databaseBackupApi.getBackupList();
            if (response.success) {
                setBackups(response.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi tải danh sách backup');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Tạo backup mới
     */
    const handleCreateBackup = async () => {
        if (!confirm('Bạn có chắc chắn muốn tạo backup mới?')) {
            return;
        }

        try {
            setCreating(true);
            setError(null);
            setSuccess(null);
            const response = await databaseBackupApi.createBackup();
            if (response.success) {
                setSuccess(response.message);
                loadBackups(); // Reload danh sách
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi tạo backup');
        } finally {
            setCreating(false);
        }
    };

    /**
     * Restore từ backup
     */
    const handleRestore = async (filename: string) => {
        if (!confirm(`⚠️ CẢNH BÁO: Restore sẽ ghi đè toàn bộ dữ liệu hiện tại!\n\nBạn có chắc chắn muốn restore từ file "${filename}"?`)) {
            return;
        }

        try {
            setRestoring(filename);
            setError(null);
            setSuccess(null);
            const response = await databaseBackupApi.restoreBackup(filename);
            if (response.success) {
                setSuccess(response.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi restore backup');
        } finally {
            setRestoring(null);
        }
    };

    /**
     * Xóa backup
     */
    const handleDelete = async (filename: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa file backup "${filename}"?`)) {
            return;
        }

        try {
            setError(null);
            setSuccess(null);
            const response = await databaseBackupApi.deleteBackup(filename);
            if (response.success) {
                setSuccess(response.message);
                loadBackups(); // Reload danh sách
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi xóa backup');
        }
    };

    /**
     * Download backup
     */
    const handleDownload = (filename: string) => {
        const downloadUrl = databaseBackupApi.downloadBackup(filename);
        window.open(downloadUrl, '_blank');
    };

    /**
     * Format file size
     */
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    /**
     * Format date
     */
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="max-w-7xl mx-auto p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-[#13ec49] text-4xl">backup</span>
                        <h1 className="text-3xl font-black text-slate-900">Backup & Restore</h1>
                    </div>
                    <p className="text-slate-600 pl-12">Quản lý sao lưu và khôi phục cơ sở dữ liệu</p>
                </div>

                {/* Alert Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-500">error</span>
                        <div>
                            <p className="font-bold text-red-900">Lỗi</p>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-500 hover:text-red-700"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                        <span className="material-symbols-outlined text-green-500">check_circle</span>
                        <div>
                            <p className="font-bold text-green-900">Thành công</p>
                            <p className="text-green-700 text-sm">{success}</p>
                        </div>
                        <button
                            onClick={() => setSuccess(null)}
                            className="ml-auto text-green-500 hover:text-green-700"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mb-6 flex gap-4">
                    <button
                        onClick={handleCreateBackup}
                        disabled={creating}
                        className="px-6 py-3 bg-[#13ec49] text-white rounded-xl font-bold hover:bg-[#11d441] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">
                            {creating ? 'hourglass_empty' : 'add_circle'}
                        </span>
                        {creating ? 'Đang tạo backup...' : 'Tạo Backup Mới'}
                    </button>

                    <button
                        onClick={loadBackups}
                        disabled={loading}
                        className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:border-[#13ec49] hover:text-[#13ec49] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                        Làm mới
                    </button>
                </div>

                {/* Backup List */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#13ec49]">folder_open</span>
                            Danh sách Backup
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#13ec49]"></div>
                            <p className="mt-4 text-slate-600">Đang tải...</p>
                        </div>
                    ) : backups.length === 0 ? (
                        <div className="p-12 text-center">
                            <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">folder_off</span>
                            <p className="text-slate-500 font-medium">Chưa có file backup nào</p>
                            <p className="text-slate-400 text-sm mt-2">Nhấn "Tạo Backup Mới" để bắt đầu</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                            Tên File
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                            Kích thước
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                            Ngày tạo
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {backups.map((backup) => (
                                        <tr key={backup.filename} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-[#13ec49]">description</span>
                                                    <span className="font-medium text-slate-900">{backup.filename}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {formatFileSize(backup.size)}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {formatDate(backup.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleDownload(backup.filename)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Tải xuống"
                                                    >
                                                        <span className="material-symbols-outlined">download</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleRestore(backup.filename)}
                                                        disabled={restoring === backup.filename}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Khôi phục"
                                                    >
                                                        <span className="material-symbols-outlined">
                                                            {restoring === backup.filename ? 'hourglass_empty' : 'restore'}
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(backup.filename)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Warning Box */}
                <div className="mt-6 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-amber-600 text-2xl">warning</span>
                        <div>
                            <h3 className="font-bold text-amber-900 mb-2">Lưu ý quan trọng</h3>
                            <ul className="text-amber-800 text-sm space-y-1 list-disc list-inside">
                                <li>Backup sẽ sao lưu toàn bộ cơ sở dữ liệu hiện tại</li>
                                <li>Restore sẽ ghi đè hoàn toàn dữ liệu hiện tại bằng dữ liệu từ file backup</li>
                                <li>Nên tạo backup định kỳ để bảo vệ dữ liệu</li>
                                <li>Lưu trữ các file backup quan trọng ở nơi an toàn</li>
                                <li>Kiểm tra kỹ trước khi thực hiện restore</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatabaseBackup;
