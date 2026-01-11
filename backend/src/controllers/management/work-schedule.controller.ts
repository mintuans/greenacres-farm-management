import { Request, Response } from 'express';
import * as workScheduleService from '../../services/work-schedule.service';

export const getWorkSchedules = async (_req: Request, res: Response) => {
    try {
        const schedules = await workScheduleService.getWorkSchedules();
        res.json({ success: true, data: schedules });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createWorkSchedule = async (req: Request, res: Response) => {
    try {
        const schedule = await workScheduleService.createWorkSchedule(req.body);
        res.status(201).json({ success: true, data: schedule });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateWorkSchedule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const schedule = await workScheduleService.updateWorkSchedule(id, req.body);
        if (!schedule) {
            res.status(404).json({ success: false, message: 'Not found' });
            return;
        }
        res.json({ success: true, data: schedule });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteWorkSchedule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await workScheduleService.deleteWorkSchedule(id);
        if (!result) {
            res.status(404).json({ success: false, message: 'Not found' });
            return;
        }
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
