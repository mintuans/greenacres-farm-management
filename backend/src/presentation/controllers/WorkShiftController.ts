import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { WorkShiftService } from '../../domain/services/WorkShiftService';
import { TYPES } from '../../core/types';

@injectable()
export class WorkShiftController {
    constructor(
        @inject(TYPES.WorkShiftService) private workShiftService: WorkShiftService
    ) {}

    getAll = async (_req: Request, res: Response): Promise<void> => {
        try {
            const shifts = await this.workShiftService.getAllWorkShifts();
            res.json({ success: true, data: shifts });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    getOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const shift = await this.workShiftService.getWorkShift(req.params.id);
            if (!shift) {
                res.status(404).json({ success: false, message: 'Work shift not found' });
                return;
            }
            res.json({ success: true, data: shift });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const shift = await this.workShiftService.createWorkShift(req.body);
            res.status(201).json({ success: true, data: shift });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const shift = await this.workShiftService.updateWorkShift(req.params.id, req.body);
            res.json({ success: true, data: shift });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.workShiftService.deleteWorkShift(req.params.id);
            res.json({ success: true, message: 'Work shift deleted successfully' });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };
}
