import React, { useState, useEffect } from 'react';
import { PublicUser, getPublicUsers, createPublicUser, updatePublicUser, deletePublicUser, getUserRoles, assignRoleToUser, removeRoleFromUser } from '../../api/user.api';
import { Role, getRoles } from '../../api/role.api';

const Users: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<PublicUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<PublicUser | null>(null);
    const [formData, setFormData] = useState<Partial<PublicUser & { password?: string }>>({
        email: '',
        full_name: '',
        password: '',
        is_active: true
    });

    // Role Assignment State
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null);
    const [userRoles, setUserRoles] = useState<Role[]>([]);
    const [allRoles, setAllRoles] = useState<Role[]>([]);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getPublicUsers();
            setUsers(data);

            // Pre-load all roles for later use
            const rolesData = await getRoles();
            setAllRoles(rolesData);
        } catch (error) {
            console.error('Error loading users/roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleManageRoles = async (user: PublicUser) => {
        setSelectedUser(user);
        try {
            const currentRoles = await getUserRoles(user.id);
            setUserRoles(currentRoles);
            setShowRoleModal(true);
        } catch (error) {
            console.error('Error loading user roles:', error);
            alert('Không thể tải danh sách vai trò của người dùng');
        }
    };

    const toggleRole = async (role: Role) => {
        if (!selectedUser) return;

        const isAssigned = userRoles.some(r => r.id === role.id);
        try {
            if (isAssigned) {
                await removeRoleFromUser(selectedUser.id, role.id);
                setUserRoles(userRoles.filter(r => r.id !== role.id));
            } else {
                await assignRoleToUser(selectedUser.id, role.id);
                setUserRoles([...userRoles, role]);
            }
        } catch (error) {
            console.error('Error toggling role:', error);
            alert('Không thể cập nhật vai trò');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await updatePublicUser(editingUser.id, formData);
            } else {
                await createPublicUser(formData);
            }
            setShowModal(false);
            resetForm();
            loadUsers();
        } catch (error: any) {
            console.error('Error saving user:', error);
            alert(error.response?.data?.message || 'Không thể lưu người dùng');
        }
    };

    const handleEdit = (user: PublicUser) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            full_name: user.full_name,
            is_active: user.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
        try {
            await deletePublicUser(id);
            loadUsers();
        } catch (error: any) {
            console.error('Error deleting user:', error);
            alert(error.response?.data?.message || 'Không thể xóa người dùng');
        }
    };

    const resetForm = () => {
        setFormData({
            email: '',
            full_name: '',
            password: '',
            is_active: true
        });
        setEditingUser(null);
    };

    const filteredUsers = (users || []).filter(user =>
        (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Quản lý Tài khoản
                    </h1>
                    <p className="text-slate-500 mt-2">Danh sách người dùng đăng nhập vào hệ thống</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#13ec49]/20 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Thêm tài khoản</span>
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
                            placeholder="Tìm kiếm người dùng..."
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
                                    <th className="px-6 py-4">Họ và tên</th>
                                    <th className="px-6 py-4">Email / SĐT</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4">Ngày tạo</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            {searchTerm ? 'Không tìm thấy người dùng nào' : 'Chưa có người dùng nào'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900">{user.full_name}</td>
                                            <td className="px-6 py-4 text-slate-600">{user.email || user.phone}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${user.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    {user.is_active ? 'Hoạt động' : 'Khóa'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleManageRoles(user)}
                                                        className="p-2 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600 transition-all"
                                                        title="Phân vai trò"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">shield_person</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                                                        title="Sửa"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                                                        title="Xóa"
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
                            {editingUser ? 'Sửa tài khoản' : 'Thêm tài khoản mới'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email / Phone *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.email || ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                    placeholder="Nhập email hoặc số điện thoại"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name || ''}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                    placeholder="Nhập họ và tên"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Mật khẩu {editingUser ? '(Để trống nếu không đổi)' : '*'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={formData.password || ''}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                    placeholder="Nhập mật khẩu"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="accent-[#13ec49]"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Kích hoạt tài khoản</label>
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
                                    {editingUser ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Role Assignment Modal */}
            {showRoleModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Phân vai trò
                                </h2>
                                <p className="text-slate-500 text-sm mt-1">
                                    Người dùng: <span className="font-bold text-slate-700">{selectedUser.full_name}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setShowRoleModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-slate-400">close</span>
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {allRoles.length === 0 ? (
                                <p className="text-center py-4 text-slate-500 italic">Chưa có vai trò nào trong hệ thống</p>
                            ) : (
                                allRoles.map(role => {
                                    const isAssigned = userRoles.some(r => r.id === role.id);
                                    return (
                                        <div
                                            key={role.id}
                                            onClick={() => toggleRole(role)}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${isAssigned
                                                    ? 'border-[#13ec49] bg-green-50'
                                                    : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className={`font-bold ${isAssigned ? 'text-green-800' : 'text-slate-700'}`}>
                                                    {role.name}
                                                </span>
                                                <span className="text-xs text-slate-500 lowercase">{role.description}</span>
                                            </div>
                                            <div className={`size-6 rounded-full flex items-center justify-center ${isAssigned ? 'bg-[#13ec49] text-black' : 'bg-slate-200 text-slate-400'
                                                }`}>
                                                <span className="material-symbols-outlined text-[16px] font-bold">
                                                    {isAssigned ? 'check' : 'add'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => setShowRoleModal(false)}
                                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95"
                            >
                                Xong
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
