import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    const response = await axios.get(`${API_URL}/management/users`);
    return response.data.data;
};

export const createPublicUser = async (data: Partial<PublicUser>): Promise<PublicUser> => {
    const response = await axios.post(`${API_URL}/management/users`, data);
    return response.data.data;
};

export const updatePublicUser = async (id: string, data: Partial<PublicUser>): Promise<PublicUser> => {
    const response = await axios.put(`${API_URL}/management/users/${id}`, data);
    return response.data.data;
};

export const deletePublicUser = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/management/users/${id}`);
};
