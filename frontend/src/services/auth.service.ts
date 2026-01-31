import api from './api';

export const showcaseLogin = async (credentials: any) => {
    const response = await api.post('/showcase/auth/login', credentials);
    return response.data;
};

export const showcaseRegister = async (userData: any) => {
    const response = await api.post('/showcase/auth/register', userData);
    return response.data;
};

export const showcaseForgotPassword = async (email: string) => {
    const response = await api.post('/showcase/auth/forgot-password', { email });
    return response.data;
};

export const showcaseResetPassword = async (data: any) => {
    const response = await api.post('/showcase/auth/reset-password', data);
    return response.data;
};
