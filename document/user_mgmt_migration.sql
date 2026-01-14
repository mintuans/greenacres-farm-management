-- =================================================================================
-- PHẦN 4: HỆ THỐNG NGƯỜI DÙNG CÔNG KHAI (Visitors/Customers)
-- =================================================================================

-- 10. Bảng người dùng/khách hàng công khai
CREATE TABLE IF NOT EXISTS public_users (
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
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public_users(id) ON DELETE CASCADE,
    
    token VARCHAR(500) UNIQUE NOT NULL,     -- JWT token hoặc session token
    ip_address VARCHAR(50),
    user_agent TEXT,
    
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
-- PHẦN 5: HỆ THỐNG PHÂN QUYỀN (RBAC)
-- =================================================================================

-- 12. Bảng Nhóm quyền (Roles) - Ví dụ: Admin, Staff, Editor, User
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,        -- Mã nhóm (VD: admin, customer_support)
    description VARCHAR(255),                -- Tên hiển thị (VD: Quản trị viên)
    is_system BOOLEAN DEFAULT FALSE,         -- Nếu TRUE thì không được xóa (VD: quyền Super Admin)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Bảng Danh sách Quyền (Permissions) - Ví dụ: create_user, delete_product
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module VARCHAR(50),                      -- Nhóm chức năng (VD: User, Product, Order) để dễ hiển thị trên UI
    action VARCHAR(50),                      -- Hành động (VD: create, read, update, delete)
    code VARCHAR(100) UNIQUE NOT NULL,       -- Mã quyền duy nhất (VD: user.create, product.delete)
    description VARCHAR(255),                -- Mô tả (VD: Được phép tạo người dùng mới)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Bảng Liên kết Nhóm quyền - Quyền (Một nhóm có nhiều quyền)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 15. Bảng Liên kết Người dùng - Nhóm quyền (Một người có thể có nhiều vai trò)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES public_users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- 16. Bảng Nhật ký hệ thống (Audit Logs / Activity Logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public_users(id) ON DELETE SET NULL, -- Ai thực hiện
    action VARCHAR(50),            -- Hành động (VD: LOGIN, UPDATE_ROLE, DELETE_USER)
    entity_table VARCHAR(50),      -- Tác động lên bảng nào (VD: public_users)
    entity_id UUID,                -- ID của dòng dữ liệu bị tác động
    old_values JSONB,              -- Dữ liệu trước khi sửa (Lưu dạng JSON)
    new_values JSONB,              -- Dữ liệu sau khi sửa
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
