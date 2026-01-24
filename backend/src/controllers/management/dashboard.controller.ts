import { Request, Response } from 'express';
import * as dashboardService from '../../services/dashboard.service';

/**
 * Lấy thống kê tổng quan Dashboard
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
    try {
        const { start_date, end_date, season_id } = req.query;

        const stats = await dashboardService.getDashboardStats(
            start_date as string,
            end_date as string,
            season_id as string
        );

        return res.json({ success: true, data: stats });
    } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Lấy lịch sử dòng tiền
 */
export const getCashFlowHistory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { months } = req.query;
        const monthsNum = months ? parseInt(months as string) : 6;

        const history = await dashboardService.getCashFlowHistory(monthsNum);

        return res.json({ success: true, data: history });
    } catch (error: any) {
        console.error('Error fetching cash flow history:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Lấy danh sách vật tư sắp hết
 */
export const getLowStockItems = async (req: Request, res: Response): Promise<any> => {
    try {
        const { limit } = req.query;
        const limitNum = limit ? parseInt(limit as string) : 10;

        const items = await dashboardService.getLowStockItems(limitNum);

        return res.json({ success: true, data: items });
    } catch (error: any) {
        console.error('Error fetching low stock items:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Lấy danh sách nhân viên có số dư cao nhất
 */
export const getTopWorkers = async (req: Request, res: Response): Promise<any> => {
    try {
        const { limit } = req.query;
        const limitNum = limit ? parseInt(limit as string) : 10;

        const workers = await dashboardService.getTopWorkers(limitNum);

        return res.json({ success: true, data: workers });
    } catch (error: any) {
        console.error('Error fetching top workers:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
