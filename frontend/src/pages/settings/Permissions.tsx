import React, { useState, useEffect } from 'react';
import { Permission, getPermissions, createPermission, updatePermission, deletePermission, getDatabaseTables } from '../../api/permission.api';

const Permissions: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
    const [tables, setTables] = useState<string[]>([]);
    const [formData, setFormData] = useState<Partial<Permission>>({
        module: '',
        action: '',
        code: '',
        description: ''
    });

    useEffect(() => {
        loadPermissions();
        loadTables();
    }, []);

    useEffect(() => {
        if (formData.module && formData.action) {
            const generatedCode = `${formData.module}.${formData.action}`.toLowerCase();
            setFormData(prev => ({ ...prev, code: generatedCode }));
        }
    }, [formData.module, formData.action]);

    const loadPermissions = async () => {
        try {
            setLoading(true);
            const data = await getPermissions();
            setPermissions(data);
        } catch (error) {
            console.error('Error loading permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTables = async () => {
        try {
            const data = await getDatabaseTables();
            setTables(data);
        } catch (error) {
            console.error('Error loading tables:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPermission) {
                await updatePermission(editingPermission.id, formData);
            } else {
                await createPermission(formData);
            }
            setShowModal(false);
            resetForm();
            loadPermissions();
        } catch (error: any) {
            console.error('Error saving permission:', error);
            alert(error.response?.data?.message || 'Không thể lưu quyền');
        }
    };

    const handleEdit = (perm: Permission) => {
        setEditingPermission(perm);
        setFormData({
            module: perm.module,
            action: perm.action,
            code: perm.code,
            description: perm.description
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa quyền này?')) return;
        try {
            await deletePermission(id);
            loadPermissions();
        } catch (error: any) {
            console.error('Error deleting permission:', error);
            alert(error.response?.data?.message || 'Không thể xóa quyền');
        }
    };

    const resetForm = () => {
        setFormData({
            module: '',
            action: '',
            code: '',
            description: ''
        });
        setEditingPermission(null);
    };

    const filteredPermissions = (permissions || []).filter(perm =>
        perm.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (perm.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (perm.module || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Danh sách Quyền
                    </h1>
                    <p className="text-slate-500 mt-2">Các hành động được phép thực hiện trên hệ thống</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#13ec49]/20 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Thêm quyền mới</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <div className="relative max-w-md">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            search
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-lg py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none"
                            placeholder="Tìm kiếm quyền..."
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
                                    <th className="px-6 py-4">Nhóm chức năng</th>
                                    <th className="px-6 py-4">Mã quyền</th>
                                    <th className="px-6 py-4">Mô tả</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filteredPermissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                            {searchTerm ? 'Không tìm thấy quyền nào' : 'Chưa có quyền nào'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPermissions.map((perm) => (
                                        <tr key={perm.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="bg-slate-100 px-2 py-1 rounded text-[11px] font-bold text-slate-600">
                                                    {perm.module}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-blue-600 font-bold">{perm.code}</code>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{perm.description}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(perm)}
                                                        className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(perm.id)}
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
                            {editingPermission ? 'Sửa quyền' : 'Thêm quyền mới'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Module</label>
                                    <select
                                        required
                                        value={formData.module || ''}
                                        onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none bg-white font-medium"
                                    >
                                        <option value="">-- Chọn bảng --</option>
                                        {tables.map(table => (
                                            <option key={table} value={table}>{table}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Action</label>
                                    <select
                                        required
                                        value={formData.action || ''}
                                        onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none bg-white font-medium"
                                    >
                                        <option value="">-- Chọn Action --</option>
                                        <option value="create">Create</option>
                                        <option value="read">Read</option>
                                        <option value="update">Update</option>
                                        <option value="delete">Delete</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mã quyền *</label>
                                <input
                                    type="text"
                                    required
                                    readOnly
                                    value={formData.code || ''}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none bg-slate-50 cursor-not-allowed font-mono text-blue-600"
                                    placeholder="Tự động tạo từ Module & Action"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none h-20"
                                    placeholder="Mô tả quyền"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-[#13ec49] text-black font-bold rounded-lg hover:bg-[#13ec49]/90 transition-all active:scale-95"
                                >
                                    Tạo mới
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Permissions;
