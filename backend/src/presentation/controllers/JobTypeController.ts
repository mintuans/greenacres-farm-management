import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { JobTypeService } from '../../domain/services/JobTypeService';
import { TYPES } from '../../core/types';

@injectable()
export class JobTypeController {
    constructor(
        @inject(TYPES.JobTypeService) private jobTypeService: JobTypeService
    ) {}

    getAll = async (_req: Request, res: Response): Promise<void> => {
        try {
            const jobTypes = await this.jobTypeService.getAllJobTypes();
            res.json({ success: true, data: jobTypes });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    getOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const jobType = await this.jobTypeService.getJobType(req.params.id);
            if (!jobType) {
                res.status(404).json({ success: false, message: 'Job type not found' });
                return;
            }
            res.json({ success: true, data: jobType });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const jobType = await this.jobTypeService.createJobType(req.body);
            res.status(201).json({ success: true, data: jobType });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const jobType = await this.jobTypeService.updateJobType(req.params.id, req.body);
            res.json({ success: true, data: jobType });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.jobTypeService.deleteJobType(req.params.id);
            res.json({ success: true, message: 'Job type deleted successfully' });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };
}
