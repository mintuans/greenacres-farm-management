import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm token và prefix /api vào mỗi request
api.interceptors.request.use(
    (config) => {
        // Tự động thêm /api nếu chưa có và baseURL chưa có /api
        const baseURL = config.baseURL || '';
        const hasApiInBase = baseURL.endsWith('/api') || baseURL.endsWith('/api/');

        if (config.url && !config.url.startsWith('http') && !config.url.startsWith('/api') && !hasApiInBase) {
            const separator = config.url.startsWith('/') ? '' : '/';
            config.url = `/api${separator}${config.url}`;
        }

        const token = localStorage.getItem('farm_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
