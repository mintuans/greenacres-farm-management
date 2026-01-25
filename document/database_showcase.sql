-- =================================================================================
-- HỆ THỐNG SHOWCASE CÔNG KHAI - GREENACRES FARM
-- Database: PostgreSQL
-- Module: Sản phẩm, Blog/Tin tức, Hình ảnh, Đánh giá & Bình luận
-- =================================================================================

-- Kích hoạt UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =================================================================================
-- PHẦN 1: QUẢN LÝ HÌNH ẢNH (Media Library)
-- =================================================================================

-- 1. Bảng lưu trữ hình ảnh tập trung (Embedded Binary Storage)
CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dữ liệu hình ảnh (Binary Storage - Portable)
    image_data BYTEA,                       -- Dữ liệu binary của ảnh (QUAN TRỌNG)
    image_name VARCHAR(255) NOT NULL,       -- Tên file gốc: 'man-hau-giang.jpg'
    image_type VARCHAR(100),                -- MIME type: 'image/jpeg', 'image/png', 'image/webp'
    
    -- Thông tin file
    file_size BIGINT,                       -- Kích thước file (bytes)
    
    -- Metadata
    alt_text VARCHAR(255),                  -- Mô tả ảnh (SEO)
    caption TEXT,                           -- Chú thích
    width INTEGER,                          -- Chiều rộng (px)
    height INTEGER,                         -- Chiều cao (px)
    
    -- Phân loại
    category VARCHAR(50),                   -- 'product', 'blog', 'gallery', 'avatar'
    
    -- Audit
    uploaded_by UUID,                       -- ID người upload (nếu có hệ thống user)
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT TRUE,         -- Công khai hay riêng tư
    
    -- Soft delete
    deleted_at TIMESTAMP
);



-- =================================================================================
-- PHẦN 2: QUẢN LÝ SẢN PHẨM (Products)
-- =================================================================================

-- 2. Danh mục sản phẩm
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(50) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,      -- URL-friendly: 'trai-cay-tuoi'
    description TEXT,
    parent_id UUID REFERENCES product_categories(id), -- Hỗ trợ danh mục con
    
    -- Hình ảnh đại diện
    thumbnail_id UUID REFERENCES media_files(id),
    
    -- Thứ tự hiển thị
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng sản phẩm chính
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Thông tin cơ bản
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,      -- 'man-hau-giang-organic'
    
    -- Phân loại
    category_id UUID REFERENCES product_categories(id),
    
    -- Mô tả
    short_description TEXT,                 -- Mô tả ngắn (1-2 câu)
    full_description TEXT,                  -- Mô tả đầy đủ (HTML/Markdown)
    
    -- Giá cả
    price DECIMAL(15, 2) NOT NULL,
    original_price DECIMAL(15, 2),          -- Giá gốc (để hiển thị giảm giá)
    currency VARCHAR(10) DEFAULT 'VND',
    
    -- Kho hàng
    stock_quantity DECIMAL(12, 2) DEFAULT 0,
    unit_of_measure VARCHAR(50),            -- 'Kg', 'Hộp', 'Túi'
    
    -- Hình ảnh
    thumbnail_id UUID REFERENCES media_files(id),
    
    -- Trạng thái
    status VARCHAR(50) DEFAULT 'DRAFT',     -- 'DRAFT', 'PUBLISHED', 'OUT_OF_STOCK'
    is_featured BOOLEAN DEFAULT FALSE,      -- Sản phẩm nổi bật
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    
    -- Thống kê
    view_count INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 4. Bảng liên kết sản phẩm - hình ảnh (nhiều ảnh cho 1 sản phẩm)
CREATE TABLE product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    media_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
    
    display_order INTEGER DEFAULT 0,        -- Thứ tự hiển thị
    is_primary BOOLEAN DEFAULT FALSE,       -- Ảnh chính
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- =================================================================================
-- PHẦN 3: QUẢN LÝ BLOG/TIN TỨC (Blog Posts)
-- =================================================================================

-- 6. Danh mục blog
CREATE TABLE blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(50) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bảng bài viết blog
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Thông tin cơ bản
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    
    -- Phân loại
    category_id UUID REFERENCES blog_categories(id),
    
    -- Nội dung
    excerpt TEXT,                           -- Tóm tắt
    content TEXT NOT NULL,                  -- Nội dung đầy đủ (HTML/Markdown)
    
    -- Hình ảnh
    featured_image_id UUID REFERENCES media_files(id),
    
    -- Tác giả
    author_name VARCHAR(100),
    author_id UUID,                         -- Link tới bảng users (nếu có)
    
    -- Trạng thái
    status VARCHAR(50) DEFAULT 'DRAFT',     -- 'DRAFT', 'PUBLISHED', 'ARCHIVED'
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    
    -- Thống kê
    view_count INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 8. Tags cho blog (nhiều-nhiều)
CREATE TABLE blog_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Bảng liên kết blog - tags
CREATE TABLE blog_post_tags (
    blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
    
    PRIMARY KEY (blog_post_id, tag_id)
);

-- =================================================================================
-- PHẦN 4: HỆ THỐNG NGƯỜI DÙNG CÔNG KHAI (Visitors/Customers)
-- =================================================================================

-- 10. Bảng người dùng/khách hàng công khai
CREATE TABLE public_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Thông tin đăng nhập
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),             -- Mã hóa bcrypt
    
    -- Thông tin cá nhân
    full_name VARCHAR(100),
    avatar_id UUID REFERENCES media_files(id),
    
    -- Đăng nhập mạng xã hội
    google_id VARCHAR(255) UNIQUE,
    facebook_id VARCHAR(255) UNIQUE,
    
    -- Trạng thái
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    login_attempts INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 11. Bảng phiên đăng nhập (Sessions) - Tùy chọn
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public_users(id) ON DELETE CASCADE,
    
    token VARCHAR(500) UNIQUE NOT NULL,     -- JWT token hoặc session token
    ip_address VARCHAR(50),
    user_agent TEXT,
    
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
-- PHẦN 5: HỆ THỐNG ĐÁNH GIÁ & BÌNH LUẬN (Reviews & Comments)
-- =================================================================================

-- 12. Bảng đánh giá sản phẩm
CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    -- Người đánh giá
    user_id UUID REFERENCES public_users(id),
    reviewer_name VARCHAR(100),             -- Tên hiển thị (nếu không đăng nhập)
    reviewer_email VARCHAR(255),            -- Email (nếu không đăng nhập)
    
    -- Nội dung đánh giá
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 1-5 sao
    title VARCHAR(255),                     -- Tiêu đề đánh giá
    content TEXT,                           -- Nội dung chi tiết
    
    -- Hình ảnh đính kèm
    images JSONB,                           -- Array các media_id: ["uuid1", "uuid2"]
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 13. Bảng bình luận (Sửa UUID thành VARCHAR cho commentable_id)
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Liên kết đến đối tượng được bình luận
    commentable_type VARCHAR(50) NOT NULL,  -- 'FARM', 'PRODUCT', 'BLOG'
    commentable_id VARCHAR(255) NOT NULL,   -- Chuyển sang VARCHAR để nhận 'farm-001'
    
    -- Người bình luận
    user_id UUID REFERENCES public_users(id),
    commenter_name VARCHAR(100),            
    commenter_email VARCHAR(255),           
    
    -- Nội dung
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    -- Hệ thống trả lời bình luận (nested comments)
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, 
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
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
-- 14. Bảng cảm xúc/reactions
CREATE TABLE comment_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    
    user_id UUID REFERENCES public_users(id),
    session_id VARCHAR(255),                
    
    reaction_type VARCHAR(50) NOT NULL,     
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Sửa UNIQUE để xử lý trường hợp user_id có thể NULL (khách vãng lai)
    UNIQUE(comment_id, session_id)
);
-- =================================================================================
-- PHẦN 8: TRIGGERS TỰ ĐỘNG CẬP NHẬT
-- =================================================================================

-- Trigger: Tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Áp dụng cho các bảng
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================================
-- HẾT - DATABASE SHOWCASE
-- =================================================================================
