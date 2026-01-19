import React, { useState, useEffect } from 'react';
import {
    getAllPayrolls,
    updatePayrollStatus,
    deletePayroll,
    getPayrollStats,
    Payroll,
    PayrollStats
} from '../api/payroll.api';

const PayrollManagement: React.FC = () => {
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [stats, setStats] = useState<PayrollStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [payrollsData, statsData] = await Promise.all([
                getAllPayrolls(),
                getPayrollStats()
            ]);
            setPayrolls(payrollsData);
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching payrolls:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: 'DRAFT' | 'APPROVED' | 'PAID' | 'CANCELLED') => {
        try {
            setProcessingId(id);
            await updatePayrollStatus(id, status);

            if (status === 'PAID') {
                alert('✅ Đã chuyển sang trạng thái PAID!\n🎉 Transaction đã được tạo tự động trong hệ thống tài chính.');
            }

            await fetchData(); // Refresh data
        } catch (error: any) {
            console.error('Error updating status:', error);
            alert('Lỗi: ' + error.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa phiếu lương này?')) return;

        try {
            await deletePayroll(id);
            await fetchData();
        } catch (error: any) {
            console.error('Error deleting payroll:', error);
            alert('Lỗi: ' + error.message);
        }
    };

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-100 text-gray-700';
            case 'APPROVED': return 'bg-blue-100 text-blue-700';
            case 'PAID': return 'bg-green-100 text-green-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'Nháp';
            case 'APPROVED': return 'Đã duyệt';
            case 'PAID': return 'Đã trả';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-[#13ec49] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                    Quản lý Phiếu lương
                </h1>
                <p className="text-slate-500 mt-2">
                    Tự động tạo transaction khi chuyển trạng thái sang "Đã trả"
                </p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Tổng phiếu lương</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-2">{stats.total_payrolls}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Chờ xử lý</p>
                        <h3 className="text-3xl font-black text-orange-600 mt-2">
                            {stats.draft_count + stats.approved_count}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">{formatVND(stats.pending_amount)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Đã thanh toán</p>
                        <h3 className="text-3xl font-black text-green-600 mt-2">{stats.paid_count}</h3>
                        <p className="text-xs text-slate-400 mt-1">{formatVND(stats.total_paid_amount)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Tổng đã chi</p>
                        <h3 className="text-2xl font-black text-emerald-600 mt-2">
                            {formatVND(stats.total_paid_amount)}
                        </h3>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Mã phiếu</th>
                                <th className="px-6 py-4">Nhân viên</th>
                                <th className="px-6 py-4">Tổng tiền</th>
                                <th className="px-6 py-4">Thực nhận</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payrolls.map((payroll) => (
                                <tr key={payroll.id} className="group hover:bg-slate-50/80 transition-all">
                                    <td className="px-6 py-4">
                                        <p className="font-mono text-sm font-bold text-slate-900">{payroll.payroll_code}</p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(payroll.created_at).toLocaleDateString('vi-VN')}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-900">{payroll.partner_name}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600">{formatVND(payroll.total_amount)}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-emerald-600">{formatVND(payroll.final_amount)}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${getStatusColor(payroll.status)}`}>
                                            {getStatusLabel(payroll.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {payroll.transaction_id ? (
                                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-mono">
                                                ✓ {payroll.transaction_id.substring(0, 8)}...
                                            </span>
                                        ) : (
                                            <span className="text-slate-300 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {payroll.status === 'DRAFT' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(payroll.id, 'APPROVED')}
                                                    disabled={processingId === payroll.id}
                                                    className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                                >
                                                    Duyệt
                                                </button>
                                            )}
                                            {payroll.status === 'APPROVED' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(payroll.id, 'PAID')}
                                                    disabled={processingId === payroll.id}
                                                    className="px-3 py-1.5 bg-[#13ec49] text-black text-xs font-bold rounded-lg hover:bg-[#10d63f] disabled:opacity-50"
                                                >
                                                    {processingId === payroll.id ? 'Đang xử lý...' : '💰 Trả lương'}
                                                </button>
                                            )}
                                            {payroll.status !== 'PAID' && payroll.status !== 'CANCELLED' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(payroll.id, 'CANCELLED')}
                                                    disabled={processingId === payroll.id}
                                                    className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 disabled:opacity-50"
                                                >
                                                    Hủy
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(payroll.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-blue-600 text-3xl">info</span>
                    <div>
                        <h3 className="font-black text-blue-900 mb-2">💡 Tính năng tự động</h3>
                        <p className="text-sm text-blue-700 leading-relaxed">
                            Khi bạn nhấn nút <strong>"Trả lương"</strong> (chuyển trạng thái sang PAID),
                            hệ thống sẽ <strong>tự động tạo một transaction</strong> (giao dịch chi tiền) trong sổ tài chính.
                            Transaction này sẽ có:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-blue-700">
                            <li>• Type: <strong>EXPENSE</strong> (Chi tiền)</li>
                            <li>• Amount: Số tiền lương thực nhận</li>
                            <li>• Category: "Lương nhân viên"</li>
                            <li>• Note: "Thanh toán lương - Phiếu lương: [Mã]"</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayrollManagement;
