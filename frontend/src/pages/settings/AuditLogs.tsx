import React, { useState, useEffect } from 'react';
import { AuditLog, getAuditLogs } from '../../api/audit-log.api';

const AuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const data = await getAuditLogs();
            setLogs(data);
        } catch (error) {
            console.error('Error loading audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = (logs || []).filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.entity_table || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getActionColor = (action: string) => {
        if (action.includes('LOGIN')) return 'bg-blue-50 text-blue-700';
        if (action.includes('DELETE')) return 'bg-red-50 text-red-700';
        if (action.includes('CREATE')) return 'bg-green-50 text-green-700';
        if (action.includes('UPDATE')) return 'bg-amber-50 text-amber-700';
        return 'bg-slate-50 text-slate-700';
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                    Nhật ký hệ thống
                </h1>
                <p className="text-slate-500 mt-2">Theo dõi các hoạt động của người dùng và hệ thống</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <div className="relative max-w-md w-full">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            search
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-lg py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none"
                            placeholder="Tìm kiếm nhật ký..."
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#13ec49]"></div>
                        <p className="mt-4 text-slate-600">Đang tải...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Thời gian</th>
                                    <th className="px-6 py-4">Người thực hiện</th>
                                    <th className="px-6 py-4">Hành động</th>
                                    <th className="px-6 py-4">Đối tượng</th>
                                    <th className="px-6 py-4">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            Chưa có dữ nhật ký nào
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-slate-500">
                                                {new Date(log.created_at).toLocaleString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900">
                                                {log.full_name || 'System / Guest'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-400 text-xs">{log.entity_table}</span>
                                                <p className="font-mono text-[10px] text-slate-500 truncate max-w-[150px]">
                                                    {log.entity_id}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                                {log.ip_address || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
