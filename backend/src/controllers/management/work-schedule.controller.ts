import { Request, Response } from 'express';
import * as workScheduleService from '../../services/work-schedule.service';
import { logActivity } from '../../services/audit-log.service';

export const getWorkSchedules = async (_req: Request, res: Response): Promise<any> => {
    try {
        const schedules = await workScheduleService.getWorkSchedules();
        return res.json({ success: true, data: schedules });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createWorkSchedule = async (req: Request, res: Response): Promise<any> => {
    try {
        const schedule = await workScheduleService.createWorkSchedule(req.body);

        await logActivity(req, 'CREATE_WORK_SCHEDULE', 'work_schedules', schedule.id, null, req.body);

        return res.status(201).json({ success: true, data: schedule });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateWorkSchedule = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldSchedule = await workScheduleService.getWorkScheduleById(id);
        const schedule = await workScheduleService.updateWorkSchedule(id, req.body);
        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }

        await logActivity(req, 'UPDATE_WORK_SCHEDULE', 'work_schedules', id, oldSchedule, req.body);

        return res.json({ success: true, data: schedule });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteWorkSchedule = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldSchedule = await workScheduleService.getWorkScheduleById(id);
        const result = await workScheduleService.deleteWorkSchedule(id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }

        await logActivity(req, 'DELETE_WORK_SCHEDULE', 'work_schedules', id, oldSchedule, null);

        return res.json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
