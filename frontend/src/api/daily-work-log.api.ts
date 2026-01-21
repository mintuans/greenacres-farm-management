
import api from '../services/api';


export interface DailyWorkLog {
    id: string;
    partner_id: string;
    partner_name?: string;
    payroll_id?: string;
    payroll_code?: string;
    season_id?: string;
    unit_id?: string;
    schedule_id?: string;
    work_date: string;
    shift_id: string;
    shift_name?: string;
    job_type_id: string;
    job_name?: string;
    quantity: number;
    unit: string;
    applied_rate: number;
    total_amount: number;
    mandays: number;
    status: string;
    note?: string;
    season_name?: string;
    created_at?: string;
}

export const getDailyWorkLogs = async () => {
    const response = await api.get('/management/daily-work-logs');
    return response.data.data;
};

export const createDailyWorkLog = async (data: any) => {
    const response = await api.post('/management/daily-work-logs', data);
    return response.data.data;
};

export const updateDailyWorkLog = async (id: string, data: any) => {
    const response = await api.put(`/management/daily-work-logs/${id}`, data);
    return response.data.data;
};

export const deleteDailyWorkLog = async (id: string) => {
    const response = await api.delete(`/management/daily-work-logs/${id}`);
    return response.data.data;
};

// Gọi store confirm_schedule_to_log
export const confirmScheduleToLog = async (scheduleId: string, mandays: number = 0) => {
    const response = await api.post('/management/daily-work-logs/confirm-schedule', { scheduleId, mandays });
    return response.data.data;
};

// Gọi store calculate_payroll_from_log
export const calculatePayrollFromLog = async (logId: string) => {
    const response = await api.post('/management/daily-work-logs/calculate-payroll', { logId });
    return response.data.data;
};

// Gọi store calculate_payroll_bulk
export const calculatePayrollBulk = async (logIds: string[]) => {
    const response = await api.post('/management/daily-work-logs/calculate-payroll-bulk', { logIds });

    return response.data.data;
};

