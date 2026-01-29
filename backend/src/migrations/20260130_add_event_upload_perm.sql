-- Add can_upload_gallery to showcase_event_participants
ALTER TABLE showcase_event_participants ADD COLUMN IF NOT EXISTS can_upload_gallery BOOLEAN DEFAULT FALSE;
