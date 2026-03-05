import api from './api';

const API_URL = '/showcase/stats';

/**
 * Lấy số lượt truy cập hiện tại
 */
export const getVisitorCount = async (): Promise<number> => {
    try {
        const response = await api.get(API_URL);
        return response.data?.count || 0;
    } catch (error) {
        console.error('Error fetching visitor count:', error);
        return 0;
    }
};

/**
 * Tăng số lượt truy cập
 */
export const incrementVisitors = async (): Promise<number> => {
    try {
        const response = await api.post(`${API_URL}/increment`);
        return response.data?.count || 0;
    } catch (error) {
        console.error('Error incrementing visitors:', error);
        return 0;
    }
};

/**
 * Lấy số lượt yêu thích
 */
export const getFavoriteCount = async (): Promise<number> => {
    try {
        const response = await api.get(API_URL);
        return response.data?.favorites || 0;
    } catch (error) {
        console.error('Error fetching favorite count:', error);
        return 0;
    }
};

/**
 * Toggle yêu thích (tăng hoặc giảm 1)
 */
export const toggleFavoriteCount = async (action: 'add' | 'remove'): Promise<number> => {
    try {
        const response = await api.post(`${API_URL}/favorites/toggle`, { action });
        return response.data?.favorites || 0;
    } catch (error) {
        console.error('Error toggling favorite:', error);
        return 0;
    }
};
