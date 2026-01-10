import { Request, Response } from 'express';
import pool from '../../config/database';

/**
 * Lấy danh sách ảnh của vườn (images_farm)
 */
export const getFarmImages = async (req: Request, res: Response) => {
    try {
        const { limit = 6 } = req.query;

        const query = `
            SELECT 
                id, 
                image_name, 
                file_size,
                image_type as mime_type,
                uploaded_at as created_at
            FROM media_files
            WHERE deleted_at IS NULL AND category = 'images_farm'
            ORDER BY uploaded_at DESC
            LIMIT $1
        `;

        const result = await pool.query(query, [limit]);

        // Lấy tổng số lượng
        const countResult = await pool.query(`
            SELECT COUNT(*) FROM media_files 
            WHERE deleted_at IS NULL AND category = 'images_farm'
        `);

        res.json({
            success: true,
            data: result.rows,
            total: parseInt(countResult.rows[0].count)
        });
    } catch (error: any) {
        console.error('Error in getFarmImages:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
