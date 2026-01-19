import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { WorkScheduleService } from '../../domain/services/WorkScheduleService';
import { TYPES } from '../../core/types';

@injectable()
export class WorkScheduleController {
    constructor(
        @inject(TYPES.WorkScheduleService) private workScheduleService: WorkScheduleService
    ) { }

    getAll = async (_req: Request, res: Response): Promise<void> => {
        try {
            const schedules = await this.workScheduleService.getAllWorkSchedules();
            res.json({ success: true, data: schedules });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    getOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const schedule = await this.workScheduleService.getWorkSchedule(req.params.id);
            if (!schedule) {
                res.status(404).json({ success: false, message: 'Work schedule not found' });
                return;
            }
            res.json({ success: true, data: schedule });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const schedule = await this.workScheduleService.createWorkSchedule(req.body);
            res.status(201).json({ success: true, data: schedule });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const schedule = await this.workScheduleService.updateWorkSchedule(req.params.id, req.body);
            res.json({ success: true, data: schedule });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.workScheduleService.deleteWorkSchedule(req.params.id);
            res.json({ success: true, message: 'Work schedule deleted successfully' });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };
}
