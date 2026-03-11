import React, { useState, useEffect } from 'react';
import {
    getAllPayrolls,
    updatePayrollStatus,
    deletePayroll,
    getPayrollStats,
    Payroll,
    PayrollStats
} from '../api/payroll.api';
import { getDailyWorkLogs, DailyWorkLog } from '../api/daily-work-log.api';
import logoWeb from '../assets/logo_web.png';
import { useTranslation } from 'react-i18next';

const PayrollManagement: React.FC = () => {
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [stats, setStats] = useState<PayrollStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedPayrollForPreview, setSelectedPayrollForPreview] = useState<any>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [allLogs, setAllLogs] = useState<DailyWorkLog[]>([]);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [payrollsData, statsData, logsData] = await Promise.all([
                getAllPayrolls(),
                getPayrollStats(),
                getDailyWorkLogs()
            ]);
            setPayrolls(payrollsData);
            setStats(statsData);
            setAllLogs(logsData);
        } catch (error) {
            console.error('Error fetching payrolls:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: 'DRAFT' | 'PAID' | 'CANCELLED') => {
        try {
            setProcessingId(id);
            await updatePayrollStatus(id, status);

            if (status === 'PAID') {
                console.log(t('payroll.messages.status_update_success'));
            }

            await fetchData(); // Refresh data
        } catch (error: any) {
            console.error('Error updating status:', error);
            alert(t('payroll.messages.error_prefix') + error.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleViewSlip = (payroll: Payroll) => {
        const payrollLogs = allLogs.filter(l => l.payroll_id === payroll.id);
        setSelectedPayrollForPreview({
            ...payroll,
            logs: payrollLogs
        });
        setShowPreviewModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('payroll.messages.confirm_delete'))) return;

        try {
            await deletePayroll(id);
            await fetchData();
        } catch (error: any) {
            console.error('Error deleting payroll:', error);
            alert(t('payroll.messages.error_prefix') + error.message);
        }
    };

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-orange-100 text-orange-700';
            case 'PAID': return 'bg-green-100 text-green-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'DRAFT': return t('payroll.status.draft');
            case 'PAID': return t('payroll.status.paid');
            case 'CANCELLED': return t('payroll.status.cancelled');
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
                    {t('payroll.title')}
                </h1>
                <p className="text-slate-500 mt-2">
                    {t('payroll.subtitle')}
                </p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">{t('payroll.stats.total')}</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-2">{stats.total_payrolls}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">{t('payroll.stats.pending')}</p>
                        <h3 className="text-3xl font-black text-orange-600 mt-2">
                            {Number(stats.draft_count) + Number(stats.approved_count)}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">{formatVND(stats.pending_amount)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">{t('payroll.stats.paid')}</p>
                        <h3 className="text-3xl font-black text-green-600 mt-2">{stats.paid_count}</h3>
                        <p className="text-xs text-slate-400 mt-1">{formatVND(stats.total_paid_amount)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">{t('payroll.stats.total_spent')}</p>
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
                        <thead className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            <tr>
                                <th className="px-6 py-4">{t('payroll.table.code')}</th>
                                <th className="px-6 py-4">{t('payroll.table.worker')}</th>
                                <th className="px-6 py-4">{t('payroll.table.total')}</th>
                                <th className="px-6 py-4">{t('payroll.table.final')}</th>
                                <th className="px-6 py-4">{t('payroll.table.status')}</th>
                                <th className="px-6 py-4">{t('payroll.table.transaction')}</th>
                                <th className="px-6 py-4 text-right">{t('payroll.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payrolls.map((payroll) => (
                                <tr key={payroll.id} className="group hover:bg-slate-50/80 transition-all">
                                    <td className="px-6 py-4">
                                        <p className="font-mono text-sm font-bold text-slate-900">{payroll.payroll_code}</p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(payroll.created_at).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-900">{payroll.partner_name}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-sm text-slate-600 font-bold">{formatVND(payroll.total_amount)}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="font-black text-emerald-600">{formatVND(payroll.final_amount)}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(payroll.status)}`}>
                                            {getStatusLabel(payroll.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {payroll.transaction_id ? (
                                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-mono border border-green-200">
                                                ✓ {payroll.transaction_id.substring(0, 8)}...
                                            </span>
                                        ) : (
                                            <span className="text-slate-300 text-xs italic">{t('payroll.table.no_transaction')}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleViewSlip(payroll)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                title={t('payroll.actions.view')}
                                            >
                                                <span className="material-symbols-outlined">visibility</span>
                                            </button>

                                            {payroll.status === 'DRAFT' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(payroll.id, 'PAID')}
                                                    disabled={processingId === payroll.id}
                                                    className="px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-black disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                                                >
                                                    {processingId === payroll.id ? '...' : t('payroll.actions.pay')}
                                                </button>
                                            )}

                                            {payroll.status !== 'PAID' && payroll.status !== 'CANCELLED' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(payroll.id, 'CANCELLED')}
                                                    disabled={processingId === payroll.id}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    title={t('payroll.actions.cancel')}
                                                >
                                                    <span className="material-symbols-outlined">block</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-8">
                <div className="flex items-start gap-6">
                    <span className="material-symbols-outlined text-blue-600 text-4xl">lightbulb</span>
                    <div>
                        <h3 className="font-black text-blue-900 text-lg mb-2">{t('payroll.automation.title')}</h3>
                        <p className="text-sm text-blue-700/80 leading-relaxed font-medium">
                            {t('payroll.automation.subtitle')}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="bg-white/50 p-4 rounded-2xl border border-blue-100">
                                <p className="text-xs font-black text-blue-900 uppercase tracking-widest mb-1">{t('payroll.automation.step1_title')}</p>
                                <p className="text-xs text-blue-700 font-bold italic">{t('payroll.automation.step1_desc')}</p>
                            </div>
                            <div className="bg-white/50 p-4 rounded-2xl border border-blue-100">
                                <p className="text-xs font-black text-blue-900 uppercase tracking-widest mb-1">{t('payroll.automation.step2_title')}</p>
                                <p className="text-xs text-blue-700 font-bold italic">{t('payroll.automation.step2_desc')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Preview Phiếu Lương */}
            {showPreviewModal && selectedPayrollForPreview && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <style>
                        {`
                            @media print {
                                body * {
                                    visibility: hidden;
                                }
                                #payroll-slip-print, #payroll-slip-print * {
                                    visibility: visible;
                                }
                                #payroll-slip-print {
                                    visibility: visible !important;
                                    position: fixed;
                                    left: 0;
                                    top: 0;
                                    width: 100vw;
                                    height: 100vh;
                                    margin: 0;
                                    padding: 40px;
                                    border: none !important;
                                    box-shadow: none !important;
                                    z-index: 9999;
                                    background: white;
                                }
                            }
                        `}
                    </style>
                    <div className="bg-white rounded-[40px] max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[95vh] overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-[#13ec49] text-black flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl font-black">receipt_long</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">{t('payroll.slip.title')}</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('payroll.slip.system_name')}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => window.print()}
                                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-900/20"
                                >
                                    <span className="material-symbols-outlined text-sm">print</span>
                                    {t('payroll.slip.print')}
                                </button>
                                <button onClick={() => setShowPreviewModal(false)} className="size-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-slate-100/30">
                            <div id="payroll-slip-print" className="bg-white shadow-sm border border-slate-200 mx-auto w-full p-10 flex flex-col font-serif min-h-[600px]">
                                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 font-sans tracking-tighter italic uppercase flex items-center gap-2">
                                            <img src={logoWeb} alt="Logo" className="size-8 object-contain" />
                                            Vườn Nhà Mình
                                        </h3>
                                        <p className="text-xs font-bold text-slate-500 font-sans mt-1 uppercase tracking-widest text-[8px]">{t('payroll.slip.system_name')}</p>
                                    </div>
                                    <div className="text-right">
                                        <h1 className="text-3xl font-black text-slate-900 font-sans tracking-tight">{t('payroll.slip.header')}</h1>
                                        <p className="text-sm font-bold text-slate-600 font-sans mt-1">{t('payroll.slip.no')} <span className="text-red-600">{selectedPayrollForPreview.payroll_code}</span></p>
                                        <p className="text-[10px] text-slate-400 font-sans">{t('payroll.slip.date')} {new Date(selectedPayrollForPreview.created_at).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-10">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">{t('payroll.slip.receiver')}</p>
                                        <p className="text-xl font-black text-slate-900 font-sans uppercase">{selectedPayrollForPreview.partner_name}</p>
                                        <p className="text-sm text-slate-600 font-sans italic opacity-80 mt-1">{t('partners.types.worker')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">{t('payroll.table.status')}</p>
                                        <p className="text-sm font-bold text-slate-900 font-sans uppercase italic">{getStatusLabel(selectedPayrollForPreview.status)}</p>
                                        <p className="text-[10px] text-slate-400 font-sans mt-1">{t('payroll.slip.payment_date')} {selectedPayrollForPreview.payment_date ? new Date(selectedPayrollForPreview.payment_date).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US') : '---'}</p>
                                    </div>
                                </div>

                                <table className="w-full mb-10 text-sm">
                                    <thead className="border-y border-slate-200 whitespace-nowrap">
                                        <tr className="font-sans uppercase text-[10px] font-black text-slate-400 tracking-wider">
                                            <th className="py-3 text-left">{t('payroll.slip.table.date_job')}</th>
                                            <th className="py-3 text-center">{t('payroll.slip.table.shift')}</th>
                                            <th className="py-3 text-right">{t('payroll.slip.table.rate')}</th>
                                            <th className="py-3 text-right">{t('payroll.slip.table.amount')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-b border-slate-200 divide-y divide-slate-50 italic">
                                        {selectedPayrollForPreview.logs?.map((log: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="py-4">
                                                    <p className="font-bold text-slate-800 tracking-tight">{new Date(log.work_date).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}</p>
                                                    <p className="text-[10px] font-semibold text-slate-500 font-sans not-italic uppercase">{log.job_name}</p>
                                                </td>
                                                <td className="py-4 text-center font-sans text-xs">{log.shift_name} ({log.mandays === 0 ? '1.0' : '0.5'})</td>
                                                <td className="py-4 text-right font-sans text-xs">{formatVND(log.applied_rate)}</td>
                                                <td className="py-4 text-right font-black font-sans text-slate-900">
                                                    {formatVND(log.total_amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="ml-auto w-72 space-y-3 mb-12 bg-slate-50 p-6 rounded-[24px] border border-dashed border-slate-200">
                                    <div className="flex justify-between items-center text-sm font-sans">
                                        <span className="text-slate-500 font-medium">{t('payroll.slip.summary.base')}</span>
                                        <span className="font-bold text-slate-900">{formatVND(selectedPayrollForPreview.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-sans">
                                        <span className="text-slate-500 font-medium font-sans">{t('payroll.slip.summary.bonus')}</span>
                                        <span className="font-bold text-blue-600 font-sans">+{formatVND(selectedPayrollForPreview.bonus || 0)}</span>
                                    </div>
                                    <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                                        <span className="text-xs font-black text-slate-900 font-sans uppercase tracking-[0.1em]">{t('payroll.slip.summary.final')}</span>
                                        <span className="text-2xl font-black text-[#13ec49] font-sans tracking-tight">
                                            {formatVND(selectedPayrollForPreview.final_amount)}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-auto grid grid-cols-2 gap-20 text-center font-sans">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-16">{t('payroll.slip.footer.receiver')}</p>
                                        <p className="font-bold text-slate-900 uppercase">{selectedPayrollForPreview.partner_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-16">{t('payroll.slip.footer.representative')}</p>
                                        <p className="font-bold text-slate-900 uppercase">{t('payroll.slip.footer.management')}</p>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-100 text-[10px] font-medium text-slate-400 font-sans flex justify-between uppercase tracking-widest italic">
                                    <span>{t('payroll.slip.footer.generated_by')}</span>
                                    <span>Ver 1.0.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayrollManagement;
