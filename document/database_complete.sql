-- =================================================================================
-- HỆ THỐNG QUẢN TRỊ NÔNG NGHIỆP TỔNG HỢP (GREENACRES FARM ERP)
-- Database: PostgreSQL
-- File: database_complete.sql
-- Mô tả: File SQL tổng hợp chứa toàn bộ schema, triggers và functions
-- Ngày tạo: 2026-02-01
-- =================================================================================

-- 1. KÍCH HOẠT CÁC EXTENSION CẦN THIẾT
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =================================================================================
-- PHẦN 1: QUẢN LÝ HÌNH ẢNH (Media Library)
-- =================================================================================

-- Bảng lưu trữ hình ảnh tập trung (Embedded Binary Storage)
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
-- PHẦN 2: HỆ THỐNG NGƯỜI DÙNG CÔNG KHAI (Public Users)
-- =================================================================================

-- Bảng người dùng/khách hàng công khai
CREATE TABLE public_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Thông tin đăng nhập
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),             -- Mã hóa bcrypt
    
    -- Thông tin cá nhân
    full_name VARCHAR(100),
    avatar_id UUID REFERENCES media_files(id),
    bio TEXT,
    address TEXT,
    
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

-- Bảng phiên đăng nhập (Sessions)
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
-- PHẦN 3: HỆ THỐNG PHÂN QUYỀN (RBAC)
-- =================================================================================

-- Bảng Nhóm quyền (Roles)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,        -- Mã nhóm (VD: admin, customer_support)
    description VARCHAR(255),                -- Tên hiển thị (VD: Quản trị viên)
    is_system BOOLEAN DEFAULT FALSE,         -- Nếu TRUE thì không được xóa
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Danh sách Quyền (Permissions)
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module VARCHAR(50),                      -- Nhóm chức năng (VD: User, Product, Order)
    action VARCHAR(50),                      -- Hành động (VD: create, read, update, delete)
    code VARCHAR(100) UNIQUE NOT NULL,       -- Mã quyền duy nhất (VD: user.create)
    description VARCHAR(255),                -- Mô tả
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Liên kết Nhóm quyền - Quyền
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Bảng Liên kết Người dùng - Nhóm quyền
CREATE TABLE user_roles (
    user_id UUID REFERENCES public_users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- Bảng Nhật ký hệ thống (Audit Logs)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public_users(id) ON DELETE SET NULL,
    action VARCHAR(50),
    entity_table VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
-- PHẦN 4: QUẢN LÝ ĐỐI TÁC & CẤU HÌNH CƠ BẢN
-- =================================================================================

-- Quản lý Đối tác (Đại lý, Thương lái, Người làm thuê)
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_code VARCHAR(20) UNIQUE NOT NULL,
    partner_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('SUPPLIER', 'BUYER', 'WORKER')),
    phone VARCHAR(20),
    address TEXT,
    current_balance DECIMAL(15, 2) DEFAULT 0,
    thumbnail_id UUID REFERENCES media_files(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quản lý Đơn vị Sản xuất (Vị trí vật lý)
CREATE TABLE production_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_code VARCHAR(20) UNIQUE NOT NULL,
    unit_name VARCHAR(100) NOT NULL,
    type VARCHAR(50), -- 'CROP', 'LIVESTOCK'    
    area_size DECIMAL(10, 2),
    description TEXT
);

-- Quản lý Mùa vụ / Lứa nuôi
CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES production_units(id),
    season_code VARCHAR(50) UNIQUE NOT NULL,
    season_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    expected_revenue DECIMAL(15, 2),
    thumbnail_id UUID REFERENCES media_files(id)
);

-- Danh mục Hạng mục Thu/Chi
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(50) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES categories(id),
    scope VARCHAR(50) NOT NULL CHECK (scope IN ('FARM', 'PERSONAL', 'BOTH')),
    thumbnail_id UUID REFERENCES media_files(id)
);

-- =================================================================================
-- PHẦN 5: QUẢN LÝ TÀI CHÍNH & KHO VẬN
-- =================================================================================

-- Bảng Hóa đơn & Giao dịch chính (Dòng tiền)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id),
    season_id UUID REFERENCES seasons(id),
    category_id UUID REFERENCES categories(id),
    
    amount DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    
    type VARCHAR(20) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    is_inventory_affected BOOLEAN DEFAULT FALSE,
    
    -- Chi tiết bổ sung cho mận/hàng hóa
    quantity DECIMAL(15, 2),
    unit VARCHAR(50),
    unit_price DECIMAL(15, 2)
);

-- Bảng Chi tiết Thanh toán Nợ (Trả dần)
CREATE TABLE debt_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    amount_paid DECIMAL(15, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT
);

-- Quản lý Kho vật tư
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_code VARCHAR(50) UNIQUE NOT NULL, 
    inventory_name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id),
    unit_of_measure VARCHAR(50),
    sku VARCHAR(100) UNIQUE,
    stock_quantity DECIMAL(12, 2) DEFAULT 0,
    min_stock_level DECIMAL(12, 2) DEFAULT 0,
    last_import_price DECIMAL(15, 2) DEFAULT 0,
    import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    thumbnail_id UUID REFERENCES media_files(id),
    note TEXT
);

-- Nhật ký Xuất kho (Sử dụng vật tư)
CREATE TABLE inventory_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES inventory(id),
    season_id UUID REFERENCES seasons(id),
    unit_id UUID REFERENCES production_units(id),
    
    quantity DECIMAL(12, 2) NOT NULL,
    purpose TEXT,
    usage_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- =================================================================================
-- PHẦN 6: QUẢN LÝ NHÂN SỰ & CHẤM CÔNG
-- =================================================================================

-- Bảng Ca làm việc
CREATE TABLE work_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_code VARCHAR(20) UNIQUE NOT NULL,
    shift_name VARCHAR(50) NOT NULL,
    start_time TIME,
    end_time TIME
);

-- Bảng Loại công việc & Đơn giá
CREATE TABLE job_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_code VARCHAR(20) UNIQUE NOT NULL,
    job_name VARCHAR(255) NOT NULL,
    base_rate DECIMAL(15, 2) DEFAULT 0,
    description TEXT
);

-- Bảng Phiếu Lương / Đợt Thanh Toán
CREATE TABLE payrolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_code VARCHAR(50) UNIQUE NOT NULL,
    partner_id UUID REFERENCES partners(id) NOT NULL,
    
    total_amount DECIMAL(15, 2) DEFAULT 0,
    bonus DECIMAL(15, 2) DEFAULT 0,
    deductions DECIMAL(15, 2) DEFAULT 0,
    final_amount DECIMAL(15, 2) NOT NULL,
    
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'PAID', 'CANCELLED')),
    
    transaction_id UUID REFERENCES transactions(id),
    
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- Bảng Lịch làm việc (Kế hoạch)
CREATE TABLE work_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id),
    shift_id UUID REFERENCES work_shifts(id),
    job_type_id UUID REFERENCES job_types(id),
    
    work_date DATE NOT NULL,
    
    status VARCHAR(20) DEFAULT 'PLANNED',
    note TEXT,
    
    season_id UUID REFERENCES seasons(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Nhật ký Công việc Hàng ngày (Daily Logs)
CREATE TABLE daily_work_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) NOT NULL,
    payroll_id UUID REFERENCES payrolls(id),
    
    season_id UUID REFERENCES seasons(id), 
    unit_id UUID REFERENCES production_units(id), 
    schedule_id UUID REFERENCES work_schedules(id),

    work_date DATE NOT NULL,
    shift_id UUID REFERENCES work_shifts(id),
    job_type_id UUID REFERENCES job_types(id) NOT NULL,
    
    quantity DECIMAL(12, 2) DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'DAY',
    
    applied_rate DECIMAL(15, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    
    mandays INT DEFAULT 0,
    
    note TEXT,
    status VARCHAR(20) DEFAULT 'DONE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
-- PHẦN 7: QUẢN LÝ SỰ KIỆN & LỊCH TRÌNH
-- =================================================================================

-- Bảng Sự kiện Nông trại (Farm Events)
CREATE TABLE farm_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    
    event_type VARCHAR(50) CHECK (event_type IN ('HARVEST', 'ISSUE', 'TASK', 'OTHER')),
    
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    is_all_day BOOLEAN DEFAULT TRUE,
    
    description TEXT,
    
    season_id UUID REFERENCES seasons(id),
    unit_id UUID REFERENCES production_units(id)
);

-- Bảng Tổng hợp Lịch trình (Consolidated Schedules)
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    source_type VARCHAR(50) NOT NULL,
    source_id UUID NOT NULL,
    
    title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    
    status VARCHAR(20),
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
-- PHẦN 8: QUẢN LÝ KHO LÝ (Gia dụng, Điện tử, Hoa kiểng)
-- =================================================================================

-- Loại Kho (Phân loại kho vật lý)
CREATE TABLE warehouse_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_code VARCHAR(20) UNIQUE NOT NULL,
    warehouse_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Danh mục vật phẩm trong Kho
CREATE TABLE warehouse_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_type_id UUID REFERENCES warehouse_types(id) NOT NULL,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE,
    item_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(12, 2) DEFAULT 0,
    unit VARCHAR(50),
    price DECIMAL(15, 2) DEFAULT 0,
    location VARCHAR(255),
    thumbnail_id UUID REFERENCES media_files(id),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nhật ký Nhập/Xuất Kho
CREATE TABLE warehouse_item_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES warehouse_items(id) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('CHECK_IN', 'CHECK_OUT')),
    quantity DECIMAL(12, 2) NOT NULL,
    price DECIMAL(15, 2),
    partner_id UUID REFERENCES partners(id),
    sku_scanned VARCHAR(100),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- =================================================================================
-- PHẦN 9: SHOWCASE - QUẢN LÝ KHÁCH MỜI & SỰ KIỆN
-- =================================================================================

-- Quản lý Khách mời (Guests)
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    default_title VARCHAR(255),
    avatar_id UUID REFERENCES media_files(id),
    phone VARCHAR(20),
    email VARCHAR(255),
    user_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quản lý Sự kiện (Showcase Events)
CREATE TABLE showcase_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    banner_id UUID REFERENCES media_files(id),
    event_date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ENDED')),
    gallery_ids JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quản lý Người tham gia Sự kiện (Participants)
CREATE TABLE showcase_event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES showcase_events(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
    role_at_event VARCHAR(255),
    color_theme VARCHAR(50) DEFAULT 'green',
    is_vip BOOLEAN DEFAULT FALSE,
    can_upload_gallery BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
-- PHẦN 10: SHOWCASE - SẢN PHẨM & BLOG
-- =================================================================================

-- Danh mục sản phẩm
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(50) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES product_categories(id),
    thumbnail_id UUID REFERENCES media_files(id),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng sản phẩm chính
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    
    category_id UUID REFERENCES product_categories(id),
    
    short_description TEXT,
    full_description TEXT,
    
    price DECIMAL(15, 2) NOT NULL,
    original_price DECIMAL(15, 2),
    currency VARCHAR(10) DEFAULT 'VND',
    
    stock_quantity DECIMAL(12, 2) DEFAULT 0,
    unit_of_measure VARCHAR(50),
    
    thumbnail_id UUID REFERENCES media_files(id),
    
    status VARCHAR(50) DEFAULT 'DRAFT',
    is_featured BOOLEAN DEFAULT FALSE,
    
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    
    view_count INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Bảng liên kết sản phẩm - hình ảnh
CREATE TABLE product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    media_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Danh mục blog
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

-- Bảng bài viết blog
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    
    category_id UUID REFERENCES blog_categories(id),
    
    excerpt TEXT,
    content TEXT NOT NULL,
    
    featured_image_id UUID REFERENCES media_files(id),
    
    author_name VARCHAR(100),
    author_id UUID,
    
    status VARCHAR(50) DEFAULT 'DRAFT',
    
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    
    view_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Tags cho blog
CREATE TABLE blog_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng liên kết blog - tags
CREATE TABLE blog_post_tags (
    blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (blog_post_id, tag_id)
);

-- =================================================================================
-- PHẦN 11: ĐÁNH GIÁ & BÌNH LUẬN
-- =================================================================================

-- Bảng đánh giá sản phẩm
CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    user_id UUID REFERENCES public_users(id),
    reviewer_name VARCHAR(100),
    reviewer_email VARCHAR(255),
    
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    
    images JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Bảng bình luận
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    commentable_type VARCHAR(50) NOT NULL,
    commentable_id VARCHAR(255) NOT NULL,
    
    user_id UUID REFERENCES public_users(id),
    commenter_name VARCHAR(100),
    commenter_email VARCHAR(255),
    
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Bảng cảm xúc/reactions
CREATE TABLE comment_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    
    user_id UUID REFERENCES public_users(id),
    session_id VARCHAR(255),
    
    reaction_type VARCHAR(50) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(comment_id, session_id)
);

-- =================================================================================
-- PHẦN 12: HỆ THỐNG THÔNG BÁO
-- =================================================================================

-- Bảng Thông báo (Notifications)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO' CHECK (type IN ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'ALERT')),
    category VARCHAR(50) DEFAULT 'SYSTEM',
    
    link VARCHAR(255),
    metadata JSONB,
    
    sender_id UUID REFERENCES public_users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Bảng Nhận thông báo (Notification Recipients)
CREATE TABLE notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    
    user_id UUID NOT NULL REFERENCES public_users(id) ON DELETE CASCADE,
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    is_important BOOLEAN DEFAULT FALSE,
    
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Cấu hình thông báo người dùng
CREATE TABLE user_notification_settings (
    user_id UUID PRIMARY KEY REFERENCES public_users(id) ON DELETE CASCADE,
    enable_email BOOLEAN DEFAULT TRUE,
    enable_push BOOLEAN DEFAULT TRUE,
    enable_sms BOOLEAN DEFAULT FALSE,
    muted_categories TEXT[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Lời chúc sự kiện
CREATE TABLE showcase_event_greetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES showcase_events(id) ON DELETE CASCADE,
    public_user_id UUID NOT NULL REFERENCES public_users(id) ON DELETE CASCADE,
    greeting_message TEXT NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, public_user_id)
);

-- =================================================================================
-- PHẦN 13: VIEWS
-- =================================================================================

-- VIEW: Tổng hợp Lịch trình từ nhiều nguồn
CREATE OR REPLACE VIEW view_daily_schedules AS
-- 1. Lấy dữ liệu từ bảng Kế hoạch làm việc
SELECT 
    ws.id AS event_id,
    'WORK_SHIFT'::VARCHAR(50) AS event_type,
    (p.partner_name || ' - ' || j.job_name)::TEXT AS title,
    ws.work_date AS event_date,
    s.start_time,
    s.end_time,
    ws.status,
    ws.note AS description,
    '#13ec49'::VARCHAR(20) AS display_color,
    ws.partner_id,
    ws.season_id,
    p.partner_name,
    j.job_name,
    s.shift_name
FROM work_schedules ws
JOIN partners p ON ws.partner_id = p.id
JOIN work_shifts s ON ws.shift_id = s.id
JOIN job_types j ON ws.job_type_id = j.id
WHERE ws.status = 'DONE'

UNION ALL

-- 2. Lấy dữ liệu từ bảng Sự kiện nông trại
SELECT 
    fe.id AS event_id,
    'FARM_EVENT'::VARCHAR(50) AS event_type,
    fe.title::TEXT,
    fe.start_time::DATE AS event_date,
    fe.start_time::TIME AS start_time,
    fe.end_time::TIME AS end_time,
    'CONFIRMED'::VARCHAR(20) AS status,
    fe.description,
    CASE 
        WHEN fe.event_type = 'HARVEST' THEN '#fbbf24'
        WHEN fe.event_type = 'ISSUE' THEN '#ef4444'
        WHEN fe.event_type = 'TASK' THEN '#10b981'
        ELSE '#3b82f6'
    END AS display_color,
    NULL::UUID AS partner_id,
    fe.season_id,
    NULL::VARCHAR AS partner_name,
    NULL::VARCHAR AS job_name,
    NULL::VARCHAR AS shift_name
FROM farm_events fe;

-- =================================================================================
-- PHẦN 14: TRIGGERS
-- =================================================================================

-- Trigger: Tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Áp dụng trigger cho các bảng
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_showcase_events_updated_at BEFORE UPDATE ON showcase_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_showcase_event_greetings_updated_at 
BEFORE UPDATE ON showcase_event_greetings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================================
-- PHẦN 15: STORED FUNCTIONS - CHẤM CÔNG & LƯƠNG
-- =================================================================================

-- 1. Chuyển từ Lịch làm việc sang Nhật ký công việc (Daily Log)
CREATE OR REPLACE FUNCTION confirm_schedule_to_log(p_schedule_id UUID, p_mandays INT DEFAULT 0)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_rate DECIMAL(15, 2);
    v_status VARCHAR(20);
BEGIN
    -- Lấy đơn giá và trạng thái hiện tại
    SELECT 
        COALESCE(jt.base_rate, 0),
        CASE 
            WHEN ws.status = 'PLANNED' THEN 'INPROGRESS'
            WHEN ws.status = 'CONFIRMED' THEN 'DONE'
            WHEN ws.status = 'CANCELLED' THEN 'CANCELLED'
            ELSE 'INPROGRESS'
        END
    INTO v_rate, v_status
    FROM work_schedules ws
    LEFT JOIN job_types jt ON ws.job_type_id = jt.id
    WHERE ws.id = p_schedule_id;

    -- Kiểm tra xem đã có log chưa
    SELECT id INTO v_log_id FROM daily_work_logs WHERE schedule_id = p_schedule_id;

    IF v_log_id IS NOT NULL THEN
        -- Cập nhật log hiện có
        UPDATE daily_work_logs SET
            applied_rate = v_rate,
            mandays = p_mandays,
            total_amount = CASE 
                WHEN p_mandays = 1 THEN v_rate * 0.5 
                ELSE v_rate 
            END,
            status = 'DONE'
        WHERE id = v_log_id;
        
        UPDATE work_schedules SET status = 'CONFIRMED' WHERE id = p_schedule_id;
    ELSE
        -- Chèn mới nếu chưa có
        INSERT INTO daily_work_logs (
            partner_id, schedule_id, work_date, shift_id, job_type_id, 
            applied_rate, mandays, quantity, total_amount, season_id, status
        )
        SELECT 
            partner_id, id, work_date, shift_id, job_type_id, 
            v_rate, p_mandays, 1.0,
            CASE WHEN p_mandays = 1 THEN v_rate * 0.5 ELSE v_rate END,
            season_id, 'DONE'
        FROM work_schedules
        WHERE id = p_schedule_id
        RETURNING id INTO v_log_id;

        UPDATE work_schedules SET status = 'CONFIRMED' WHERE id = p_schedule_id;
    END IF;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Tính lương và tạo Phiếu lương từ Nhật ký công việc
CREATE OR REPLACE FUNCTION calculate_payroll_from_log(p_log_id UUID)
RETURNS UUID AS $$
DECLARE
    v_payroll_id UUID;
    v_payroll_code VARCHAR(50);
    v_log_record RECORD;
BEGIN
    SELECT * INTO v_log_record FROM daily_work_logs WHERE id = p_log_id;
    
    IF v_log_record.payroll_id IS NOT NULL THEN
        RETURN v_log_record.payroll_id;
    END IF;

    v_payroll_code := 'PL-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || floor(random() * 9000 + 1000)::text;

    INSERT INTO payrolls (
        payroll_code,
        partner_id,
        total_amount,
        final_amount,
        status
    )
    VALUES (
        v_payroll_code,
        v_log_record.partner_id,
        v_log_record.total_amount,
        v_log_record.total_amount,
        'DRAFT'
    )
    RETURNING id INTO v_payroll_id;

    UPDATE daily_work_logs 
    SET payroll_id = v_payroll_id 
    WHERE id = p_log_id;

    RETURN v_payroll_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Tính lương gộp cho nhiều bản ghi Nhật ký công việc
CREATE OR REPLACE FUNCTION calculate_payroll_bulk(p_log_ids UUID[])
RETURNS UUID AS $$
DECLARE
    v_payroll_id UUID;
    v_payroll_code VARCHAR(50);
    v_total_amount DECIMAL(15, 2);
    v_partner_id UUID;
BEGIN
    SELECT partner_id INTO v_partner_id
    FROM daily_work_logs
    WHERE id = ANY(p_log_ids)
    GROUP BY partner_id
    HAVING COUNT(DISTINCT partner_id) = 1;

    IF v_partner_id IS NULL THEN
        RAISE EXCEPTION 'Tất cả các ngày công phải thuộc cùng một nhân viên để gộp phiếu lương.';
    END IF;

    SELECT SUM(total_amount) INTO v_total_amount
    FROM daily_work_logs
    WHERE id = ANY(p_log_ids) AND payroll_id IS NULL;

    IF v_total_amount IS NULL OR v_total_amount = 0 THEN
        RAISE EXCEPTION 'Không có dữ liệu hợp lệ hoặc các ngày công đã được tính lương.';
    END IF;

    v_payroll_code := 'PL-GOP-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || floor(random() * 9000 + 1000)::text;

    INSERT INTO payrolls (
        payroll_code,
        partner_id,
        total_amount,
        final_amount,
        status
    )
    VALUES (
        v_payroll_code,
        v_partner_id,
        v_total_amount,
        v_total_amount,
        'DRAFT'
    )
    RETURNING id INTO v_payroll_id;

    UPDATE daily_work_logs 
    SET payroll_id = v_payroll_id 
    WHERE id = ANY(p_log_ids);

    RETURN v_payroll_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger tự động đồng bộ Log khi tạo/sửa/xóa lịch làm việc
CREATE OR REPLACE FUNCTION trg_sync_schedule_to_log()
RETURNS TRIGGER AS $$
DECLARE
    v_log_status VARCHAR(20);
    v_rate DECIMAL(15, 2);
BEGIN
    IF (TG_OP = 'DELETE') THEN
        UPDATE daily_work_logs 
        SET status = 'REJECTED', schedule_id = NULL 
        WHERE schedule_id = OLD.id;
        RETURN OLD;
    END IF;

    v_log_status := CASE 
        WHEN NEW.status = 'PLANNED' THEN 'INPROGRESS'
        WHEN NEW.status = 'CONFIRMED' THEN 'DONE'
        WHEN NEW.status = 'CANCELLED' THEN 'CANCELLED'
        ELSE 'INPROGRESS'
    END;

    SELECT COALESCE(jt.base_rate, 0) INTO v_rate
    FROM job_types jt
    WHERE jt.id = NEW.job_type_id;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO daily_work_logs (
            partner_id, schedule_id, work_date, shift_id, job_type_id, 
            applied_rate, mandays, quantity, total_amount, season_id, status
        )
        VALUES (
            NEW.partner_id, NEW.id, NEW.work_date, NEW.shift_id, NEW.job_type_id,
            v_rate, 0, 1.0, v_rate, NEW.season_id, v_log_status
        );
    ELSIF (TG_OP = 'UPDATE') THEN
        IF EXISTS (SELECT 1 FROM daily_work_logs WHERE schedule_id = NEW.id) THEN
            UPDATE daily_work_logs SET
                work_date = NEW.work_date,
                shift_id = NEW.shift_id,
                job_type_id = NEW.job_type_id,
                applied_rate = v_rate,
                total_amount = CASE 
                    WHEN mandays = 1 THEN v_rate * 0.5 
                    ELSE v_rate 
                END,
                season_id = NEW.season_id,
                status = v_log_status
            WHERE schedule_id = NEW.id;
        ELSE
            INSERT INTO daily_work_logs (
                partner_id, schedule_id, work_date, shift_id, job_type_id, 
                applied_rate, mandays, quantity, total_amount, season_id, status
            )
            VALUES (
                NEW.partner_id, NEW.id, NEW.work_date, NEW.shift_id, NEW.job_type_id,
                v_rate, 0, 1.0, v_rate, NEW.season_id, v_log_status
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS work_schedule_auto_log_trigger ON work_schedules;
CREATE TRIGGER work_schedule_auto_log_trigger
AFTER INSERT OR UPDATE OR DELETE ON work_schedules
FOR EACH ROW
EXECUTE FUNCTION trg_sync_schedule_to_log();

-- =================================================================================
-- PHẦN 16: STORED FUNCTIONS - TÀI CHÍNH
-- =================================================================================

-- 1. Hàm cập nhật số dư khi có Giao dịch (Transaction)
CREATE OR REPLACE FUNCTION trg_update_partner_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.type = 'EXPENSE') THEN
            UPDATE partners SET current_balance = current_balance - NEW.amount WHERE id = NEW.partner_id;
        ELSIF (NEW.type = 'INCOME') THEN
            UPDATE partners SET current_balance = current_balance + NEW.amount WHERE id = NEW.partner_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.type = 'EXPENSE') THEN
            UPDATE partners SET current_balance = current_balance + OLD.amount WHERE id = OLD.partner_id;
        ELSIF (OLD.type = 'INCOME') THEN
            UPDATE partners SET current_balance = current_balance - OLD.amount WHERE id = OLD.partner_id;
        END IF;
        IF (NEW.type = 'EXPENSE') THEN
            UPDATE partners SET current_balance = current_balance - NEW.amount WHERE id = NEW.partner_id;
        ELSIF (NEW.type = 'INCOME') THEN
            UPDATE partners SET current_balance = current_balance + NEW.amount WHERE id = NEW.partner_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.type = 'EXPENSE') THEN
            UPDATE partners SET current_balance = current_balance + OLD.amount WHERE id = OLD.partner_id;
        ELSIF (OLD.type = 'INCOME') THEN
            UPDATE partners SET current_balance = current_balance - OLD.amount WHERE id = OLD.partner_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_transaction_balance_sync ON transactions;
CREATE TRIGGER trg_transaction_balance_sync
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION trg_update_partner_balance_on_transaction();

-- 2. Hàm lấy danh sách giao dịch theo tháng/năm
CREATE OR REPLACE FUNCTION get_transactions_by_month(
    p_month integer,
    p_year integer,
    p_season_id uuid default null
)
RETURNS TABLE (
    id uuid,
    partner_id uuid,
    season_id uuid,
    category_id uuid,
    amount numeric,
    paid_amount numeric,
    type varchar,
    transaction_date timestamp with time zone,
    note text,
    is_inventory_affected boolean,
    quantity numeric,
    unit varchar,
    unit_price numeric,
    partner_name varchar,
    category_name varchar,
    category_code varchar,
    season_name varchar
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.partner_id, t.season_id, t.category_id, t.amount, t.paid_amount, 
           t.type::varchar, t.transaction_date, t.note, t.is_inventory_affected,
           t.quantity, t.unit, t.unit_price,
           p.partner_name, c.category_name, c.category_code, s.season_name
    FROM transactions t
    LEFT JOIN partners p ON t.partner_id = p.id
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN seasons s ON t.season_id = s.id
    WHERE EXTRACT(MONTH FROM t.transaction_date) = p_month
      AND EXTRACT(YEAR FROM t.transaction_date) = p_year
      AND (p_season_id IS NULL OR t.season_id = p_season_id)
    ORDER BY t.transaction_date DESC;
END;
$$ LANGUAGE plpgsql;

-- 3. Tự động tạo Transaction khi trả lương (Payroll)
CREATE OR REPLACE FUNCTION trg_auto_create_transaction_on_payroll()
RETURNS TRIGGER AS $$
DECLARE
    v_transaction_id UUID;
    v_category_id UUID;
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'PAID') OR 
       (TG_OP = 'UPDATE' AND OLD.status <> 'PAID' AND NEW.status = 'PAID') THEN
        
        IF NEW.transaction_id IS NULL THEN
            
            SELECT id INTO v_category_id 
            FROM categories 
            WHERE category_code = 'CAT-LUONG' 
            LIMIT 1;
            
            INSERT INTO transactions (
                partner_id,
                season_id,
                category_id,
                amount,
                paid_amount,
                type,
                transaction_date,
                note,
                is_inventory_affected
            ) VALUES (
                NEW.partner_id,
                NULL,
                v_category_id,
                NEW.final_amount,
                NEW.final_amount,
                'EXPENSE',
                COALESCE(NEW.payment_date, CURRENT_TIMESTAMP),
                'Thanh toán lương - Phiếu lương: ' || NEW.payroll_code,
                FALSE
            )
            RETURNING id INTO v_transaction_id;
            
            UPDATE payrolls 
            SET transaction_id = v_transaction_id,
                payment_date = COALESCE(NEW.payment_date, CURRENT_TIMESTAMP)
            WHERE id = NEW.id;
            
        END IF;
    END IF;
    
    IF (TG_OP = 'UPDATE' AND OLD.status = 'PAID' AND NEW.status = 'CANCELLED') THEN
        IF NEW.transaction_id IS NOT NULL THEN
            DELETE FROM transactions WHERE id = NEW.transaction_id;
            UPDATE payrolls SET transaction_id = NULL WHERE id = NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payroll_auto_transaction_trigger ON payrolls;
CREATE TRIGGER payroll_auto_transaction_trigger
AFTER INSERT OR UPDATE ON payrolls
FOR EACH ROW
EXECUTE FUNCTION trg_auto_create_transaction_on_payroll();

-- =================================================================================
-- PHẦN 17: STORED FUNCTIONS - DASHBOARD & THỐNG KÊ
-- =================================================================================

-- 1. Lấy thống kê tổng quan Dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats(
    p_start_date DATE DEFAULT NULL, 
    p_end_date DATE DEFAULT NULL,
    p_season_id UUID DEFAULT NULL
)
RETURNS TABLE (
    total_income NUMERIC,
    total_expense NUMERIC,
    net_profit NUMERIC,
    total_season_investment NUMERIC,
    income_growth_rate NUMERIC,
    expense_growth_rate NUMERIC,
    active_seasons_count BIGINT,
    total_workers BIGINT
) AS $$
DECLARE
    v_start_date DATE := COALESCE(p_start_date, date_trunc('month', CURRENT_DATE)::DATE);
    v_end_date DATE := COALESCE(p_end_date, (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::DATE);
    v_prev_start_date DATE := (v_start_date - interval '1 month')::DATE;
    v_prev_end_date DATE := (v_start_date - interval '1 day')::DATE;
    
    v_curr_income NUMERIC;
    v_curr_expense NUMERIC;
    v_prev_income NUMERIC;
    v_prev_expense NUMERIC;
    v_total_season_investment NUMERIC;
BEGIN
    IF p_season_id IS NOT NULL THEN
        SELECT COALESCE(SUM(amount), 0) INTO v_curr_income 
        FROM transactions 
        WHERE type = 'INCOME' AND season_id = p_season_id;
        
        SELECT COALESCE(SUM(amount), 0) INTO v_curr_expense 
        FROM transactions 
        WHERE type = 'EXPENSE' AND season_id = p_season_id;

        v_total_season_investment := v_curr_expense;
        
        v_prev_income := 0;
        v_prev_expense := 0;
    ELSE
        SELECT COALESCE(SUM(amount), 0) INTO v_curr_income 
        FROM transactions 
        WHERE type = 'INCOME' AND transaction_date BETWEEN v_start_date AND v_end_date;
        
        SELECT COALESCE(SUM(amount), 0) INTO v_curr_expense 
        FROM transactions 
        WHERE type = 'EXPENSE' AND transaction_date BETWEEN v_start_date AND v_end_date;
        
        SELECT COALESCE(SUM(amount), 0) INTO v_prev_income 
        FROM transactions 
        WHERE type = 'INCOME' AND transaction_date BETWEEN v_prev_start_date AND v_prev_end_date;
        
        SELECT COALESCE(SUM(amount), 0) INTO v_prev_expense 
        FROM transactions 
        WHERE type = 'EXPENSE' AND transaction_date BETWEEN v_prev_start_date AND v_prev_end_date;

        SELECT COALESCE(SUM(t.amount), 0) INTO v_total_season_investment
        FROM transactions t
        JOIN seasons s ON t.season_id = s.id
        WHERE s.status = 'ACTIVE' AND t.type = 'EXPENSE';
    END IF;
    
    RETURN QUERY
    SELECT 
        v_curr_income,
        v_curr_expense,
        v_curr_income - v_curr_expense,
        v_total_season_investment,
        CASE WHEN v_prev_income = 0 THEN 0 ELSE ((v_curr_income - v_prev_income) / v_prev_income * 100)::NUMERIC END,
        CASE WHEN v_prev_expense = 0 THEN 0 ELSE ((v_curr_expense - v_prev_expense) / v_prev_expense * 100)::NUMERIC END,
        (SELECT COUNT(*) FROM seasons WHERE status = 'ACTIVE'),
        (SELECT COUNT(*) FROM partners WHERE type = 'WORKER')
    ;
END;
$$ LANGUAGE plpgsql;

-- 2. Lấy lịch sử dòng tiền (biểu đồ)
CREATE OR REPLACE FUNCTION get_cash_flow_history(
    p_months INT DEFAULT 6
)
RETURNS TABLE (
    month_label VARCHAR(10),
    month_number INT,
    year_number INT,
    total_income DECIMAL(15, 2),
    total_expense DECIMAL(15, 2),
    net_profit DECIMAL(15, 2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH month_series AS (
        SELECT 
            generate_series(
                DATE_TRUNC('month', CURRENT_DATE) - (p_months - 1 || ' months')::INTERVAL,
                DATE_TRUNC('month', CURRENT_DATE),
                '1 month'::INTERVAL
            )::DATE AS month_start
    ),
    monthly_transactions AS (
        SELECT 
            DATE_TRUNC('month', t.transaction_date)::DATE AS month_start,
            COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS income,
            COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS expense
        FROM transactions t
        WHERE t.transaction_date >= DATE_TRUNC('month', CURRENT_DATE) - (p_months - 1 || ' months')::INTERVAL
        GROUP BY DATE_TRUNC('month', t.transaction_date)::DATE
    )
    SELECT 
        ('Th' || EXTRACT(MONTH FROM ms.month_start)::TEXT)::VARCHAR(10) AS month_label,
        EXTRACT(MONTH FROM ms.month_start)::INT AS month_number,
        EXTRACT(YEAR FROM ms.month_start)::INT AS year_number,
        COALESCE(mt.income, 0)::DECIMAL(15, 2) AS total_income,
        COALESCE(mt.expense, 0)::DECIMAL(15, 2) AS total_expense,
        (COALESCE(mt.income, 0) - COALESCE(mt.expense, 0))::DECIMAL(15, 2) AS net_profit
    FROM month_series ms
    LEFT JOIN monthly_transactions mt ON ms.month_start = mt.month_start
    ORDER BY ms.month_start ASC;
END;
$$;

-- 3. Lấy danh sách vật tư sắp hết
CREATE OR REPLACE FUNCTION get_low_stock_items(
    p_limit INT DEFAULT 10
)
RETURNS TABLE (
    item_id UUID,
    item_code VARCHAR(50),
    item_name VARCHAR(255),
    category_name VARCHAR(100),
    current_quantity DECIMAL(12, 2),
    min_stock_level DECIMAL(12, 2),
    unit_of_measure VARCHAR(50),
    shortage_amount DECIMAL(12, 2),
    shortage_percentage DECIMAL(5, 2),
    last_import_price DECIMAL(15, 2),
    thumbnail_url TEXT,
    urgency_level VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id AS item_id,
        i.inventory_code AS item_code,
        i.inventory_name AS item_name,
        COALESCE(c.category_name, 'Chưa phân loại') AS category_name,
        i.stock_quantity AS current_quantity,
        i.min_stock_level,
        COALESCE(i.unit_of_measure, 'Đơn vị') AS unit_of_measure,
        (i.min_stock_level - i.stock_quantity) AS shortage_amount,
        CASE 
            WHEN i.min_stock_level > 0 THEN 
                ROUND(((i.min_stock_level - i.stock_quantity) / i.min_stock_level * 100)::NUMERIC, 2)
            ELSE 0
        END AS shortage_percentage,
        i.last_import_price,
        NULL::TEXT AS thumbnail_url,
        CASE 
            WHEN i.stock_quantity = 0 THEN 'CRITICAL'::VARCHAR(20)
            WHEN i.stock_quantity <= (i.min_stock_level * 0.3) THEN 'CRITICAL'::VARCHAR(20)
            WHEN i.stock_quantity <= (i.min_stock_level * 0.5) THEN 'WARNING'::VARCHAR(20)
            ELSE 'LOW'::VARCHAR(20)
        END AS urgency_level
    FROM inventory i
    LEFT JOIN categories c ON i.category_id = c.id
    WHERE i.stock_quantity <= i.min_stock_level
    ORDER BY 
        CASE 
            WHEN i.stock_quantity = 0 THEN 0
            ELSE 1
        END,
        (i.stock_quantity / NULLIF(i.min_stock_level, 0)) ASC,
        i.stock_quantity ASC
    LIMIT p_limit;
END;
$$;

-- 4. Lấy danh sách nhân viên có số dư cao nhất
CREATE OR REPLACE FUNCTION get_top_workers_by_balance(
    p_limit INT DEFAULT 10
)
RETURNS TABLE (
    worker_id UUID,
    worker_code VARCHAR(50),
    worker_name VARCHAR(255),
    current_balance DECIMAL(15, 2),
    total_paid DECIMAL(15, 2),
    balance_percentage DECIMAL(5, 2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_balance DECIMAL(15, 2);
BEGIN
    SELECT COALESCE(SUM(p.current_balance), 0) INTO v_total_balance
    FROM partners p
    WHERE p.type = 'WORKER';

    RETURN QUERY
    SELECT 
        p.id AS worker_id,
        p.partner_code AS worker_code,
        p.partner_name AS worker_name,
        p.current_balance AS current_balance,
        
        COALESCE((
            SELECT SUM(pr.final_amount)
            FROM payrolls pr
            WHERE pr.partner_id = p.id
        ), 0) AS total_paid,
        
        CASE 
            WHEN v_total_balance > 0 THEN 
                ROUND((p.current_balance / v_total_balance * 100)::NUMERIC, 2)
            ELSE 0
        END AS balance_percentage
        
    FROM partners p
    WHERE p.type = 'WORKER'
    
    ORDER BY p.current_balance DESC
    
    LIMIT p_limit;
END;
$$;

-- =================================================================================
-- KẾT THÚC - DATABASE COMPLETE
-- =================================================================================

-- Thông báo hoàn tất
SELECT 'Database schema, triggers, and functions created successfully!' AS status;
