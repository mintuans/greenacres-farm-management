import { Request, Response } from 'express';
import * as usageService from '../../services/inventory-usage.service';

export const logUsage = async (req: Request, res: Response): Promise<void> => {
    try {
        const usage = await usageService.logUsage(req.body);
        res.status(201).json({
            success: true,
            data: usage
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getUsageBySeason = async (req: Request, res: Response): Promise<void> => {
    try {
        const usage = await usageService.getUsageBySeason(req.params.seasonId);
        res.status(200).json({
            success: true,
            data: usage
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getMedicineUsageStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const stats = await usageService.getMedicineUsageStats(req.params.seasonId);
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
