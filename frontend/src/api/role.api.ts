import axios from 'axios';
import { Permission } from './permission.api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Role {
    id: string;
    name: string;
    description?: string;
    is_system: boolean;
    created_at: string;
}

export const getRoles = async (): Promise<Role[]> => {
    const response = await axios.get(`${API_URL}/management/roles`);
    return response.data.data;
};

export const createRole = async (data: Partial<Role>): Promise<Role> => {
    const response = await axios.post(`${API_URL}/management/roles`, data);
    return response.data.data;
};

export const updateRole = async (id: string, data: Partial<Role>): Promise<Role> => {
    const response = await axios.put(`${API_URL}/management/roles/${id}`, data);
    return response.data.data;
};

export const deleteRole = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/management/roles/${id}`);
};

export const getRolePermissions = async (roleId: string): Promise<Permission[]> => {
    const response = await axios.get(`${API_URL}/management/roles/${roleId}/permissions`);
    return response.data.data;
};

export const assignPermissionToRole = async (roleId: string, permissionId: string): Promise<void> => {
    await axios.post(`${API_URL}/management/roles/${roleId}/permissions`, { permissionId });
};

export const removePermissionFromRole = async (roleId: string, permissionId: string): Promise<void> => {
    await axios.delete(`${API_URL}/management/roles/${roleId}/permissions/${permissionId}`);
};
