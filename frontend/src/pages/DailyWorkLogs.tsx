
import React, { useState, useEffect, useRef } from 'react';
import { getDailyWorkLogs, calculatePayrollFromLog, calculatePayrollBulk, DailyWorkLog, deleteDailyWorkLog, confirmScheduleToLog } from '../api/daily-work-log.api';
import { getWorkSchedules, WorkSchedule } from '../api/work-schedule.api';


const DailyWorkLogs: React.FC = () => {
    const [logs, setLogs] = useState<DailyWorkLog[]>([]);
    const [pendingSchedules, setPendingSchedules] = useState<WorkSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<WorkSchedule | null>(null);
    const [selectedLogForPreview, setSelectedLogForPreview] = useState<DailyWorkLog | any>(null);
    const [mandaysValue, setMandaysValue] = useState(0);
    const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [logsData, schedulesData] = await Promise.all([
                getDailyWorkLogs(),
                getWorkSchedules()
            ]);
            setLogs(logsData || []);
            // Chỉ lấy những lịch chưa chốt (PLANNED) để hiển thị trong mục chốt công
            setPendingSchedules((schedulesData || []).filter((s: WorkSchedule) => s.status === 'PLANNED'));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCalculatePayroll = async (logId?: string) => {
        const idsToCalculate = logId ? [logId] : selectedLogIds;
        if (idsToCalculate.length === 0) return;

        try {
            if (confirm(`Bạn muốn tính lương cho ${idsToCalculate.length} ngày công đã chọn?`)) {
                let result;
                if (idsToCalculate.length === 1) {
                    result = await calculatePayrollFromLog(idsToCalculate[0]);
                } else {
                    result = await calculatePayrollBulk(idsToCalculate);
                }

                // Lấy danh sách các logs vừa tính để hiện preview
                const selectedLogs = logs.filter(l => idsToCalculate.includes(l.id));
                if (selectedLogs.length > 0) {
                    setSelectedLogForPreview({
                        isBulk: idsToCalculate.length > 1,
                        logs: selectedLogs,
                        payroll_code: result.payrollId ? 'PL-NEW' : 'N/A', // Temporary, will fetch real code
                        partner_name: selectedLogs[0].partner_name,
                        total_amount: selectedLogs.reduce((sum, l) => sum + Number(l.total_amount), 0)
                    });
                    setShowPreviewModal(true);
                }
                setSelectedLogIds([]);
                fetchData();
            }
        } catch (error: any) {
            console.error('Error calculating payroll:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi tính lương.');
        }
    };

    const toggleSelectLog = (id: string) => {
        setSelectedLogIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const payableLogs = filteredLogs.filter(l => !l.payroll_id && l.status === 'DONE');
        if (selectedLogIds.length === payableLogs.length) {
            setSelectedLogIds([]);
        } else {
            setSelectedLogIds(payableLogs.map(l => l.id));
        }
    };

    const handleConfirmSchedule = async () => {
        if (!selectedSchedule) return;
        try {
            await confirmScheduleToLog(selectedSchedule.id, mandaysValue);
            setShowConfirmModal(false);
            setSelectedSchedule(null);
            fetchData();
        } catch (error) {
            console.error('Error confirming schedule:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bạn có chắc muốn xóa nhật ký này?')) {
            await deleteDailyWorkLog(id);
            fetchData();
        }
    };

    const filteredLogs = logs.filter(l =>
        !l.payroll_id && (
            (l.partner_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.job_name || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto bg-slate-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Nhật ký Làm việc</h1>
                    <p className="text-slate-500 mt-2 font-medium">Theo dõi và xác nhận công việc thực tế của nhân viên.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchData}
                        className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                    </button>
                </div>
            </div>

            {/* Quick Actions / Pending Schedules */}
            {pendingSchedules.length > 0 && (
                <div className="bg-[#13ec49]/5 border border-[#13ec49]/20 rounded-[32px] p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-[#13ec49]">pending_actions</span>
                        <h2 className="font-black text-slate-900 uppercase tracking-widest text-xs">Cần xác nhận chốt công ({pendingSchedules.length})</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {pendingSchedules.slice(0, 5).map(s => (
                            <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="size-10 rounded-xl bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center font-black">
                                    {s.partner_name?.charAt(0)}
                                </div>
                                <div className="min-w-[120px]">
                                    <p className="text-sm font-black text-slate-900">{s.partner_name}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">{s.job_name}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedSchedule(s);
                                        setMandaysValue(0);
                                        setShowConfirmModal(true);
                                    }}
                                    className="px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-black transition-all"
                                >
                                    Chốt công
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Tìm nhân viên, công việc..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-medium transition-all"
                        />
                    </div>
                    {selectedLogIds.length > 0 && (
                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
                            <span className="text-sm font-bold text-[#13ec49]">Đã chọn {selectedLogIds.length} ngày công</span>
                            <button
                                onClick={() => handleCalculatePayroll()}
                                className="px-6 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20"
                            >
                                <span className="material-symbols-outlined text-sm">payments</span>
                                Tính lương gộp
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#13ec49] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-8 py-5 w-10">
                                        <input
                                            type="checkbox"
                                            className="size-5 rounded-lg border-slate-200 accent-[#13ec49] cursor-pointer"
                                            checked={selectedLogIds.length > 0 && selectedLogIds.length === filteredLogs.filter(l => !l.payroll_id && l.status === 'DONE').length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-8 py-5">Nhân sự & Công việc</th>
                                    <th className="px-8 py-5">Ngày & Ca</th>
                                    <th className="px-8 py-5 text-center">Trạng thái</th>
                                    <th className="px-8 py-5 text-right">Thành tiền</th>
                                    <th className="px-8 py-5 text-center">Lương</th>
                                    <th className="px-8 py-5 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <span className="material-symbols-outlined text-slate-200 text-6xl block mb-4">analytics</span>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chưa có nhật ký làm việc</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((item) => (
                                        <tr key={item.id} className={`group hover:bg-slate-50/80 transition-all ${selectedLogIds.includes(item.id) ? 'bg-[#13ec49]/5' : ''}`}>
                                            <td className="px-8 py-5">
                                                {!item.payroll_id && item.status === 'DONE' ? (
                                                    <input
                                                        type="checkbox"
                                                        className="size-5 rounded-lg border-slate-200 accent-[#13ec49] cursor-pointer"
                                                        checked={selectedLogIds.includes(item.id)}
                                                        onChange={() => toggleSelectLog(item.id)}
                                                    />
                                                ) : item.payroll_id ? (
                                                    <span className="material-symbols-outlined text-slate-400 text-sm" title="Đã có phiếu lương">verified</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-slate-200 text-sm" title="Chưa hoàn thành">pending</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-slate-900/10">
                                                        {(item.partner_name || 'N').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-slate-900">{item.partner_name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">{item.job_name || 'Khác'}</p>
                                                            {item.season_name && (
                                                                <>
                                                                    <span className="text-slate-300">•</span>
                                                                    <span className="text-[10px] font-black text-[#13ec49] uppercase tracking-widest">{item.season_name}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="font-black text-slate-900">{new Date(item.work_date).toLocaleDateString('vi-VN')}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.shift_name}</p>
                                                    <span className={`text-[9px] font-black uppercase px-1.5 rounded-md ${item.mandays === 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {item.mandays === 0 ? '1.0' : '0.5'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${item.status === 'DONE' ? 'bg-[#13ec49]/10 text-green-600' :
                                                    item.status === 'INPROGRESS' ? 'bg-blue-50 text-blue-600' :
                                                        item.status === 'CANCELLED' ? 'bg-red-50 text-red-600' :
                                                            item.status === 'REJECTED' ? 'bg-orange-50 text-orange-600' :
                                                                'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {item.status === 'DONE' ? 'Hoàn thành' :
                                                        item.status === 'INPROGRESS' ? 'Đang chờ' :
                                                            item.status === 'CANCELLED' ? 'Đã hủy' :
                                                                item.status === 'REJECTED' ? 'Từ chối' :
                                                                    item.status || 'Khác'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <p className="text-lg font-black text-slate-900">
                                                    {new Intl.NumberFormat('vi-VN').format(item.total_amount)}đ
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 italic">@{new Intl.NumberFormat('vi-VN').format(item.applied_rate)}đ</p>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                {item.payroll_id ? (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedLogForPreview(item);
                                                            setShowPreviewModal(true);
                                                        }}
                                                        className="mx-auto flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-xl w-fit hover:border-green-300 border border-transparent transition-all shadow-sm"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">verified</span>
                                                        <span className="text-[10px] font-black uppercase italic">{item.payroll_code || 'XEM PHIẾU'}</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase italic">Chưa tính lương</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        if (item.payroll_id) {
                                                            setSelectedLogForPreview(item);
                                                            setShowPreviewModal(true);
                                                        } else {
                                                            alert('Bạn chưa tính lương cho ngày này.');
                                                        }
                                                    }}
                                                    className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="Chi tiết lương"
                                                >
                                                    <span className="material-symbols-outlined">info</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    title="Xóa nhật ký"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
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

            {/* Modal Xác nhận chốt công */}
            {showConfirmModal && selectedSchedule && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-[#13ec49]"></div>

                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900">Xác nhận Chốt công</h2>
                                <p className="text-slate-500 font-medium mt-1">Hoàn tất ngày làm việc cho nhân viên.</p>
                            </div>
                            <button onClick={() => setShowConfirmModal(false)} className="size-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                <span className="material-symbols-outlined text-[28px]">close</span>
                            </button>
                        </div>

                        <div className="bg-slate-50 rounded-3xl p-6 mb-8 flex items-center gap-6 border border-slate-100">
                            <div className="size-16 rounded-[24px] bg-slate-900 text-white flex items-center justify-center text-2xl font-black shadow-xl">
                                {selectedSchedule.partner_name?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{selectedSchedule.partner_name}</h3>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{selectedSchedule.job_name} • {selectedSchedule.shift_name}</p>
                                <p className="text-slate-400 font-bold text-xs mt-1">{new Date(selectedSchedule.work_date).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Hình thức làm việc</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setMandaysValue(0)}
                                        className={`flex flex-col items-start gap-3 p-5 rounded-[24px] border-2 transition-all ${mandaysValue === 0 ? 'border-[#13ec49] bg-[#13ec49]/5' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                    >
                                        <div className={`size-8 rounded-full flex items-center justify-center shadow-sm ${mandaysValue === 0 ? 'bg-[#13ec49] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            <span className="material-symbols-outlined text-[20px]">sunny</span>
                                        </div>
                                        <div>
                                            <p className={`font-black tracking-tight ${mandaysValue === 0 ? 'text-slate-900' : 'text-slate-400'}`}>Cả ngày</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Hệ số 1.0</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setMandaysValue(1)}
                                        className={`flex flex-col items-start gap-3 p-5 rounded-[24px] border-2 transition-all ${mandaysValue === 1 ? 'border-orange-500 bg-orange-50/30' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                    >
                                        <div className={`size-8 rounded-full flex items-center justify-center shadow-sm ${mandaysValue === 1 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            <span className="material-symbols-outlined text-[20px]">partly_cloudy_day</span>
                                        </div>
                                        <div>
                                            <p className={`font-black tracking-tight ${mandaysValue === 1 ? 'text-slate-900' : 'text-slate-400'}`}>Nửa buổi</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Hệ số 0.5</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 py-5 font-black text-slate-500 hover:bg-slate-50 rounded-[24px] transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleConfirmSchedule}
                                    className="flex-[1.5] py-5 bg-[#13ec49] text-black font-black rounded-[24px] hover:bg-[#10d63f] active:scale-95 transition-all shadow-xl shadow-[#13ec49]/20"
                                >
                                    Xác nhận Chốt công
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Xem trước Phiếu lương (Report Template) */}
            {showPreviewModal && selectedLogForPreview && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <style>
                        {`
                            @media print {
                                body * {
                                    visibility: hidden;
                                }
                                #payroll-slip, #payroll-slip * {
                                    visibility: visible;
                                }
                                #payroll-slip {
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
                                .no-print {
                                    display: none !important;
                                }
                            }
                        `}
                    </style>
                    <div className="bg-white rounded-[32px] max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                        {/* Header của Modal */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[32px]">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                                    <span className="material-symbols-outlined">description</span>
                                </div>
                                <div>
                                    <h2 className="font-black text-slate-900">Xem trước Phiếu lương</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Hệ thống quản lý GreenAcres</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-black transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm">print</span>
                                    Xuất PDF / In
                                </button>
                                <button onClick={() => setShowPreviewModal(false)} className="size-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 transition-all">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Nội dung Phiếu lương (Template) */}
                        <div className="flex-1 overflow-y-auto p-12 bg-slate-100/30">
                            <div id="payroll-slip" className="bg-white shadow-sm border border-slate-200 mx-auto w-full min-h-[600px] p-10 flex flex-col font-serif">
                                {/* Header Template */}
                                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 font-sans tracking-tighter italic uppercase flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#13ec49]">agriculture</span>
                                            GreenAcres
                                        </h3>
                                        <p className="text-xs font-bold text-slate-500 font-sans mt-1">QUẢN LÝ NÔNG TRẠI THÔNG MINH</p>
                                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">Địa chỉ: Tân Lộc, Thới Thuận, Thốt Nốt, Cần Thơ</p>
                                    </div>
                                    <div className="text-right">
                                        <h1 className="text-3xl font-black text-slate-900 font-sans tracking-tight">PHIẾU LƯƠNG</h1>
                                        <p className="text-sm font-bold text-slate-600 font-sans mt-1">Số: <span className="text-red-600">{selectedLogForPreview.payroll_code || '---'}</span></p>
                                        <p className="text-[10px] text-slate-400 font-sans">Ngày lập: {new Date().toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>

                                {/* Thông tin nhân viên */}
                                <div className="grid grid-cols-2 gap-8 mb-10">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">Người nhận lương</p>
                                        <p className="text-lg font-black text-slate-900 font-sans">{selectedLogForPreview.partner_name}</p>
                                        <p className="text-sm text-slate-600 font-sans italic opacity-80 mt-1">Nhân sự Nông vụ</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">Thời gian làm việc</p>
                                        <p className="text-sm font-bold text-slate-900 font-sans italic">{new Date(selectedLogForPreview.work_date).toLocaleDateString('vi-VN')}</p>
                                        <p className="text-xs text-slate-500 font-sans mt-1 uppercase font-black">{selectedLogForPreview.shift_name}</p>
                                    </div>
                                </div>

                                {/* Bảng chi tiết */}
                                <table className="w-full mb-10 text-sm">
                                    <thead className="border-y border-slate-200">
                                        <tr className="font-sans uppercase text-[10px] font-black text-slate-400 tracking-wider">
                                            <th className="py-3 text-left">Ngày làm / Nội dung</th>
                                            <th className="py-3 text-center">Ca</th>
                                            <th className="py-3 text-center">Ngày công</th>
                                            <th className="py-3 text-right">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-b border-slate-200 divide-y divide-slate-50 italic">
                                        {(selectedLogForPreview.logs || [selectedLogForPreview]).map((log: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="py-4">
                                                    <p className="font-bold text-slate-800">{new Date(log.work_date).toLocaleDateString('vi-VN')}</p>
                                                    <p className="text-[10px] font-semibold text-slate-500 font-sans not-italic uppercase">{log.job_name}</p>
                                                </td>
                                                <td className="py-4 text-center font-sans text-xs">{log.shift_name}</td>
                                                <td className="py-4 text-center font-sans text-xs">{log.mandays === 0 ? '1.0' : '0.5'}</td>
                                                <td className="py-4 text-right font-black font-sans text-slate-900">
                                                    {new Intl.NumberFormat('vi-VN').format(log.total_amount)}đ
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Tổng cộng */}
                                <div className="ml-auto w-64 space-y-3 mb-12 bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                                    <div className="flex justify-between items-center text-sm font-sans">
                                        <span className="text-slate-500 font-medium tracking-tight">Số ngày công:</span>
                                        <span className="font-bold text-slate-900">{(selectedLogForPreview.logs || [selectedLogForPreview]).length} ngày</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-sans">
                                        <span className="text-slate-500 font-medium tracking-tight">Tổng cộng:</span>
                                        <span className="font-bold text-slate-900">{new Intl.NumberFormat('vi-VN').format(selectedLogForPreview.total_amount)}đ</span>
                                    </div>
                                    <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                                        <span className="text-xs font-black text-slate-900 font-sans uppercase tracking-[0.1em]">Thực nhận</span>
                                        <span className="text-xl font-black text-[#13ec49] font-sans tracking-tight">
                                            {new Intl.NumberFormat('vi-VN').format(selectedLogForPreview.total_amount)}đ
                                        </span>
                                    </div>
                                </div>

                                {/* Chữ ký */}
                                <div className="mt-auto grid grid-cols-2 gap-20 text-center font-sans">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-16">Người nhận lương</p>
                                        <p className="font-bold text-slate-900">{selectedLogForPreview.partner_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-16">Người xác nhận</p>
                                        <p className="font-bold text-slate-900">Lê Minh Tuấn</p>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-100 text-[10px] font-medium text-slate-400 font-sans flex justify-between uppercase tracking-widest italic">
                                    <span>Voucher generated by GreenAcres System</span>
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


export default DailyWorkLogs;
