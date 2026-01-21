-- Migration: Add User role for public showcase users
-- Date: 2026-01-20

-- Insert User role if it doesn't exist
INSERT INTO roles (id, name, description, is_system, created_at)
VALUES (
    gen_random_uuid(),
    'USER',
    'Người dùng công khai - Có quyền xem và tương tác với Showcase',
    true,
    NOW()
)
ON CONFLICT (name) DO NOTHING;

-- Get the User role ID for reference
DO $$
DECLARE
    user_role_id UUID;
BEGIN
    SELECT id INTO user_role_id FROM roles WHERE name = 'USER';
    
    -- Log the role creation
    RAISE NOTICE 'User role created/verified with ID: %', user_role_id;
END $$;
