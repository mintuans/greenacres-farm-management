
import { Request, Response } from 'express';
import * as dailyWorkLogService from '../../services/daily-work-log.service';

export const getDailyWorkLogs = async (_req: Request, res: Response) => {
    try {
        const logs = await dailyWorkLogService.getDailyWorkLogs();
        res.json({ success: true, data: logs });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createDailyWorkLog = async (req: Request, res: Response) => {
    try {
        const log = await dailyWorkLogService.createDailyWorkLog(req.body);
        res.status(201).json({ success: true, data: log });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDailyWorkLog = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const log = await dailyWorkLogService.updateDailyWorkLog(id, req.body);
        if (!log) {
            res.status(404).json({ success: false, message: 'Not found' });
            return;
        }
        res.json({ success: true, data: log });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteDailyWorkLog = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await dailyWorkLogService.deleteDailyWorkLog(id);
        if (!result) {
            res.status(404).json({ success: false, message: 'Not found' });
            return;
        }
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const confirmScheduleToLog = async (req: Request, res: Response) => {
    try {
        const { scheduleId, mandays } = req.body;
        const logId = await dailyWorkLogService.confirmScheduleToLog(scheduleId, mandays);
        res.json({ success: true, data: { logId } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const calculatePayrollFromLog = async (req: Request, res: Response) => {
    try {
        const { logId } = req.body;
        const payrollId = await dailyWorkLogService.calculatePayrollFromLog(logId);
        res.json({ success: true, data: { payrollId } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const calculatePayrollBulk = async (req: Request, res: Response) => {
    try {
        const { logIds } = req.body;
        const payrollId = await dailyWorkLogService.calculatePayrollBulk(logIds);
        res.json({ success: true, data: { payrollId } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
