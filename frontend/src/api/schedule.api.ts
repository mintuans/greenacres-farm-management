import api from '../services/api';

export interface ScheduleEvent {
    event_id: string;
    event_type: 'WORK_SHIFT' | 'FARM_EVENT';
    title: string;
    event_date: string;
    start_time: string;
    end_time: string;
    status: string;
    description: string;
    display_color: string;
    partner_id?: string;
    season_id?: string;
    partner_name?: string;
    job_name?: string;
    shift_name?: string;
}

/**
 * Lấy tất cả lịch trình
 */
export const getAllSchedules = async (): Promise<ScheduleEvent[]> => {
    const response = await api.get('/management/schedules');
    return response.data.data;
};

/**
 * Lấy lịch trình theo ngày
 */
export const getSchedulesByDate = async (date: string): Promise<ScheduleEvent[]> => {
    const response = await api.get('/management/schedules/by-date', {
        params: { date }
    });
    return response.data.data;
};

/**
 * Lấy lịch trình theo tháng
 */
export const getSchedulesByMonth = async (year: number, month: number): Promise<ScheduleEvent[]> => {
    const response = await api.get('/management/schedules/by-month', {
        params: { year, month }
    });
    return response.data.data;
};

/**
 * Lấy lịch trình theo mùa vụ
 */
export const getSchedulesBySeason = async (seasonId: string): Promise<ScheduleEvent[]> => {
    const response = await api.get(`/management/schedules/season/${seasonId}`);
    return response.data.data;
};
