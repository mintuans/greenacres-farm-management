-- =================================================================================
-- Add OAuth Support to public_users table
-- Run this migration to support Google and Facebook login
-- =================================================================================

-- Note: public_users table already has google_id and facebook_id columns
-- We only need to add the 'avatar' column for OAuth provider URLs

-- Add avatar column for OAuth provider profile picture URLs
-- This is separate from avatar_id which references media_files table
ALTER TABLE public_users 
ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Create indexes for faster OAuth lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_public_users_google_id ON public_users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_public_users_facebook_id ON public_users(facebook_id) WHERE facebook_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public_users.google_id IS 'Google OAuth user ID';
COMMENT ON COLUMN public_users.facebook_id IS 'Facebook OAuth user ID';
COMMENT ON COLUMN public_users.avatar IS 'User profile picture URL from OAuth provider (direct URL)';
COMMENT ON COLUMN public_users.avatar_id IS 'User profile picture stored in media_files table (UUID reference)';

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'public_users' 
AND column_name IN ('google_id', 'facebook_id', 'avatar', 'avatar_id')
ORDER BY ordinal_position;
