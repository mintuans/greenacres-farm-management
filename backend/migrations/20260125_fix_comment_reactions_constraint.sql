-- Migration: Fix missing unique constraint on comment_reactions
-- Date: 2026-01-25

DO $$
BEGIN
    -- Kiểm tra nếu constraint chưa tồn tại thì mới thêm
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'comment_reactions_comment_id_user_id_key'
    ) THEN
        ALTER TABLE comment_reactions 
        ADD CONSTRAINT comment_reactions_comment_id_user_id_key 
        UNIQUE (comment_id, user_id);
    END IF;
END $$;
