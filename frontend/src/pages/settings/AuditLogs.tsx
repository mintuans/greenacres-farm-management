import React, { useState, useEffect } from 'react';
import { AuditLog, getAuditLogs } from '../../api/audit-log.api';

const AuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [showModal, setShowModal] = useState(false);

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
        if (action.includes('ASSIGN') || action.includes('REMOVE')) return 'bg-purple-50 text-purple-700';
        return 'bg-slate-50 text-slate-700';
    };

    const formatData = (data: any) => {
        if (!data) return 'N/A';
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            return JSON.stringify(parsed, null, 2);
        } catch (e) {
            return String(data);
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Nhật ký hệ thống
                    </h1>
                    <p className="text-slate-500 mt-2">Theo dõi các hoạt động của người dùng và hệ thống</p>
                </div>
                <button
                    onClick={loadLogs}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    title="Làm mới"
                >
                    <span className="material-symbols-outlined text-[22px] text-slate-600 block">refresh</span>
                </button>
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
                                    <th className="px-6 py-4 text-right">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            Chưa có dữ nhật ký nào
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="group hover:bg-slate-50 transition-colors">
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
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedLog(log);
                                                        setShowModal(true);
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showModal && selectedLog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-[12px] ${getActionColor(selectedLog.action)}`}>
                                        {selectedLog.action}
                                    </span>
                                    <span>Chi tiết hoạt động</span>
                                </h2>
                                <p className="text-sm text-slate-500 mt-1 uppercase font-bold tracking-widest text-[10px]">
                                    {selectedLog.entity_table} • {selectedLog.entity_id}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors active:scale-95"
                            >
                                <span className="material-symbols-outlined block">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-red-500 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    Dữ liệu cũ (Old Values)
                                </h3>
                                <pre className="bg-slate-900 text-green-400 p-6 rounded-2xl text-xs font-mono overflow-auto max-h-[400px] border-4 border-slate-800 shadow-inner">
                                    {formatData(selectedLog.old_values)}
                                </pre>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-blue-500 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Dữ liệu mới (New Values)
                                </h3>
                                <pre className="bg-slate-900 text-blue-400 p-6 rounded-2xl text-xs font-mono overflow-auto max-h-[400px] border-4 border-slate-800 shadow-inner">
                                    {formatData(selectedLog.new_values)}
                                </pre>
                            </div>

                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Thời gian</label>
                                    <p className="text-sm font-medium text-slate-700">
                                        {new Date(selectedLog.created_at).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">IP Address</label>
                                    <p className="text-sm font-medium text-slate-700">{selectedLog.ip_address || 'Internal'}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl overflow-hidden">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">User Agent</label>
                                    <p className="text-[11px] font-medium text-slate-700 truncate" title={selectedLog.user_agent}>
                                        {selectedLog.user_agent || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
