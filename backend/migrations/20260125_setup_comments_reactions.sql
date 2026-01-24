-- Migration: Setup Comments and Reactions
-- Ngày tạo: 2026-01-25
-- Mục đích: Đảm bảo bảng comments và reactions hỗ trợ định danh user, phản hồi đa cấp và cảm xúc

-- 1. Bảng comments
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    commentable_type VARCHAR(50) NOT NULL, -- 'FARM', 'PRODUCT', 'BLOG'
    commentable_id VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES public_users(id), -- Nullable for backward compatibility or guests if needed (but requirement says log in)
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    commenter_name VARCHAR(255),
    commenter_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 2. Bảng comment_reactions
CREATE TABLE IF NOT EXISTS comment_reactions (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public_users(id),
    session_id VARCHAR(255), -- Fallback for guests
    reaction_type VARCHAR(20) NOT NULL, -- 'like', 'love', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, user_id),
    UNIQUE(comment_id, session_id)
);

-- Thêm index để tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_comments_commentable ON comments(commentable_type, commentable_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id);
