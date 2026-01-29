-- Add gallery_ids to showcase_events table
ALTER TABLE showcase_events ADD COLUMN gallery_ids JSONB DEFAULT '[]';
