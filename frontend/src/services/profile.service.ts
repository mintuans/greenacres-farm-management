import api from './api';

/**
 * Láy thông tin cá nhân của người dùng hiện tại
 */
export const getMyProfile = async () => {
    const response = await api.get('/showcase/profile/me');
    return response.data;
};

/**
 * Cập nhật thông tin cá nhân (bao gồm avatar)
 */
export const updateMyProfile = async (data: {
    full_name?: string;
    phone?: string;
    avatar_id?: string;
    bio?: string;
    address?: string;
}) => {
    const response = await api.put('/showcase/profile/me', data);
    return response.data;
};
