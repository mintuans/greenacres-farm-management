import React, { useState, useEffect } from 'react';
import { WorkShift, getWorkShifts, createWorkShift, updateWorkShift, deleteWorkShift, CreateWorkShiftInput } from '../api/work-shift.api';

const WorkShifts: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [shifts, setShifts] = useState<WorkShift[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingShift, setEditingShift] = useState<WorkShift | null>(null);
    const [formData, setFormData] = useState<CreateWorkShiftInput>({
        shift_code: '',
        shift_name: '',
        start_time: '',
        end_time: ''
    });

    useEffect(() => {
        loadShifts();
    }, []);

    const loadShifts = async () => {
        try {
            setLoading(true);
            const data = await getWorkShifts();
            setShifts(data);
        } catch (error) {
            console.error('Error loading work shifts:', error);
            alert('Không thể tải danh sách ca làm việc');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingShift) {
                await updateWorkShift(editingShift.id, formData);
            } else {
                await createWorkShift(formData);
            }
            setShowModal(false);
            resetForm();
            loadShifts();
        } catch (error: any) {
            console.error('Error saving work shift:', error);
            alert(error.response?.data?.message || 'Không thể lưu ca làm việc');
        }
    };

    const handleEdit = (shift: WorkShift) => {
        setEditingShift(shift);
        setFormData({
            shift_code: shift.shift_code,
            shift_name: shift.shift_name,
            start_time: shift.start_time || '',
            end_time: shift.end_time || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa ca làm việc này?')) return;
        try {
            await deleteWorkShift(id);
            loadShifts();
        } catch (error) {
            console.error('Error deleting work shift:', error);
            alert('Không thể xóa ca làm việc');
        }
    };

    const resetForm = () => {
        setFormData({
            shift_code: '',
            shift_name: '',
            start_time: '',
            end_time: ''
        });
        setEditingShift(null);
    };

    const calculateDuration = (start?: string, end?: string): number => {
        if (!start || !end) return 0;
        const startDate = new Date(`2000-01-01 ${start}`);
        const endDate = new Date(`2000-01-01 ${end}`);
        return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    };

    const filteredShifts = (shifts || []).filter(shift =>
        shift.shift_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shift.shift_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Quản lý Ca làm việc
                    </h1>
                    <p className="text-slate-500 mt-2">Danh sách các ca làm việc trong ngày</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#13ec49]/20 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Thêm ca làm việc</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <div className="relative max-w-md">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-lg py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none"
                            placeholder="Tìm kiếm ca làm việc..."
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
                                    <th className="px-6 py-4">Mã ca</th>
                                    <th className="px-6 py-4">Tên ca làm việc</th>
                                    <th className="px-6 py-4">Giờ bắt đầu</th>
                                    <th className="px-6 py-4">Giờ kết thúc</th>
                                    <th className="px-6 py-4">Thời lượng</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filteredShifts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            {searchTerm ? 'Không tìm thấy ca làm việc nào' : 'Chưa có ca làm việc nào'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredShifts.map((shift) => {
                                        const duration = calculateDuration(shift.start_time, shift.end_time);
                                        return (
                                            <tr key={shift.id} className="group hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                                        {shift.shift_code}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-900">{shift.shift_name}</td>
                                                <td className="px-6 py-4 text-slate-600">{shift.start_time || '-'}</td>
                                                <td className="px-6 py-4 text-slate-600">{shift.end_time || '-'}</td>
                                                <td className="px-6 py-4">
                                                    {duration > 0 && (
                                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                                            {duration} giờ
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(shift)}
                                                            className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(shift.id)}
                                                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-slate-900">
                            {editingShift ? 'Sửa ca làm việc' : 'Thêm ca làm việc mới'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mã ca *</label>
                                <input
                                    type="text"
                                    required
                                    disabled={!!editingShift}
                                    value={formData.shift_code}
                                    onChange={(e) => setFormData({ ...formData, shift_code: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 disabled:bg-slate-100 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                    placeholder="VD: SHIFT-SANG"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tên ca *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.shift_name}
                                    onChange={(e) => setFormData({ ...formData, shift_name: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                    placeholder="VD: Ca sáng"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Giờ bắt đầu</label>
                                <input
                                    type="time"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Giờ kết thúc</label>
                                <input
                                    type="time"
                                    value={formData.end_time}
                                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-[#13ec49] text-black font-bold rounded-lg hover:bg-[#13ec49]/90 transition-all active:scale-95"
                                >
                                    {editingShift ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkShifts;
