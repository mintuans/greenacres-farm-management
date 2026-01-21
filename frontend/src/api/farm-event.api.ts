import api from '../services/api';


export interface FarmEvent {
    id: string;
    title: string;
    event_type: 'HARVEST' | 'ISSUE' | 'TASK' | 'OTHER';
    start_time: string;
    end_time?: string;
    is_all_day: boolean;
    description?: string;
    season_id?: string;
    unit_id?: string;
    season_name?: string; // For display
    unit_name?: string;   // For display
}

export const getFarmEvents = async (): Promise<FarmEvent[]> => {
    const response = await api.get('/management/farm-events');
    return response.data.data;
};

export const createFarmEvent = async (data: any): Promise<FarmEvent> => {
    const response = await api.post('/management/farm-events', data);
    return response.data.data;
};

export const updateFarmEvent = async (id: string, data: any): Promise<FarmEvent> => {
    const response = await api.put(`/management/farm-events/${id}`, data);
    return response.data.data;
};

export const deleteFarmEvent = async (id: string): Promise<void> => {
    await api.delete(`/management/farm-events/${id}`);
};
