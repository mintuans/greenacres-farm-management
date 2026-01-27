import api from '../services/api';

export interface Notification {
    id: string;
    title: string;
    content: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ALERT';
    category: string;
    link?: string;
    metadata?: any;
    sender_id?: string;
    created_at: string;
    is_read: boolean;
    read_at?: string;
}

export interface SendNotificationInput {
    title: string;
    content: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ALERT';
    category: string;
    link?: string;
    metadata?: any;
    recipient_ids: string[];
}

export const getMyNotifications = async (limit = 20, offset = 0) => {
    const response = await api.get(`/notifications?limit=${limit}&offset=${offset}`);
    return response.data.data;
};

export const markAsRead = async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
};

export const deleteNotification = async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
};

export const sendNotification = async (data: SendNotificationInput) => {
    const response = await api.post('/notifications/send', data);
    return response.data;
};

export const getSentHistory = async (limit = 20, offset = 0) => {
    const response = await api.get(`/notifications/history?limit=${limit}&offset=${offset}`);
    return response.data.data;
};

export const revokeNotification = async (id: string) => {
    const response = await api.delete(`/notifications/revoke/${id}`);
    return response.data;
};
