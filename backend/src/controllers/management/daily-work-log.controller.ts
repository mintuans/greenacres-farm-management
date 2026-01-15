
import { Request, Response } from 'express';
import * as dailyWorkLogService from '../../services/daily-work-log.service';
import { logActivity } from '../../services/audit-log.service';

export const getDailyWorkLogs = async (_req: Request, res: Response): Promise<any> => {
    try {
        const logs = await dailyWorkLogService.getDailyWorkLogs();
        return res.json({ success: true, data: logs });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createDailyWorkLog = async (req: Request, res: Response): Promise<any> => {
    try {
        const log = await dailyWorkLogService.createDailyWorkLog(req.body);

        await logActivity(req, 'CREATE_WORK_LOG', 'daily_work_logs', log.id, null, req.body);

        return res.status(201).json({ success: true, data: log });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDailyWorkLog = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldLog = await dailyWorkLogService.getDailyWorkLogById(id);
        const log = await dailyWorkLogService.updateDailyWorkLog(id, req.body);
        if (!log) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }

        await logActivity(req, 'UPDATE_WORK_LOG', 'daily_work_logs', id, oldLog, req.body);

        return res.json({ success: true, data: log });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteDailyWorkLog = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldLog = await dailyWorkLogService.getDailyWorkLogById(id);
        const result = await dailyWorkLogService.deleteDailyWorkLog(id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }

        await logActivity(req, 'DELETE_WORK_LOG', 'daily_work_logs', id, oldLog, null);

        return res.json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const confirmScheduleToLog = async (req: Request, res: Response): Promise<any> => {
    try {
        const { scheduleId, mandays } = req.body;
        const logId = await dailyWorkLogService.confirmScheduleToLog(scheduleId, mandays);

        await logActivity(req, 'CONFIRM_SCHEDULE_TO_LOG', 'daily_work_logs', logId, { scheduleId }, { mandays });

        return res.json({ success: true, data: { logId } });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const calculatePayrollFromLog = async (req: Request, res: Response): Promise<any> => {
    try {
        const { logId } = req.body;
        const payrollId = await dailyWorkLogService.calculatePayrollFromLog(logId);

        await logActivity(req, 'CALCULATE_PAYROLL', 'payrolls', payrollId, { logId }, null);

        return res.json({ success: true, data: { payrollId } });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const calculatePayrollBulk = async (req: Request, res: Response): Promise<any> => {
    try {
        const { logIds } = req.body;
        const payrollId = await dailyWorkLogService.calculatePayrollBulk(logIds);

        await logActivity(req, 'CALCULATE_PAYROLL_BULK', 'payrolls', payrollId, null, { logIds });

        return res.json({ success: true, data: { payrollId } });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
