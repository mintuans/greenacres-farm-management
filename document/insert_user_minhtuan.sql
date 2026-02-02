-- =====================================================
-- INSERT USER: Minh Tuấn
-- Email: lmtuan21082003@gmail.com
-- Password: 123456 (hashed with bcrypt)
-- =====================================================

-- Tạo tài khoản public user mới
INSERT INTO public_users (
    email,
    password,
    full_name,
    phone,
    address,
    avatar_url,
    is_active,
    email_verified,
    created_at,
    updated_at
) VALUES (
    'lmtuan21082003@gmail.com',
    '$2b$10$YQ4.ZJwVqGE8xKxqF5pZMeK6rJYvN8qF5pZMeK6rJYvN8qF5pZMeO', -- bcrypt hash of "123456"
    'Minh Tuấn',
    NULL,
    NULL,
    NULL,
    true,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    full_name = EXCLUDED.full_name,
    is_active = EXCLUDED.is_active,
    email_verified = EXCLUDED.email_verified,
    updated_at = NOW();

-- Lấy ID của user vừa tạo và tạo partner tương ứng (nếu cần)
DO $$
DECLARE
    v_user_id INTEGER;
BEGIN
    -- Lấy user_id
    SELECT id INTO v_user_id FROM public_users WHERE email = 'lmtuan21082003@gmail.com';
    
    -- Kiểm tra xem đã có partner chưa
    IF NOT EXISTS (SELECT 1 FROM partners WHERE public_user_id = v_user_id) THEN
        -- Tạo partner mới (nếu muốn user này có thể đăng nhập vào hệ thống quản lý)
        INSERT INTO partners (
            partner_code,
            full_name,
            phone,
            email,
            address,
            partner_type,
            current_balance,
            is_active,
            public_user_id,
            created_at,
            updated_at
        ) VALUES (
            'MT' || LPAD(NEXTVAL('partners_id_seq')::TEXT, 4, '0'),
            'Minh Tuấn',
            NULL,
            'lmtuan21082003@gmail.com',
            NULL,
            'EMPLOYEE',
            0,
            true,
            v_user_id,
            NOW(),
            NOW()
        );
    END IF;
END $$;

-- Hiển thị kết quả
SELECT 
    pu.id,
    pu.email,
    pu.full_name,
    pu.is_active,
    pu.email_verified,
    p.partner_code,
    p.partner_type
FROM public_users pu
LEFT JOIN partners p ON p.public_user_id = pu.id
WHERE pu.email = 'lmtuan21082003@gmail.com';
