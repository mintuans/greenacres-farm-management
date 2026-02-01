import { Request, Response } from 'express';
import pool from '../../config/database';

/**
 * Lấy danh sách bài viết
 */
export const getBlogPosts = async (req: Request, res: Response) => {
    try {
        const { category_id, search, page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = `
            SELECT 
                bp.*,
                bc.category_name
            FROM blog_posts bp
            LEFT JOIN blog_categories bc ON bp.category_id = bc.id
            WHERE bp.status = 'PUBLISHED' AND bp.deleted_at IS NULL
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

        query += ` ORDER BY bp.published_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        return res.json({ success: true, data: result.rows });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Lấy chi tiết bài viết
 */
export const getBlogPostBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        const result = await pool.query(`
            SELECT 
                bp.*,
                bc.category_name
            FROM blog_posts bp
            LEFT JOIN blog_categories bc ON bp.category_id = bc.id
            WHERE bp.slug = $1 AND bp.status = 'PUBLISHED' AND bp.deleted_at IS NULL
        `, [slug]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
        }

        const post = result.rows[0];

        // Lấy tags
        const tagsResult = await pool.query(`
            SELECT bt.* FROM blog_tags bt
            JOIN blog_post_tags bpt ON bt.id = bpt.tag_id
            WHERE bpt.blog_post_id = $1
        `, [post.id]);

        // Tăng view_count
        await pool.query(`UPDATE blog_posts SET view_count = view_count + 1 WHERE id = $1`, [post.id]);

        return res.json({
            success: true,
            data: {
                ...post,
                tags: tagsResult.rows
            }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};
