import { Request, Response } from 'express';
import pool from '../../config/database';
import { logActivity } from '../../services/audit-log.service';

/**
 * Lấy tất cả bài viết (bao gồm cả DRAFT) - cho admin
 */
export const getAllBlogPosts = async (req: Request, res: Response): Promise<any> => {
    try {
        const { category_id, search, page = 1, limit = 100 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = `
            SELECT 
                bp.*,
                bc.category_name
            FROM blog_posts bp
            LEFT JOIN blog_categories bc ON bp.category_id = bc.id
            WHERE bp.deleted_at IS NULL
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (category_id) {
            query += ` AND bp.category_id = $${paramIndex}`;
            params.push(category_id);
            paramIndex++;
        }

        if (search) {
            query += ` AND (bp.title ILIKE $${paramIndex} OR bp.excerpt ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        query += ` ORDER BY bp.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        return res.json({ success: true, data: result.rows });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Tạo bài viết mới
 */
export const createBlogPost = async (req: Request, res: Response): Promise<any> => {
    try {
        const {
            title,
            slug,
            excerpt,
            content,
            thumbnail_id,
            category_id,
            status = 'DRAFT'
        } = req.body;

        if (!title || !slug || !excerpt || !content) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc (title, slug, excerpt, content)'
            });
        }

        // Kiểm tra slug đã tồn tại chưa
        const existingSlug = await pool.query(
            'SELECT id FROM blog_posts WHERE slug = $1 AND deleted_at IS NULL',
            [slug]
        );

        if (existingSlug.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Slug đã tồn tại, vui lòng chọn slug khác'
            });
        }

        const result = await pool.query(`
            INSERT INTO blog_posts (
                title, slug, excerpt, content, featured_image_id, category_id, status, published_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [
            title,
            slug,
            excerpt,
            content,
            thumbnail_id || null,
            category_id || null,
            status,
            status === 'PUBLISHED' ? new Date() : null
        ]);

        const blogPost = result.rows[0];

        await logActivity(req, 'CREATE_BLOG_POST', 'blog_posts', blogPost.id, null, req.body);

        return res.status(201).json({
            success: true,
            message: 'Tạo bài viết thành công',
            data: blogPost
        });
    } catch (error: any) {
        console.error('Error in createBlogPost:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Cập nhật bài viết
 */
export const updateBlogPost = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const {
            title,
            slug,
            excerpt,
            content,
            thumbnail_id,
            category_id,
            status
        } = req.body;

        // Kiểm tra bài viết tồn tại
        const existing = await pool.query(
            'SELECT * FROM blog_posts WHERE id = $1 AND deleted_at IS NULL',
            [id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bài viết không tồn tại'
            });
        }

        const oldPost = existing.rows[0];

        // Kiểm tra slug trùng (nếu thay đổi slug)
        if (slug && slug !== oldPost.slug) {
            const existingSlug = await pool.query(
                'SELECT id FROM blog_posts WHERE slug = $1 AND id != $2 AND deleted_at IS NULL',
                [slug, id]
            );

            if (existingSlug.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Slug đã tồn tại, vui lòng chọn slug khác'
                });
            }
        }

        const oldStatus = oldPost.status;
        const shouldUpdatePublishedAt = status === 'PUBLISHED' && oldStatus !== 'PUBLISHED';

        const result = await pool.query(`
            UPDATE blog_posts SET
                title = COALESCE($1, title),
                slug = COALESCE($2, slug),
                excerpt = COALESCE($3, excerpt),
                content = COALESCE($4, content),
                featured_image_id = COALESCE($5, featured_image_id),
                category_id = COALESCE($6, category_id),
                status = COALESCE($7, status),
                published_at = CASE 
                    WHEN $8 = true THEN CURRENT_TIMESTAMP 
                    ELSE published_at 
                END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $9 AND deleted_at IS NULL
            RETURNING *
        `, [
            title,
            slug,
            excerpt,
            content,
            thumbnail_id,
            category_id,
            status,
            shouldUpdatePublishedAt,
            id
        ]);

        await logActivity(req, 'UPDATE_BLOG_POST', 'blog_posts', id, oldPost, req.body);

        return res.json({
            success: true,
            message: 'Cập nhật bài viết thành công',
            data: result.rows[0]
        });
    } catch (error: any) {
        console.error('Error in updateBlogPost:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Xóa bài viết (soft delete)
 */
export const deleteBlogPost = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const oldResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
        const oldPost = oldResult.rows[0];

        const result = await pool.query(`
            UPDATE blog_posts 
            SET deleted_at = CURRENT_TIMESTAMP 
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bài viết không tồn tại'
            });
        }

        await logActivity(req, 'DELETE_BLOG_POST', 'blog_posts', id, oldPost, null);

        return res.json({
            success: true,
            message: 'Xóa bài viết thành công'
        });
    } catch (error: any) {
        console.error('Error in deleteBlogPost:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Lấy danh sách danh mục blog
 */
export const getBlogCategories = async (_req: Request, res: Response): Promise<any> => {
    try {
        const result = await pool.query(`
            SELECT * FROM blog_categories 
            ORDER BY category_name ASC
        `);

        return res.json({
            success: true,
            data: result.rows
        });
    } catch (error: any) {
        console.error('Error in getBlogCategories:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
