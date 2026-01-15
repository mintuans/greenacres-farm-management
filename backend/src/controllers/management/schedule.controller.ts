import { Request, Response } from 'express';
import * as scheduleService from '../../services/schedule.service';

/**
 * Lấy tất cả lịch trình
 */
export const getAllSchedules = async (_req: Request, res: Response): Promise<any> => {
    try {
        const schedules = await scheduleService.getAllSchedules();
        return res.json({ success: true, data: schedules });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Lấy lịch trình theo ngày
 */
export const getSchedulesByDate = async (req: Request, res: Response): Promise<any> => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ success: false, message: 'Date parameter is required' });
        }
        const schedules = await scheduleService.getSchedulesByDate(date as string);
        return res.json({ success: true, data: schedules });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Lấy lịch trình theo tháng
 */
export const getSchedulesByMonth = async (req: Request, res: Response): Promise<any> => {
    try {
        const { year, month } = req.query;
        if (!year || !month) {
            return res.status(400).json({ success: false, message: 'Year and month parameters are required' });
        }
        const schedules = await scheduleService.getSchedulesByMonth(
            parseInt(year as string),
            parseInt(month as string)
        );
        return res.json({ success: true, data: schedules });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Lấy lịch trình theo mùa vụ
 */
export const getSchedulesBySeason = async (req: Request, res: Response): Promise<any> => {
    try {
        const { seasonId } = req.params;
        const schedules = await scheduleService.getSchedulesBySeason(seasonId);
        return res.json({ success: true, data: schedules });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
