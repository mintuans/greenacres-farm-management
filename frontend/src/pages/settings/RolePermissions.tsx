import React, { useState, useEffect } from 'react';
import { Role, getRoles, getRolePermissions, assignPermissionToRole, removePermissionFromRole } from '../../api/role.api';
import { Permission, getPermissions } from '../../api/permission.api';

const RolePermissions: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedRoleId) {
            loadRolePermissions(selectedRoleId);
        } else {
            setRolePermissions(new Set());
        }
    }, [selectedRoleId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [rolesData, permsData] = await Promise.all([getRoles(), getPermissions()]);
            setRoles(rolesData);
            setPermissions(permsData);
            if (rolesData.length > 0) setSelectedRoleId(rolesData[0].id);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRolePermissions = async (roleId: string) => {
        try {
            const data = await getRolePermissions(roleId);
            setRolePermissions(new Set(data.map(p => p.id)));
        } catch (error) {
            console.error('Error loading role permissions:', error);
        }
    };

    const handleTogglePermission = async (permId: string) => {
        if (!selectedRoleId) return;
        try {
            if (rolePermissions.has(permId)) {
                await removePermissionFromRole(selectedRoleId, permId);
            } else {
                await assignPermissionToRole(selectedRoleId, permId);
            }
            loadRolePermissions(selectedRoleId);
        } catch (error) {
            console.error('Error toggling permission:', error);
        }
    };

    // Group permissions by module
    const groupedPermissions = permissions.reduce((acc, perm) => {
        const module = perm.module || 'Other';
        if (!acc[module]) acc[module] = [];
        acc[module].push(perm);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                    Gán quyền cho Nhóm
                </h1>
                <p className="text-slate-500 mt-2">Thiết lập quyền hạn cho từng vai trò người dùng</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Role List */}
                <div className="w-full lg:w-80 shrink-0">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-bold text-slate-900">Danh sách nhóm</h3>
                        </div>
                        <div className="p-2 space-y-1">
                            {roles.map(role => (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRoleId(role.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selectedRoleId === role.id
                                        ? 'bg-[#13ec49]/10 text-slate-900 font-bold'
                                        : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined text-[18px] ${selectedRoleId === role.id ? 'text-[#13ec49]' : 'text-slate-400'}`}>
                                            admin_panel_settings
                                        </span>
                                        <span>{role.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Permissions Grid */}
                <div className="flex-1">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900">
                                {selectedRoleId ? `Quyền hạn của: ${roles.find(r => r.id === selectedRoleId)?.name}` : 'Chọn một nhóm để gán quyền'}
                            </h3>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#13ec49]"></div>
                            </div>
                        ) : (
                            <div className="p-6 space-y-8">
                                {(Object.entries(groupedPermissions) as [string, Permission[]][]).map(([module, perms]) => (
                                    <div key={module}>
                                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px]">folder</span>
                                            {module}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {perms.map(perm => (
                                                <label
                                                    key={perm.id}
                                                    className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${rolePermissions.has(perm.id)
                                                        ? 'border-[#13ec49] bg-[#13ec49]/5'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <div className="mt-0.5">
                                                        <input
                                                            type="checkbox"
                                                            checked={rolePermissions.has(perm.id)}
                                                            onChange={() => handleTogglePermission(perm.id)}
                                                            className="size-4 rounded accent-[#13ec49]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{perm.code}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{perm.description}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RolePermissions;
