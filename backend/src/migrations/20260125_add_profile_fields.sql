-- Add bio and address columns to public_users table
ALTER TABLE public_users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public_users ADD COLUMN IF NOT EXISTS address TEXT;
