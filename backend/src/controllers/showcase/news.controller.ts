import { Request, Response } from 'express';
import { getLatestNews } from '../../services/news.service';

/**
 * Get external news for showcase
 */
export const getExternalNews = async (_req: Request, res: Response) => {
    try {
        const news = await getLatestNews();
        return res.json({
            success: true,
            data: news
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: 'Không thể lấy tin tức từ nguồn bên ngoài',
            error: error.message
        });
    }
};
