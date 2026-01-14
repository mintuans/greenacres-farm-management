import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Permission {
    id: string;
    module?: string;
    action?: string;
    code: string;
    description?: string;
    created_at: string;
}

export const getPermissions = async (): Promise<Permission[]> => {
    const response = await axios.get(`${API_URL}/management/permissions`);
    return response.data.data;
};

export const createPermission = async (data: Partial<Permission>): Promise<Permission> => {
    const response = await axios.post(`${API_URL}/management/permissions`, data);
    return response.data.data;
};

export const updatePermission = async (id: string, data: Partial<Permission>): Promise<Permission> => {
    const response = await axios.put(`${API_URL}/management/permissions/${id}`, data);
    return response.data.data;
};

export const deletePermission = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/management/permissions/${id}`);
};
