import api from '../services/api';


export interface WorkSchedule {
    id: string;
    partner_id: string;
    shift_id: string;
    job_type_id: string;
    work_date: string;
    status: 'PLANNED' | 'CONFIRMED' | 'CANCELLED';
    note?: string;
    partner_name?: string;  // For display
    shift_name?: string;    // For display
    job_name?: string;      // For display
    season_id?: string;
    season_name?: string;   // For display
    has_payroll?: boolean;
}

export const getWorkSchedules = async (): Promise<WorkSchedule[]> => {
    const response = await api.get('/management/work-schedules');
    return response.data.data;
};

export const createWorkSchedule = async (data: any): Promise<WorkSchedule> => {
    const response = await api.post('/management/work-schedules', data);
    return response.data.data;
};

export const updateWorkSchedule = async (id: string, data: any): Promise<WorkSchedule> => {
    const response = await api.put(`/management/work-schedules/${id}`, data);
    return response.data.data;
};

export const deleteWorkSchedule = async (id: string): Promise<void> => {
    await api.delete(`/management/work-schedules/${id}`);
};
