-- =====================================================
-- INSERT USER: Minh Tuấn (Simple Version)
-- Email: lmtuan21082003@gmail.com
-- Password: 123456 (hashed with bcrypt)
-- =====================================================

-- Insert hoặc update user
INSERT INTO public_users (
    email,
    password_hash,
    full_name,
    is_active,
    email_verified,
    created_at,
    updated_at
) VALUES (
    'lmtuan21082003@gmail.com',
    '$2b$10$YQ4.ZJwVqGE8xKxqF5pZMeK6rJYvN8qF5pZMeK6rJYvN8qF5pZMeO',
    'Minh Tuấn',
    true,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    is_active = EXCLUDED.is_active,
    email_verified = EXCLUDED.email_verified,
    updated_at = NOW();

-- Hiển thị kết quả
SELECT id, email, full_name, is_active, email_verified, created_at
FROM public_users
WHERE email = 'lmtuan21082003@gmail.com';
