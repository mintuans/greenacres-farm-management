import api from '../services/api';
import { Permission } from './permission.api';

export interface Role {
    id: string;
    name: string;
    description?: string;
    is_system: boolean;
    created_at: string;
}

export const getRoles = async (): Promise<Role[]> => {
    const response = await api.get('/management/roles');
    return response.data.data;
};

export const createRole = async (data: Partial<Role>): Promise<Role> => {
    const response = await api.post('/management/roles', data);
    return response.data.data;
};

export const updateRole = async (id: string, data: Partial<Role>): Promise<Role> => {
    const response = await api.put(`/management/roles/${id}`, data);
    return response.data.data;
};

export const deleteRole = async (id: string): Promise<void> => {
    await api.delete(`/management/roles/${id}`);
};

export const getRolePermissions = async (roleId: string): Promise<Permission[]> => {
    const response = await api.get(`/management/roles/${roleId}/permissions`);
    return response.data.data;
};

export const assignPermissionToRole = async (roleId: string, permissionId: string): Promise<void> => {
    await api.post(`/management/roles/${roleId}/permissions`, { permissionId });
};

export const removePermissionFromRole = async (roleId: string, permissionId: string): Promise<void> => {
    await api.delete(`/management/roles/${roleId}/permissions/${permissionId}`);
};
