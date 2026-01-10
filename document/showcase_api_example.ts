// =================================================================================
// API ENDPOINTS CHO TRANG SHOWCASE
// Framework: Express.js + TypeScript
// Database: PostgreSQL với Prisma/TypeORM
// =================================================================================

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// =================================================================================
// 1. SẢN PHẨM (PRODUCTS)
// =================================================================================

/**
 * GET /api/products
 * Lấy danh sách sản phẩm với filter, search, pagination
 */
router.get('/api/products', async (req: Request, res: Response) => {
    try {
        const {
            category_id,
            search,
            min_price,
            max_price,
            is_featured,
            sort_by = 'created_at',
            order = 'DESC',
            page = 1,
            limit = 12
        } = req.query;

        const offset = (Number(page) - 1) * Number(limit);

        // Query với filters
        const query = `
            SELECT * FROM v_products_full
            WHERE status = 'PUBLISHED'
            ${category_id ? `AND category_id = $1` : ''}
            ${search ? `AND (product_name ILIKE $2 OR short_description ILIKE $2)` : ''}
            ${min_price ? `AND price >= $3` : ''}
            ${max_price ? `AND price <= $4` : ''}
            ${is_featured ? `AND is_featured = $5` : ''}
            ORDER BY ${sort_by} ${order}
            LIMIT $6 OFFSET $7
        `;

        const products = await db.query(query, [
            category_id,
            search ? `%${search}%` : null,
            min_price,
            max_price,
            is_featured,
            limit,
            offset
        ]);

        // Đếm tổng số sản phẩm
        const countQuery = `SELECT COUNT(*) FROM products WHERE status = 'PUBLISHED'`;
        const total = await db.query(countQuery);

        res.json({
            success: true,
            data: products.rows,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: total.rows[0].count,
                totalPages: Math.ceil(total.rows[0].count / Number(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/products/:slug
 * Lấy chi tiết sản phẩm theo slug
 */
router.get('/api/products/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        // Lấy thông tin sản phẩm
        const product = await db.query(`
            SELECT * FROM v_products_full WHERE slug = $1 AND status = 'PUBLISHED'
        `, [slug]);

        if (product.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
        }

        const productData = product.rows[0];

        // Lấy tất cả ảnh của sản phẩm
        const images = await db.query(`
            SELECT m.id, m.file_url, m.alt_text, pm.display_order, pm.is_primary
            FROM product_media pm
            JOIN media_files m ON pm.media_id = m.id
            WHERE pm.product_id = $1
            ORDER BY pm.display_order
        `, [productData.id]);

        // Lấy biến thể sản phẩm
        const variants = await db.query(`
            SELECT * FROM product_variants 
            WHERE product_id = $1 AND is_active = TRUE
        `, [productData.id]);

        // Tăng view_count
        await db.query(`
            UPDATE products SET view_count = view_count + 1 WHERE id = $1
        `, [productData.id]);

        res.json({
            success: true,
            data: {
                ...productData,
                images: images.rows,
                variants: variants.rows
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/products/:id/reviews
 * Lấy đánh giá của sản phẩm
 */
router.get('/api/products/:id/reviews', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10, rating_filter } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const reviews = await db.query(`
            SELECT 
                pr.*,
                pu.full_name as user_name,
                pu.avatar_id,
                m.file_url as avatar_url
            FROM product_reviews pr
            LEFT JOIN public_users pu ON pr.user_id = pu.id
            LEFT JOIN media_files m ON pu.avatar_id = m.id
            WHERE pr.product_id = $1 
                AND pr.status = 'APPROVED'
                ${rating_filter ? `AND pr.rating = $4` : ''}
            ORDER BY pr.created_at DESC
            LIMIT $2 OFFSET $3
        `, [id, limit, offset, rating_filter]);

        // Thống kê rating
        const ratingStats = await db.query(`
            SELECT 
                AVG(rating) as avg_rating,
                COUNT(*) as total_reviews,
                COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
                COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
                COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
                COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
                COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
            FROM product_reviews
            WHERE product_id = $1 AND status = 'APPROVED'
        `, [id]);

        res.json({
            success: true,
            data: reviews.rows,
            stats: ratingStats.rows[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/products/:id/reviews
 * Tạo đánh giá mới
 */
router.post('/api/products/:id/reviews', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { rating, title, content, images } = req.body;
        const userId = req.user?.id; // Từ middleware auth
        const { reviewer_name, reviewer_email } = req.body;

        // Validate
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating phải từ 1-5' });
        }

        if (!userId && (!reviewer_name || !reviewer_email)) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng đăng nhập hoặc cung cấp tên và email'
            });
        }

        // Tạo review
        const review = await db.query(`
            INSERT INTO product_reviews 
            (product_id, user_id, reviewer_name, reviewer_email, rating, title, content, images, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING')
            RETURNING *
        `, [id, userId, reviewer_name, reviewer_email, rating, title, content, JSON.stringify(images)]);

        res.status(201).json({
            success: true,
            message: 'Đánh giá của bạn đang chờ duyệt',
            data: review.rows[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/reviews/:id/helpful
 * Đánh dấu review hữu ích
 */
router.post('/api/reviews/:id/helpful', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { is_helpful } = req.body;
        const userId = req.user?.id;
        const sessionId = req.sessionID;

        await db.query(`
            INSERT INTO review_helpful (review_id, user_id, session_id, is_helpful)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (review_id, ${userId ? 'user_id' : 'session_id'}) 
            DO UPDATE SET is_helpful = $4
        `, [id, userId, sessionId, is_helpful]);

        res.json({ success: true, message: 'Cảm ơn phản hồi của bạn' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =================================================================================
// 2. BLOG/TIN TỨC
// =================================================================================

/**
 * GET /api/blog/posts
 * Lấy danh sách bài viết
 */
router.get('/api/blog/posts', async (req: Request, res: Response) => {
    try {
        const { category_id, tag, search, page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = `
            SELECT bp.* FROM v_blog_posts_full bp
            WHERE bp.status = 'PUBLISHED'
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

        if (tag) {
            query += ` AND bp.id IN (
                SELECT bpt.blog_post_id FROM blog_post_tags bpt
                JOIN blog_tags bt ON bpt.tag_id = bt.id
                WHERE bt.slug = $${paramIndex}
            )`;
            params.push(tag);
            paramIndex++;
        }

        query += ` ORDER BY bp.published_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const posts = await db.query(query, params);

        res.json({
            success: true,
            data: posts.rows
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/blog/posts/:slug
 * Lấy chi tiết bài viết
 */
router.get('/api/blog/posts/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        const post = await db.query(`
            SELECT * FROM v_blog_posts_full WHERE slug = $1 AND status = 'PUBLISHED'
        `, [slug]);

        if (post.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
        }

        const postData = post.rows[0];

        // Lấy tags
        const tags = await db.query(`
            SELECT bt.* FROM blog_tags bt
            JOIN blog_post_tags bpt ON bt.id = bpt.tag_id
            WHERE bpt.blog_post_id = $1
        `, [postData.id]);

        // Tăng view_count
        await db.query(`
            UPDATE blog_posts SET view_count = view_count + 1 WHERE id = $1
        `, [postData.id]);

        res.json({
            success: true,
            data: {
                ...postData,
                tags: tags.rows
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =================================================================================
// 3. BÌNH LUẬN (COMMENTS)
// =================================================================================

/**
 * GET /api/comments
 * Lấy bình luận cho sản phẩm hoặc blog
 */
router.get('/api/comments', async (req: Request, res: Response) => {
    try {
        const { commentable_type, commentable_id } = req.query;

        // Lấy tất cả bình luận (bao gồm nested)
        const comments = await db.query(`
            WITH RECURSIVE comment_tree AS (
                -- Bình luận gốc
                SELECT c.*, 0 as level, ARRAY[c.id] as path
                FROM v_comments_with_reactions c
                WHERE c.commentable_type = $1 
                    AND c.commentable_id = $2
                    AND c.parent_id IS NULL
                    AND c.status = 'APPROVED'
                
                UNION ALL
                
                -- Replies
                SELECT c.*, ct.level + 1, ct.path || c.id
                FROM v_comments_with_reactions c
                INNER JOIN comment_tree ct ON c.parent_id = ct.id
                WHERE c.status = 'APPROVED'
            )
            SELECT * FROM comment_tree 
            ORDER BY path, created_at
        `, [commentable_type, commentable_id]);

        res.json({
            success: true,
            data: comments.rows
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/comments
 * Tạo bình luận mới
 */
router.post('/api/comments', async (req: Request, res: Response) => {
    try {
        const { commentable_type, commentable_id, content, parent_id } = req.body;
        const userId = req.user?.id;
        const { commenter_name, commenter_email } = req.body;
        const sessionId = req.sessionID;

        // Validate
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });
        }

        if (!userId && !sessionId && (!commenter_name || !commenter_email)) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng đăng nhập hoặc cung cấp tên và email'
            });
        }

        // Tạo comment
        const comment = await db.query(`
            INSERT INTO comments 
            (commentable_type, commentable_id, user_id, commenter_name, commenter_email, 
             content, parent_id, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'APPROVED')
            RETURNING *
        `, [commentable_type, commentable_id, userId, commenter_name, commenter_email,
            content, parent_id]);

        res.status(201).json({
            success: true,
            message: 'Bình luận đã được đăng',
            data: comment.rows[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/comments/:id/reactions
 * Thả cảm xúc cho bình luận
 */
router.post('/api/comments/:id/reactions', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reaction_type } = req.body;
        const userId = req.user?.id;
        const sessionId = req.sessionID;

        // Validate reaction_type
        const validReactions = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
        if (!validReactions.includes(reaction_type)) {
            return res.status(400).json({
                success: false,
                message: 'Loại cảm xúc không hợp lệ'
            });
        }

        // Upsert reaction
        await db.query(`
            INSERT INTO comment_reactions (comment_id, user_id, session_id, reaction_type)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (comment_id, ${userId ? 'user_id' : 'session_id'}) 
            DO UPDATE SET reaction_type = $4
        `, [id, userId, sessionId, reaction_type]);

        // Lấy tổng reactions
        const reactions = await db.query(`
            SELECT reaction_type, COUNT(*) as count
            FROM comment_reactions
            WHERE comment_id = $1
            GROUP BY reaction_type
        `, [id]);

        res.json({
            success: true,
            data: reactions.rows
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/comments/:id/reactions
 * Xóa cảm xúc
 */
router.delete('/api/comments/:id/reactions', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const sessionId = req.sessionID;

        await db.query(`
            DELETE FROM comment_reactions
            WHERE comment_id = $1 AND ${userId ? 'user_id = $2' : 'session_id = $2'}
        `, [id, userId || sessionId]);

        res.json({ success: true, message: 'Đã xóa cảm xúc' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =================================================================================
// 4. DANH MỤC (CATEGORIES)
// =================================================================================

/**
 * GET /api/categories/products
 * Lấy danh mục sản phẩm
 */
router.get('/api/categories/products', async (req: Request, res: Response) => {
    try {
        const categories = await db.query(`
            SELECT * FROM product_categories 
            WHERE is_active = TRUE
            ORDER BY display_order, category_name
        `);

        // Tạo cấu trúc tree
        const buildTree = (items: any[], parentId: string | null = null) => {
            return items
                .filter(item => item.parent_id === parentId)
                .map(item => ({
                    ...item,
                    children: buildTree(items, item.id)
                }));
        };

        res.json({
            success: true,
            data: buildTree(categories.rows)
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/categories/blog
 * Lấy danh mục blog
 */
router.get('/api/categories/blog', async (req: Request, res: Response) => {
    try {
        const categories = await db.query(`
            SELECT * FROM blog_categories 
            WHERE is_active = TRUE
            ORDER BY display_order, category_name
        `);

        res.json({
            success: true,
            data: categories.rows
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =================================================================================
// 5. UPLOAD HÌNH ẢNH
// =================================================================================

/**
 * POST /api/media/upload
 * Upload hình ảnh
 */
router.post('/api/media/upload', upload.single('file'), async (req: Request, res: Response) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ success: false, message: 'Không có file được upload' });
        }

        const { category, alt_text, caption } = req.body;

        // Lưu vào database
        const media = await db.query(`
            INSERT INTO media_files 
            (file_name, file_path, file_url, file_type, file_size, category, alt_text, caption)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [
            file.originalname,
            file.path,
            `/uploads/${file.filename}`,
            file.mimetype,
            file.size,
            category,
            alt_text,
            caption
        ]);

        res.status(201).json({
            success: true,
            data: media.rows[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
