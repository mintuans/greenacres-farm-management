-- =====================================================
-- INSERT USER: Minh Tuấn
-- Email: lmtuan21082003@gmail.com
-- Password: 123456 (hashed with bcrypt)
-- =====================================================

-- Xóa nếu đã tồn tại để tránh lỗi UUID conflict nếu chạy lại nhiều lần
DELETE FROM public_users WHERE email = 'lmtuan21082003@gmail.com';

-- Tạo tài khoản public user mới theo đúng cấu trúc bảng của bạn
INSERT INTO public_users (
    email,
    password_hash,
    full_name,
    is_active,
    is_verified,
    created_at
) VALUES (
    'lmtuan21082003@gmail.com',
    '$2a$10$49H8mUzn7Gae0ayTVf0xX.L989fLKrHQXL2ZhJM2KQr5pZzINe6SG', -- hashed "123456" using bcryptjs
    'Minh Tuấn',
    true,
    true,
    NOW()
);

-- Hiển thị kết quả kiểm tra
SELECT 
    id,
    email,
    full_name,
    is_active,
    is_verified,
    created_at
FROM public_users 
WHERE email = 'lmtuan21082003@gmail.com';
