import api from '../services/api';

export interface Guest {
    id: string;
    full_name: string;
    default_title?: string;
    avatar_id?: string;
    phone?: string;
    email?: string;
}

export interface ShowcaseEvent {
    id: string;
    title: string;
    description?: string;
    banner_id?: string;
    event_date: string;
    location?: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ENDED';
    participants?: ShowcaseEventParticipant[];
}

export interface ShowcaseEventParticipant {
    id: string;
    event_id: string;
    guest_id: string;
    full_name: string;
    avatar_id?: string;
    default_title?: string;
    role_at_event?: string;
    color_theme: string;
    is_vip: boolean;
    sort_order: number;
}

// Events
export const getShowcaseEvents = async (status?: string): Promise<ShowcaseEvent[]> => {
    const response = await api.get('/management/showcase-events', { params: { status } });
    return response.data.data;
};

export const getShowcaseEventById = async (id: string): Promise<ShowcaseEvent> => {
    const response = await api.get(`/management/showcase-events/${id}`);
    return response.data.data;
};

export const createShowcaseEvent = async (data: Partial<ShowcaseEvent>): Promise<ShowcaseEvent> => {
    const response = await api.post('/management/showcase-events', data);
    return response.data.data;
};

export const updateShowcaseEvent = async (id: string, data: Partial<ShowcaseEvent>): Promise<ShowcaseEvent> => {
    const response = await api.put(`/management/showcase-events/${id}`, data);
    return response.data.data;
};

export const deleteShowcaseEvent = async (id: string): Promise<void> => {
    await api.delete(`/management/showcase-events/${id}`);
};

// Guests
export const getAllGuests = async (): Promise<Guest[]> => {
    const response = await api.get('/management/showcase-events/guests/all');
    return response.data.data;
};

export const createGuest = async (data: Partial<Guest>): Promise<Guest> => {
    const response = await api.post('/management/showcase-events/guests', data);
    return response.data.data;
};

// Participants
export const addParticipant = async (data: {
    event_id: string;
    guest_id: string;
    role_at_event?: string;
    color_theme?: string;
    is_vip?: boolean;
    sort_order?: number;
}): Promise<ShowcaseEventParticipant> => {
    const response = await api.post('/management/showcase-events/participants', data);
    return response.data.data;
};

export const removeParticipant = async (id: string): Promise<void> => {
    await api.delete(`/management/showcase-events/participants/${id}`);
};
