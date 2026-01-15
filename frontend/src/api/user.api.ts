import api from '../services/api';

export interface PublicUser {
    id: string;
    email?: string;
    phone?: string;
    full_name?: string;
    avatar_id?: string;
    is_verified: boolean;
    is_active: boolean;
    created_at: string;
    last_login_at?: string;
}

export const getPublicUsers = async (): Promise<PublicUser[]> => {
    const response = await api.get('/management/users');
    return response.data.data;
};

export const createPublicUser = async (data: Partial<PublicUser>): Promise<PublicUser> => {
    const response = await api.post('/management/users', data);
    return response.data.data;
};

export const updatePublicUser = async (id: string, data: Partial<PublicUser>): Promise<PublicUser> => {
    const response = await api.put(`/management/users/${id}`, data);
    return response.data.data;
};

export const deletePublicUser = async (id: string): Promise<void> => {
    await api.delete(`/management/users/${id}`);
};

export const getUserRoles = async (userId: string): Promise<any[]> => {
    const response = await api.get(`/management/users/${userId}/roles`);
    return response.data.data;
};

export const assignRoleToUser = async (userId: string, roleId: string): Promise<void> => {
    await api.post(`/management/users/${userId}/roles`, { roleId });
};

export const removeRoleFromUser = async (userId: string, roleId: string): Promise<void> => {
    await api.delete(`/management/users/${userId}/roles/${roleId}`);
};
