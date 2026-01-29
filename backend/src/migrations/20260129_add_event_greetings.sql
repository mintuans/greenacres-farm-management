-- Migration to add personalized greetings for showcase events
CREATE TABLE IF NOT EXISTS showcase_event_greetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES showcase_events(id) ON DELETE CASCADE,
    public_user_id UUID NOT NULL REFERENCES public_users(id) ON DELETE CASCADE,
    greeting_message TEXT NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, public_user_id)
);

-- Trigger for updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_showcase_event_greetings_updated_at') THEN
        CREATE TRIGGER update_showcase_event_greetings_updated_at 
        BEFORE UPDATE ON showcase_event_greetings
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
