import React, { useState, useEffect } from 'react';
import { Partner, getPartners, createPartner, updatePartner, deletePartner, CreatePartnerInput } from '../api/partner-solid.api';

const Workers: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [workers, setWorkers] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWorker, setEditingWorker] = useState<Partner | null>(null);
    const [formData, setFormData] = useState<CreatePartnerInput>({
        partner_code: '',
        partner_name: '',
        type: 'WORKER',
        phone: '',
        address: ''
    });

    useEffect(() => {
        loadWorkers();
    }, []);

    const loadWorkers = async () => {
        try {
            setLoading(true);
            // Chỉ lấy đối tác có type = 'WORKER'
            const data = await getPartners('WORKER');
            setWorkers(data);
        } catch (error) {
            console.error('Error loading workers:', error);
            alert('Không thể tải danh sách nhân viên');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingWorker) {
                await updatePartner(editingWorker.id, formData);
            } else {
                await createPartner({ ...formData, type: 'WORKER' });
            }
            setShowModal(false);
            resetForm();
            loadWorkers();
        } catch (error: any) {
            console.error('Error saving worker:', error);
            alert(error.response?.data?.message || 'Không thể lưu nhân viên');
        }
    };

    const handleEdit = (worker: Partner) => {
        setEditingWorker(worker);
        setFormData({
            partner_code: worker.partner_code,
            partner_name: worker.partner_name,
            type: 'WORKER',
            phone: worker.phone || '',
            address: worker.address || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa nhân viên này?')) return;
        try {
            await deletePartner(id);
            loadWorkers();
        } catch (error) {
            console.error('Error deleting worker:', error);
            alert('Không thể xóa nhân viên');
        }
    };

    const resetForm = () => {
        setFormData({
            partner_code: '',
            partner_name: '',
            type: 'WORKER',
            phone: '',
            address: ''
        });
        setEditingWorker(null);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const filteredWorkers = (workers || []).filter(worker =>
        worker.partner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.partner_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Quản lý Đối tác
                    </h1>
                    <p className="text-slate-500 mt-2">Danh sách nhân viên, nhà cung cấp và người mua</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#13ec49]/20 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Thêm đối tác</span>
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
                            placeholder="Tìm kiếm đối tác..."
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
                                    <th className="px-6 py-4">Mã đối tác</th>
                                    <th className="px-6 py-4">Tên đối tác</th>
                                    <th className="px-6 py-4">Loại</th>
                                    <th className="px-6 py-4">Số điện thoại</th>
                                    <th className="px-6 py-4">Địa chỉ</th>
                                    <th className="px-6 py-4">Số dư</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filteredWorkers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                            {searchTerm ? 'Không tìm thấy đối tác nào' : 'Chưa có đối tác nào'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredWorkers.map((worker) => (
                                        <tr key={worker.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                                    {worker.partner_code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-gradient-to-br from-[#13ec49] to-green-600 flex items-center justify-center text-white font-bold">
                                                        {worker.partner_name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-slate-900">{worker.partner_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${worker.type === 'SUPPLIER' ? 'bg-blue-100 text-blue-800' :
                                                    worker.type === 'BUYER' ? 'bg-green-100 text-green-800' :
                                                        'bg-purple-100 text-purple-800'
                                                    }`}>
                                                    {worker.type === 'SUPPLIER' ? 'Nhà cung cấp' :
                                                        worker.type === 'BUYER' ? 'Người mua' : 'Nhân viên'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{worker.phone || '-'}</td>
                                            <td className="px-6 py-4 text-slate-600">{worker.address || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold ${worker.current_balance > 0
                                                    ? 'text-green-600'
                                                    : worker.current_balance < 0
                                                        ? 'text-red-600'
                                                        : 'text-slate-600'
                                                    }`}>
                                                    {formatCurrency(worker.current_balance)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(worker)}
                                                        className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(worker.id)}
                                                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
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
                            {editingWorker ? 'Sửa đối tác' : 'Thêm đối tác mới'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mã đối tác *</label>
                                <input
                                    type="text"
                                    required
                                    disabled={!!editingWorker}
                                    value={formData.partner_code}
                                    onChange={(e) => setFormData({ ...formData, partner_code: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 disabled:bg-slate-100 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                    placeholder="VD: NV-001"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tên đối tác *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.partner_name}
                                    onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                    placeholder="Nhập tên đối tác"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Loại *</label>
                                <select
                                    required
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                >
                                    <option value="WORKER">Nhân viên</option>
                                    <option value="SUPPLIER">Nhà cung cấp</option>
                                    <option value="BUYER">Người mua</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Điện thoại</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                    placeholder="0901234567"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                    rows={3}
                                    placeholder="Nhập địa chỉ"
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
                                    {editingWorker ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Workers;
