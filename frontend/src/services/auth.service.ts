import api from './api';

export const showcaseLogin = async (credentials: any) => {
    const response = await api.post('/showcase/auth/login', credentials);
    return response.data;
};

export const showcaseRegister = async (userData: any) => {
    const response = await api.post('/showcase/auth/register', userData);
    return response.data;
};
