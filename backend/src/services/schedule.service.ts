import pool from '../config/database';

export interface DailySchedule {
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
 * Lấy tất cả lịch trình (work schedules + farm events)
 */
export const getAllSchedules = async (): Promise<DailySchedule[]> => {
    const query = `
        SELECT * FROM view_daily_schedules
        ORDER BY event_date DESC, start_time ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

/**
 * Lấy lịch trình theo ngày cụ thể
 */
export const getSchedulesByDate = async (date: string): Promise<DailySchedule[]> => {
    const query = `
        SELECT * FROM view_daily_schedules
        WHERE event_date = $1
        ORDER BY start_time ASC
    `;
    const result = await pool.query(query, [date]);
    return result.rows;
};

/**
 * Lấy lịch trình theo tháng
 */
export const getSchedulesByMonth = async (year: number, month: number): Promise<DailySchedule[]> => {
    const query = `
        SELECT * FROM view_daily_schedules
        WHERE EXTRACT(YEAR FROM event_date) = $1 
        AND EXTRACT(MONTH FROM event_date) = $2
        ORDER BY event_date ASC, start_time ASC
    `;
    const result = await pool.query(query, [year, month]);
    return result.rows;
};

/**
 * Lấy lịch trình theo season
 */
export const getSchedulesBySeason = async (seasonId: string): Promise<DailySchedule[]> => {
    const query = `
        SELECT * FROM view_daily_schedules
        WHERE season_id = $1
        ORDER BY event_date ASC, start_time ASC
    `;
    const result = await pool.query(query, [seasonId]);
    return result.rows;
};
