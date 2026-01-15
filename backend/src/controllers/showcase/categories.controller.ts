import { Request, Response } from 'express';
import pool from '../../config/database';

/**
 * Lấy danh mục sản phẩm
 */
export const getProductCategories = async (_req: Request, res: Response): Promise<any> => {
    try {
        const result = await pool.query(`
            SELECT * FROM product_categories 
            WHERE is_active = TRUE
            ORDER BY display_order, category_name
        `);

        return res.json({ success: true, data: result.rows });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Lấy danh mục blog
 */
export const getBlogCategories = async (_req: Request, res: Response): Promise<any> => {
    try {
        const result = await pool.query(`
            SELECT * FROM blog_categories 
            WHERE is_active = TRUE
            ORDER BY display_order, category_name
        `);

        return res.json({ success: true, data: result.rows });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};
