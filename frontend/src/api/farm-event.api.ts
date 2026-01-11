import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    const response = await axios.get(`${API_URL}/management/farm-events`);
    return response.data.data;
};

export const createFarmEvent = async (data: any): Promise<FarmEvent> => {
    const response = await axios.post(`${API_URL}/management/farm-events`, data);
    return response.data.data;
};

export const updateFarmEvent = async (id: string, data: any): Promise<FarmEvent> => {
    const response = await axios.put(`${API_URL}/management/farm-events/${id}`, data);
    return response.data.data;
};

export const deleteFarmEvent = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/management/farm-events/${id}`);
};
