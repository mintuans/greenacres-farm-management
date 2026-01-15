import { Request, Response } from 'express';
import pool from '../../config/database';
import { logActivity } from '../../services/audit-log.service';

/**
 * Lấy bình luận
 */
export const getComments = async (req: Request, res: Response): Promise<any> => {
    try {
        const { commentable_type, commentable_id } = req.query;

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
                ct.*,
                pu.full_name as user_name,
                (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = ct.id) as reaction_count,
                (SELECT ARRAY_AGG(DISTINCT reaction_type) FROM comment_reactions WHERE comment_id = ct.id) as reaction_types
            FROM comment_tree ct
            LEFT JOIN public_users pu ON ct.user_id = pu.id
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
        const { commentable_type, commentable_id, content, rating, parent_id, commenter_name, commenter_email } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });
        }

        const result = await pool.query(`
            INSERT INTO comments 
            (commentable_type, commentable_id, commenter_name, commenter_email, content, rating, parent_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [commentable_type, commentable_id, commenter_name, commenter_email, content, rating || 5, parent_id]);

        const comment = result.rows[0];

        await logActivity(req, 'CREATE_COMMENT', 'comments', comment.id, null, req.body);

        return res.status(201).json({
            success: true,
            message: 'Bình luận đã được đăng',
            data: comment
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Thả cảm xúc cho bình luận
 */
export const addReaction = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { reaction_type, session_id } = req.body;

        const validReactions = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
        if (!validReactions.includes(reaction_type)) {
            return res.status(400).json({ success: false, message: 'Loại cảm xúc không hợp lệ' });
        }

        await pool.query(`
            INSERT INTO comment_reactions (comment_id, session_id, reaction_type)
            VALUES ($1, $2, $3)
            ON CONFLICT (comment_id, session_id) 
            DO UPDATE SET reaction_type = $3
        `, [id, session_id, reaction_type]);

        await logActivity(req, 'ADD_COMMENT_REACTION', 'comment_reactions', id, null, req.body);

        return res.json({ success: true, message: 'Đã thả cảm xúc' });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};
