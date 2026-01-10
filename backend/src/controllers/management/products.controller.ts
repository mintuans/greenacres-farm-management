import { Request, Response } from 'express';
import pool from '../../config/database';

/**
 * Lấy tất cả sản phẩm (cho quản lý)
 */
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20, search, status } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = `
            SELECT 
                p.*,
                pc.category_name,
                (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id) as avg_rating,
                (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id) as review_count
            FROM products p
            LEFT JOIN product_categories pc ON p.category_id = pc.id
            WHERE p.deleted_at IS NULL
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (search) {
            query += ` AND (p.product_name ILIKE $${paramIndex} OR p.product_code ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (status) {
            query += ` AND p.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Get total count
        const countResult = await pool.query(`SELECT COUNT(*) FROM products WHERE deleted_at IS NULL`);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: Number(countResult.rows[0].count)
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Lấy chi tiết sản phẩm theo ID
 */
export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT p.*, pc.category_name
            FROM products p
            LEFT JOIN product_categories pc ON p.category_id = pc.id
            WHERE p.id = $1 AND p.deleted_at IS NULL
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Tạo sản phẩm mới
 */
export const createProduct = async (req: Request, res: Response) => {
    try {
        const {
            product_code,
            product_name,
            slug,
            category_id,
            short_description,
            full_description,
            price,
            original_price,
            stock_quantity,
            unit_of_measure,
            status,
            is_featured,
            thumbnail_id
        } = req.body;

        const result = await pool.query(`
            INSERT INTO products (
                product_code, product_name, slug, category_id,
                short_description, full_description,
                price, original_price, stock_quantity, unit_of_measure,
                status, is_featured, thumbnail_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `, [
            product_code,
            product_name,
            slug,
            category_id,
            short_description,
            full_description,
            price,
            original_price,
            stock_quantity,
            unit_of_measure,
            status || 'DRAFT',
            is_featured || false,
            thumbnail_id || null
        ]);

        res.status(201).json({
            success: true,
            message: 'Tạo sản phẩm thành công',
            data: result.rows[0]
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Cập nhật sản phẩm
 */
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            product_name,
            slug,
            category_id,
            short_description,
            full_description,
            price,
            original_price,
            stock_quantity,
            unit_of_measure,
            status,
            is_featured,
            thumbnail_id
        } = req.body;

        const result = await pool.query(`
            UPDATE products SET
                product_name = $1,
                slug = $2,
                category_id = $3,
                short_description = $4,
                full_description = $5,
                price = $6,
                original_price = $7,
                stock_quantity = $8,
                unit_of_measure = $9,
                status = $10,
                is_featured = $11,
                thumbnail_id = $12,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $13 AND deleted_at IS NULL
            RETURNING *
        `, [
            product_name,
            slug,
            category_id,
            short_description,
            full_description,
            price,
            original_price,
            stock_quantity,
            unit_of_measure,
            status,
            is_featured,
            thumbnail_id || null,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
        }

        res.json({
            success: true,
            message: 'Cập nhật sản phẩm thành công',
            data: result.rows[0]
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Xóa sản phẩm (soft delete)
 */
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            UPDATE products 
            SET deleted_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
        }

        res.json({
            success: true,
            message: 'Xóa sản phẩm thành công'
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};
