import { Request, Response } from 'express';
import pool from '../../config/database';

/**
 * Khởi tạo bảng và cột nếu chưa có
 */
const ensureTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS site_stats (
            id SERIAL PRIMARY KEY,
            total_views BIGINT DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    // Thêm cột total_favorites nếu chưa có
    await pool.query(`
        ALTER TABLE site_stats ADD COLUMN IF NOT EXISTS total_favorites BIGINT DEFAULT 0
    `);
    const check = await pool.query('SELECT * FROM site_stats LIMIT 1');
    if (check.rows.length === 0) {
        await pool.query('INSERT INTO site_stats (total_views, total_favorites) VALUES (0, 0)');
    }
};

/**
 * Lấy thống kê lượt truy cập
 */
export const getStats = async (_req: Request, res: Response): Promise<any> => {
    try {
        await ensureTable();
        const result = await pool.query('SELECT total_views, total_favorites FROM site_stats LIMIT 1');
        return res.json({
            success: true,
            count: parseInt(result.rows[0].total_views),
            favorites: parseInt(result.rows[0].total_favorites || '0')
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Tăng số lượt truy cập
 */
export const incrementStats = async (_req: Request, res: Response): Promise<any> => {
    try {
        await ensureTable();
        await pool.query(`
            UPDATE site_stats 
            SET total_views = total_views + 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = (SELECT id FROM site_stats LIMIT 1)
        `);
        const result = await pool.query('SELECT total_views FROM site_stats LIMIT 1');
        return res.json({ success: true, count: parseInt(result.rows[0].total_views) });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Toggle yêu thích (tăng/giảm)
 */
export const toggleFavorite = async (req: Request, res: Response): Promise<any> => {
    try {
        await ensureTable();
        const { action } = req.body; // 'add' | 'remove'
        const delta = action === 'remove' ? -1 : 1;
        await pool.query(`
            UPDATE site_stats
            SET total_favorites = GREATEST(0, total_favorites + $1), updated_at = CURRENT_TIMESTAMP
            WHERE id = (SELECT id FROM site_stats LIMIT 1)
        `, [delta]);
        const result = await pool.query('SELECT total_favorites FROM site_stats LIMIT 1');
        return res.json({ success: true, favorites: parseInt(result.rows[0].total_favorites) });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};
