-- =================================================================================
-- PHẦN 5: HỆ THỐNG PHÂN QUYỀN (RBAC)
-- =================================================================================

-- 12. Bảng Nhóm quyền (Roles) - Ví dụ: Admin, Staff, Editor, User
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,        -- Mã nhóm (VD: admin, customer_support)
    description VARCHAR(255),                -- Tên hiển thị (VD: Quản trị viên)
    is_system BOOLEAN DEFAULT FALSE,         -- Nếu TRUE thì không được xóa (VD: quyền Super Admin)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Bảng Danh sách Quyền (Permissions) - Ví dụ: create_user, delete_product
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module VARCHAR(50),                      -- Nhóm chức năng (VD: User, Product, Order) để dễ hiển thị trên UI
    action VARCHAR(50),                      -- Hành động (VD: create, read, update, delete)
    code VARCHAR(100) UNIQUE NOT NULL,       -- Mã quyền duy nhất (VD: user.create, product.delete)
    description VARCHAR(255),                -- Mô tả (VD: Được phép tạo người dùng mới)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Bảng Liên kết Nhóm quyền - Quyền (Một nhóm có nhiều quyền)
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 15. Bảng Liên kết Người dùng - Nhóm quyền (Một người có thể có nhiều vai trò)
-- Lưu ý: Nếu 1 user chỉ có đúng 1 role, bạn có thể thêm cột role_id vào bảng public_users. 
-- Tuy nhiên, dùng bảng riêng này sẽ linh hoạt hơn (VD: vừa là Sales vừa là Marketing).
CREATE TABLE user_roles (
    user_id UUID REFERENCES public_users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);


-- 16. Bảng Nhật ký hệ thống (Audit Logs / Activity Logs)
CREATE TABLE audit_logs (
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