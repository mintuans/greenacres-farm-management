import { Request, Response } from 'express';
import * as seasonService from '../../services/season.service';

// Tạo mùa vụ mới
export const createSeason = async (req: Request, res: Response) => {
    try {
        const season = await seasonService.createSeason(req.body);
        res.status(201).json({
            success: true,
            data: season,
            message: 'Season created successfully'
        });
    } catch (error: any) {
        console.error('Create season error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create season'
        });
    }
};

// Lấy danh sách mùa vụ
export const getSeasons = async (req: Request, res: Response) => {
    try {
        const { status, unitId } = req.query;
        const seasons = await seasonService.getSeasons(status as string, unitId as string);
        res.json({
            success: true,
            data: seasons
        });
    } catch (error: any) {
        console.error('Get seasons error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get seasons'
        });
    }
};

// Lấy mùa vụ theo ID
export const getSeasonById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const season = await seasonService.getSeasonById(id);

        if (!season) {
            res.status(404).json({
                success: false,
                message: 'Season not found'
            });
            return;
        }

        res.json({
            success: true,
            data: season
        });
    } catch (error: any) {
        console.error('Get season error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get season'
        });
    }
};

// Cập nhật mùa vụ
export const updateSeason = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const season = await seasonService.updateSeason(id, req.body);

        if (!season) {
            res.status(404).json({
                success: false,
                message: 'Season not found'
            });
            return;
        }

        res.json({
            success: true,
            data: season,
            message: 'Season updated successfully'
        });
    } catch (error: any) {
        console.error('Update season error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update season'
        });
    }
};

// Xóa mùa vụ
export const deleteSeason = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await seasonService.deleteSeason(id);

        if (!deleted) {
            res.status(404).json({
                success: false,
                message: 'Season not found'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Season deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete season error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete season'
        });
    }
};

// Đóng mùa vụ
export const closeSeason = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const season = await seasonService.closeSeason(id);

        if (!season) {
            res.status(404).json({
                success: false,
                message: 'Season not found'
            });
            return;
        }

        res.json({
            success: true,
            data: season,
            message: 'Season closed successfully'
        });
    } catch (error: any) {
        console.error('Close season error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to close season'
        });
    }
};

// Lấy thống kê
export const getSeasonStats = async (_req: Request, res: Response) => {
    try {
        const stats = await seasonService.getSeasonStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get stats'
        });
    }
};

export const getNextSeasonCode = async (_req: Request, res: Response) => {
    try {
        const nextCode = await seasonService.getNextSeasonCode();
        res.json({
            success: true,
            data: nextCode
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get next code'
        });
    }
};

