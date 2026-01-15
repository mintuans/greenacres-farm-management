import api from '../services/api';

export interface Permission {
    id: string;
    module?: string;
    action?: string;
    code: string;
    description?: string;
    created_at: string;
}

export const getPermissions = async (): Promise<Permission[]> => {
    const response = await api.get('/management/permissions');
    return response.data.data;
};

export const createPermission = async (data: Partial<Permission>): Promise<Permission> => {
    const response = await api.post('/management/permissions', data);
    return response.data.data;
};

export const updatePermission = async (id: string, data: Partial<Permission>): Promise<Permission> => {
    const response = await api.put(`/management/permissions/${id}`, data);
    return response.data.data;
};

export const deletePermission = async (id: string): Promise<void> => {
    await api.delete(`/management/permissions/${id}`);
};

export const getDatabaseTables = async (): Promise<string[]> => {
    const response = await api.get('/management/permissions/tables');
    return response.data.data;
};
