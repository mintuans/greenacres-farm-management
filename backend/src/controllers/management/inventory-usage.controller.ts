import { Request, Response } from 'express';
import * as usageService from '../../services/inventory-usage.service';
import { logActivity } from '../../services/audit-log.service';

export const logUsage = async (req: Request, res: Response): Promise<any> => {
    try {
        const usage = await usageService.logUsage(req.body);

        await logActivity(req, 'LOG_INVENTORY_USAGE', 'inventory_usage', usage.id, null, req.body);

        return res.status(201).json({
            success: true,
            data: usage
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getUsageBySeason = async (req: Request, res: Response): Promise<any> => {
    try {
        const usage = await usageService.getUsageBySeason(req.params.seasonId);
        return res.status(200).json({
            success: true,
            data: usage
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getMedicineUsageStats = async (req: Request, res: Response): Promise<any> => {
    try {
        const stats = await usageService.getMedicineUsageStats(req.params.seasonId);
        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
