import { Request, Response } from 'express';
import pool from '../../config/database';
import { logActivity } from '../../services/audit-log.service';

/**
 * Lấy danh sách media files
 */
export const getAllMedia = async (req: Request, res: Response): Promise<any> => {
    try {
        const { page = 1, limit = 20, search, category } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = `
            SELECT 
                id, 
                image_name, 
                file_size,
                image_type as mime_type,
                category,
                uploaded_at as created_at
            FROM media_files
            WHERE deleted_at IS NULL
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (search) {
            query += ` AND image_name ILIKE $${paramIndex}`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (category) {
            query += ` AND category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        query += ` ORDER BY uploaded_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Get total count
        const countResult = await pool.query(`SELECT COUNT(*) FROM media_files WHERE deleted_at IS NULL`);

        return res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: Number(countResult.rows[0].count)
            }
        });
    } catch (error: any) {
        console.error('Error in getAllMedia:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Upload media file
 */
export const uploadMedia = async (req: Request, res: Response): Promise<any> => {
    try {
        const { image_name, image_data, mime_type, category } = req.body;

        if (!image_name || !image_data) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin media' });
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(image_data.split(',')[1], 'base64');
        const file_size = buffer.length;

        const result = await pool.query(`
            INSERT INTO media_files (image_name, image_data, file_size, image_type, category)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, image_name, file_size, image_type as mime_type, category, uploaded_at as created_at
        `, [image_name, buffer, file_size, mime_type || 'image/jpeg', category || 'gallery']);

        const media = result.rows[0];

        // Audit log: log metadata only, skip large image_data
        await logActivity(req, 'UPLOAD_MEDIA', 'media_files', media.id, null, {
            image_name,
            file_size,
            mime_type,
            category
        });

        return res.status(201).json({
            success: true,
            message: 'Upload media thành công',
            data: media
        });
    } catch (error: any) {
        console.error('Error in uploadMedia:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Lấy media file theo ID (trả về base64)
 */
export const getMediaById = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT id, image_name, image_data, image_type, file_size, uploaded_at
            FROM media_files
            WHERE id = $1 AND deleted_at IS NULL
        `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy ảnh' });
        }

        const media = result.rows[0];
        const base64 = media.image_data.toString('base64');

        return res.json({
            success: true,
            data: {
                id: media.id,
                image_name: media.image_name,
                mime_type: media.image_type,
                file_size: media.file_size,
                created_at: media.uploaded_at,
                image_data: `data:${media.image_type};base64,${base64}`
            }
        });
    } catch (error: any) {
        console.error('Error in getMediaById:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Xóa media file
 */
export const deleteMedia = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        // Fetch old values for audit logging (metadata only)
        const oldMediaResult = await pool.query(`
            SELECT id, image_name, file_size, image_type as mime_type, category
            FROM media_files
            WHERE id = $1 AND deleted_at IS NULL
        `, [id]);

        if (oldMediaResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy ảnh' });
        }

        const oldMedia = oldMediaResult.rows[0];

        // Check if media is being used
        const usageCheck = await pool.query(`
            SELECT COUNT(*) FROM product_media WHERE media_id = $1
        `, [id]);

        if (Number(usageCheck.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa ảnh đang được sử dụng bởi sản phẩm'
            });
        }

        const result = await pool.query(`
            UPDATE media_files 
            SET deleted_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy ảnh' });
        }

        await logActivity(req, 'DELETE_MEDIA', 'media_files', id, oldMedia, null);

        return res.json({
            success: true,
            message: 'Xóa ảnh thành công'
        });
    } catch (error: any) {
        console.error('Error in deleteMedia:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Phục vụ ảnh trực tiếp (Binary Stream)
 * Dùng cho <img src="/api/management/media/raw/ID" />
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
            return res.status(404).json('Not found');
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
