import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface WorkShift {
    id: string;
    shift_code: string;
    shift_name: string;
    start_time?: string;
    end_time?: string;
}

export interface CreateWorkShiftInput {
    shift_code: string;
    shift_name: string;
    start_time?: string;
    end_time?: string;
}

export interface UpdateWorkShiftInput {
    shift_name?: string;
    start_time?: string;
    end_time?: string;
}

export const getWorkShifts = async (): Promise<WorkShift[]> => {
    const response = await axios.get(`${API_URL}/management/work-shifts`);
    return response.data.data;
};

export const getWorkShiftById = async (id: string): Promise<WorkShift> => {
    const response = await axios.get(`${API_URL}/management/work-shifts/${id}`);
    return response.data.data;
};

export const createWorkShift = async (data: CreateWorkShiftInput): Promise<WorkShift> => {
    const response = await axios.post(`${API_URL}/management/work-shifts`, data);
    return response.data.data;
};

export const updateWorkShift = async (id: string, data: UpdateWorkShiftInput): Promise<WorkShift> => {
    const response = await axios.put(`${API_URL}/management/work-shifts/${id}`, data);
    return response.data.data;
};

export const deleteWorkShift = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/management/work-shifts/${id}`);
};
