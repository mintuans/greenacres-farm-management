import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { SeasonService } from '../../domain/services/SeasonService';
import { TYPES } from '../../core/types';

@injectable()
export class SeasonController {
    constructor(
        @inject(TYPES.SeasonService) private seasonService: SeasonService
    ) { }

    getAll = async (_req: Request, res: Response): Promise<void> => {
        try {
            const seasons = await this.seasonService.getAllSeasons();
            res.json({ success: true, data: seasons });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    getOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const season = await this.seasonService.getSeason(req.params.id);
            if (!season) {
                res.status(404).json({ success: false, message: 'Season not found' });
                return;
            }
            res.json({ success: true, data: season });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    getActive = async (_req: Request, res: Response): Promise<void> => {
        try {
            const season = await this.seasonService.getActiveSeason();
            res.json({ success: true, data: season });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const season = await this.seasonService.createSeason(req.body);
            res.status(201).json({ success: true, data: season });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const season = await this.seasonService.updateSeason(req.params.id, req.body);
            res.json({ success: true, data: season });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.seasonService.deleteSeason(req.params.id);
            res.json({ success: true, message: 'Season deleted successfully' });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };

    getStats = async (_req: Request, res: Response): Promise<void> => {
        try {
            const stats = await this.seasonService.getSeasonStats();
            res.json({ success: true, data: stats });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    getNextCode = async (_req: Request, res: Response): Promise<void> => {
        try {
            const code = await this.seasonService.getNextSeasonCode();
            res.json({ success: true, data: code });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    closeSeason = async (req: Request, res: Response): Promise<void> => {
        try {
            const season = await this.seasonService.closeSeason(req.params.id);
            res.json({ success: true, data: season });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };
}
