import { Request, Response } from 'express';
import pool from '../../config/database';
import { logActivity } from '../../services/audit-log.service';
import { emitToRoom } from '../../config/socket';

/**
 * Lấy bình luận
 */
export const getComments = async (req: Request, res: Response): Promise<any> => {
    try {
        const { commentable_type, commentable_id } = req.query;

        // Query join với public_users để lấy avatar và tên chính xác
        const result = await pool.query(`
            WITH RECURSIVE comment_tree AS (
                SELECT c.*, 0 as level, ARRAY[c.id] as path
                FROM comments c
                WHERE c.commentable_type = $1 
                    AND c.commentable_id = $2
                    AND c.parent_id IS NULL
                    AND c.deleted_at IS NULL
                
                UNION ALL
                
                SELECT c.*, ct.level + 1, ct.path || c.id
                FROM comments c
                INNER JOIN comment_tree ct ON c.parent_id = ct.id
                WHERE c.deleted_at IS NULL
            )
            SELECT 
                ct.id, ct.commentable_type, ct.commentable_id, ct.user_id, 
                ct.parent_id, ct.content, ct.rating, ct.created_at,
                pu.full_name as user_name,
                pu.avatar_id,
                COALESCE(r.reaction_count, 0) as reaction_count,
                r.reaction_types
            FROM comment_tree ct
            LEFT JOIN public_users pu ON ct.user_id = pu.id
            LEFT JOIN (
                SELECT 
                    comment_id, 
                    COUNT(*) as reaction_count, 
                    ARRAY_AGG(DISTINCT reaction_type) as reaction_types
                FROM comment_reactions
                GROUP BY comment_id
            ) r ON ct.id = r.comment_id
            ORDER BY ct.path, ct.created_at
        `, [commentable_type, commentable_id]);

        return res.json({ success: true, data: result.rows });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Tạo bình luận mới
 */
export const createComment = async (req: Request, res: Response): Promise<any> => {
    try {
        const { commentable_type, commentable_id, content, rating, parent_id } = req.body;
        const user_id = req.user?.id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });
        }

        // Lấy thông tin user để gửi kèm socket
        const userResult = await pool.query('SELECT full_name, avatar_id FROM public_users WHERE id = $1', [user_id]);
        const user = userResult.rows[0];

        const result = await pool.query(`
            INSERT INTO comments 
            (commentable_type, commentable_id, user_id, content, rating, parent_id, commenter_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [commentable_type, commentable_id, user_id, content, rating || 5, parent_id, user?.full_name]);

        const comment = {
            ...result.rows[0],
            user_name: user?.full_name,
            avatar_id: user?.avatar_id,
            reaction_count: 0,
            reaction_types: []
        };

        // Real-time: Gửi đến phòng (ví dụ: product-123 hoặc farm-001)
        const room = `${commentable_type.toLowerCase()}-${commentable_id}`;
        emitToRoom(room, 'new_comment', comment);

        await logActivity(req, 'CREATE_COMMENT', 'comments', comment.id, null, req.body);

        return res.status(201).json({
            success: true,
            message: 'Bình luận đã được đăng',
            data: comment
        });
    } catch (error: any) {
        console.error('Create comment error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Thả cảm xúc cho bình luận
 */
export const addReaction = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { reaction_type } = req.body;
        const user_id = req.user?.id;

        const validReactions = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
        if (!validReactions.includes(reaction_type)) {
            return res.status(400).json({ success: false, message: 'Loại cảm xúc không hợp lệ' });
        }

        // Lấy thông tin comment để biết room nào mà emit
        const commentResult = await pool.query('SELECT commentable_type, commentable_id FROM comments WHERE id = $1', [id]);
        if (commentResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Bình luận không tồn tại' });
        }
        const { commentable_type, commentable_id } = commentResult.rows[0];

        await pool.query(`
            INSERT INTO comment_reactions (comment_id, user_id, reaction_type)
            VALUES ($1, $2, $3)
            ON CONFLICT (comment_id, user_id) 
            DO UPDATE SET reaction_type = $3
        `, [id, user_id, reaction_type]);

        // Lấy lại thống kê reaction của comment này để gửi socket
        const statsResult = await pool.query(`
            SELECT 
                COUNT(*) as reaction_count,
                ARRAY_AGG(DISTINCT reaction_type) as reaction_types
            FROM comment_reactions 
            WHERE comment_id = $1
        `, [id]);

        const room = `${commentable_type.toLowerCase()}-${commentable_id}`;
        emitToRoom(room, 'update_reaction', {
            comment_id: id,
            reaction_count: statsResult.rows[0].reaction_count,
            reaction_types: statsResult.rows[0].reaction_types
        });

        await logActivity(req, 'ADD_COMMENT_REACTION', 'comment_reactions', id, null, req.body);

        return res.json({ success: true, message: 'Đã thả cảm xúc' });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Xóa bình luận
 */
export const deleteComment = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const user_id = req.user?.id;
        const user_role = req.user?.role;

        // Kiểm tra quyền: Chủ sở hữu hoặc SUPER_ADMIN
        const commentResult = await pool.query('SELECT user_id, commentable_type, commentable_id FROM comments WHERE id = $1', [id]);

        if (commentResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Bình luận không tồn tại' });
        }

        const comment = commentResult.rows[0];
        if (comment.user_id !== user_id && user_role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bình luận này' });
        }

        await pool.query('UPDATE comments SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

        const room = `${comment.commentable_type.toLowerCase()}-${comment.commentable_id}`;
        emitToRoom(room, 'delete_comment', { id });

        await logActivity(req, 'DELETE_COMMENT', 'comments', id);

        return res.json({ success: true, message: 'Bình luận đã được xóa' });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Lấy thống kê đánh giá (số sao trung bình và tổng số bình luận)
 */
export const getCommentStats = async (req: Request, res: Response): Promise<any> => {
    try {
        const { commentable_type, commentable_id } = req.query;

        if (!commentable_type || !commentable_id) {
            return res.status(400).json({ success: false, message: 'Thiếu thông số truy vấn' });
        }

        const result = await pool.query(`
            SELECT 
                COUNT(*) as total_count,
                AVG(rating) as avg_rating
            FROM comments
            WHERE commentable_type = $1 
                AND commentable_id = $2
                AND deleted_at IS NULL
        `, [commentable_type, commentable_id]);

        const stats = result.rows[0];

        return res.json({
            success: true,
            data: {
                total_count: parseInt(stats.total_count) || 0,
                avg_rating: stats.avg_rating ? parseFloat(parseFloat(stats.avg_rating).toFixed(1)) : 0
            }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Lấy chi tiết các người dùng đã thả cảm xúc
 */
export const getReactionDetails = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT 
                cr.reaction_type,
                pu.full_name as user_name,
                pu.avatar_id
            FROM comment_reactions cr
            LEFT JOIN public_users pu ON cr.user_id = pu.id
            WHERE cr.comment_id = $1
            ORDER BY cr.created_at DESC
        `, [id]);

        return res.json({
            success: true,
            data: result.rows
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};
