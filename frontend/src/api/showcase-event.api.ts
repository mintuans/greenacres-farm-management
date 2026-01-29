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
    gallery_ids?: string[];
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
    can_upload_gallery: boolean;
    sort_order: number;
}

export interface EventGreeting {
    id: string;
    event_id: string;
    public_user_id: string;
    full_name?: string;
    email?: string;
    avatar_id?: string;
    greeting_message: string;
    is_sent: boolean;
    created_at: string;
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

export const updateGuest = async (id: string, data: Partial<Guest>): Promise<Guest> => {
    const response = await api.put(`/management/showcase-events/guests/${id}`, data);
    return response.data.data;
};

export const deleteGuest = async (id: string): Promise<void> => {
    await api.delete(`/management/showcase-events/guests/${id}`);
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

export const updateParticipantPermission = async (id: string, canUpload: boolean): Promise<void> => {
    await api.put(`/management/showcase-events/participants/${id}/permission`, { can_upload_gallery: canUpload });
};

// Greetings
export const getEventGreetings = async (eventId: string): Promise<EventGreeting[]> => {
    const response = await api.get(`/management/showcase-events/${eventId}/greetings`);
    return response.data.data;
};

export const saveEventGreeting = async (data: Partial<EventGreeting>): Promise<EventGreeting> => {
    const response = await api.post('/management/showcase-events/greetings', data);
    return response.data.data;
};

export const deleteEventGreeting = async (id: string): Promise<void> => {
    await api.delete(`/management/showcase-events/greetings/${id}`);
};

export const sendGreetingNotification = async (id: string): Promise<void> => {
    await api.post(`/management/showcase-events/greetings/${id}/send-notification`);
};
