import axios from 'axios';

const API_URL = '/api/showcase/stats';

/**
 * Lấy số lượt truy cập hiện tại
 */
export const getVisitorCount = async (): Promise<number> => {
    try {
        const response = await axios.get(API_URL);
        return response.data.count;
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
        const response = await axios.post(`${API_URL}/increment`);
        return response.data.count;
    } catch (error) {
        console.error('Error incrementing visitors:', error);
        return 0;
    }
};
