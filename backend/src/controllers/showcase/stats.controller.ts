import { Request, Response } from 'express';
import pool from '../../config/database';

/**
 * Lấy thống kê lượt truy cập
 */
export const getStats = async (_req: Request, res: Response): Promise<any> => {
    try {
        // Kiểm tra xem bảng đã tồn tại chưa, nếu chưa thì tạo (Lazy Init)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS site_stats (
                id SERIAL PRIMARY KEY,
                total_views BIGINT DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Đảm bảo có ít nhất 1 dòng dữ liệu
        const checkResult = await pool.query('SELECT * FROM site_stats LIMIT 1');
        if (checkResult.rows.length === 0) {
            await pool.query('INSERT INTO site_stats (total_views) VALUES (0)');
        }

        const result = await pool.query('SELECT total_views FROM site_stats LIMIT 1');
        return res.json({ success: true, count: parseInt(result.rows[0].total_views) });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Tăng số lượt truy cập
 */
export const incrementStats = async (_req: Request, res: Response): Promise<any> => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS site_stats (
                id SERIAL PRIMARY KEY,
                total_views BIGINT DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tăng view
        await pool.query(`
            UPDATE site_stats 
            SET total_views = total_views + 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = (SELECT id FROM site_stats LIMIT 1)
        `);

        // Nếu chưa có dòng nào (vừa tạo bảng xong), thì chèn dòng đầu tiên
        const updateResult = await pool.query('SELECT total_views FROM site_stats LIMIT 1');
        if (updateResult.rows.length === 0) {
            await pool.query('INSERT INTO site_stats (total_views) VALUES (1)');
        }

        const result = await pool.query('SELECT total_views FROM site_stats LIMIT 1');
        return res.json({ success: true, count: parseInt(result.rows[0].total_views) });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};
