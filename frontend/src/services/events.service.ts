import api from './api';

export interface EventParticipant {
    id: string;
    full_name: string;
    avatar_id?: string;
    default_title?: string;
    role_at_event?: string;
    is_vip: boolean;
}

export interface ShowcaseEvent {
    id: string;
    title: string;
    description?: string;
    banner_id?: string;
    event_date: string;
    location?: string;
    status: string;
    participants: EventParticipant[];
}

/**
 * Láy danh sách sự kiện công khai
 */
export const getPublicEvents = async () => {
    const response = await api.get('/showcase/events');
    return response.data;
};

/**
 * Lấy chi tiết sự kiện
 */
export const getPublicEventById = async (id: string) => {
    const response = await api.get(`/showcase/events/${id}`);
    return response.data;
};
/**
 * Tham gia sự kiện
 */
export const joinEvent = async (id: string) => {
    const response = await api.post(`/showcase/events/${id}/join`);
    return response.data;
};
