import { Request, Response } from 'express';
import pool from '../../config/database';

/**
 * Lấy danh sách sản phẩm công khai
 */
export const getProducts = async (req: Request, res: Response) => {
    try {
        const { category_id, search, page = 1, limit = 12 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = `
            SELECT 
                p.*,
                pc.category_name,
                (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id) as avg_rating,
                (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id) as review_count
            FROM products p
            LEFT JOIN product_categories pc ON p.category_id = pc.id
            WHERE p.status = 'PUBLISHED' AND p.deleted_at IS NULL
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (category_id) {
            query += ` AND p.category_id = $${paramIndex}`;
            params.push(category_id);
            paramIndex++;
        }

        if (search) {
            query += ` AND (p.product_name ILIKE $${paramIndex} OR p.short_description ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: Number(page),
                limit: Number(limit)
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Lấy chi tiết sản phẩm theo slug
 */
export const getProductBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        // Lấy thông tin sản phẩm
        const productResult = await pool.query(`
            SELECT 
                p.*,
                pc.category_name,
                (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id) as avg_rating,
                (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id) as review_count
            FROM products p
            LEFT JOIN product_categories pc ON p.category_id = pc.id
            WHERE p.slug = $1 AND p.status = 'PUBLISHED' AND p.deleted_at IS NULL
        `, [slug]);

        if (productResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
        }

        const product = productResult.rows[0];

        // Lấy hình ảnh
        const imagesResult = await pool.query(`
            SELECT m.id, m.image_name, pm.display_order, pm.is_primary
            FROM product_media pm
            JOIN media_files m ON pm.media_id = m.id
            WHERE pm.product_id = $1
            ORDER BY pm.display_order
        `, [product.id]);

        // Tăng view_count
        await pool.query(`UPDATE products SET view_count = view_count + 1 WHERE id = $1`, [product.id]);

        res.json({
            success: true,
            data: {
                ...product,
                images: imagesResult.rows
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Lấy đánh giá sản phẩm
 */
export const getProductReviews = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT 
                pr.*,
                pu.full_name as user_name
            FROM product_reviews pr
            LEFT JOIN public_users pu ON pr.user_id = pu.id
            WHERE pr.product_id = $1 AND pr.deleted_at IS NULL
            ORDER BY pr.created_at DESC
        `, [id]);

        res.json({ success: true, data: result.rows });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Tạo đánh giá mới
 */
export const createProductReview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { rating, title, content, reviewer_name, reviewer_email } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating phải từ 1-5' });
        }

        const result = await pool.query(`
            INSERT INTO product_reviews 
            (product_id, reviewer_name, reviewer_email, rating, title, content)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [id, reviewer_name, reviewer_email, rating, title, content]);

        res.status(201).json({
            success: true,
            message: 'Đánh giá đã được gửi',
            data: result.rows[0]
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};
