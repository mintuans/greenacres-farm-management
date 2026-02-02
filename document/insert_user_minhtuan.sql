-- =====================================================
-- INSERT USER & GRANT SYSTEM ADMIN PERMISSIONS
-- Email: lmtuan21082003@gmail.com
-- Password: 123456 (Correct Hash)
-- =====================================================

DO $$
DECLARE
    v_user_id UUID;
    v_role_id UUID;
BEGIN
    -- 1. Insert or Update User into public_users
    -- Xóa trước để đảm bảo sạch
    DELETE FROM public_users WHERE email = 'lmtuan21082003@gmail.com';

    INSERT INTO public_users (
        email,
        password_hash,
        full_name,
        is_active,
        is_verified,
        created_at
    ) VALUES (
        'lmtuan21082003@gmail.com',
        '$2a$10$49H8mUzn7Gae0ayTVf0xX.L989fLKrHQXL2ZhJM2KQr5pZzINe6SG', -- Valid bcrypt hash for "123456"
        'Minh Tuấn',
        true,
        true,
        NOW()
    )
    RETURNING id INTO v_user_id;

    -- 2. Ensure "super_admin" role exists
    SELECT id INTO v_role_id FROM roles WHERE name = 'SUPER_ADMIN';
    
    IF v_role_id IS NULL THEN
        INSERT INTO roles (name, description, is_system)
        VALUES ('SUPER_ADMIN', 'Supreme System Administrator', true)
        RETURNING id INTO v_role_id;
    END IF;

    -- 3. Assign Role to User
    INSERT INTO user_roles (user_id, role_id)
    VALUES (v_user_id, v_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;

    RAISE NOTICE 'User created and granted SUPER_ADMIN privileges. ID: %', v_user_id;
END $$;
