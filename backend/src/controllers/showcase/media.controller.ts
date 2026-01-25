import { Request, Response } from 'express';
import pool from '../../config/database';

/**
 * Lấy danh sách ảnh của vườn (images_farm)
 */
export const getFarmImages = async (req: Request, res: Response): Promise<any> => {
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

        return res.json({
            success: true,
            data: result.rows,
            total: parseInt(countResult.rows[0].count)
        });
    } catch (error: any) {
        console.error('Error in getFarmImages:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Phục vụ ảnh trực tiếp (Binary Stream)
 * Dùng cho <img src="/api/showcase/media/raw/ID" />
 */
export const getMediaResource = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT image_data, image_type
            FROM media_files
            WHERE id = $1 AND deleted_at IS NULL
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).send('Not found');
        }

        const media = result.rows[0];

        res.setHeader('Content-Type', media.image_type || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 năm
        return res.send(media.image_data);
    } catch (error: any) {
        console.error('Error in getMediaResource:', error);
        return res.status(500).send('Server Error');
    }
};
