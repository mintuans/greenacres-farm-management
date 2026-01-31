-- Migration: Setup Notifications System
-- Date: 2026-01-27
-- Description: Create tables for notification functionality

-- 1. Bảng Thông báo (Notifications)
-- Lưu trữ nội dung thông báo
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO' CHECK (type IN ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'ALERT')),
    category VARCHAR(50) DEFAULT 'SYSTEM', -- SYSTEM, PAYROLL, INVENTORY, SEASON, WORK_SCHEDULE, etc.
    
    -- Link optional: dùng để điều hướng khi người dùng nhấn vào thông báo
    link VARCHAR(255), 
    
    -- Metadata: lưu trữ dữ liệu bổ sung dưới dạng JSON (VD: { "order_id": "..." })
    metadata JSONB, 
    
    -- Người gửi (NULL nếu là hệ thống tự động)
    sender_id UUID REFERENCES public_users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE -- Thông báo có thể tự động ẩn/hết hạn
);

-- 2. Bảng Nhận thông báo (Notification Recipients)
-- Quản lý trạng thái đã đọc/chưa đọc cho từng người dùng cụ thể
CREATE TABLE IF NOT EXISTS notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    
    -- Người nhận (Liên kết với bảng người dùng hệ thống)
    user_id UUID NOT NULL REFERENCES public_users(id) ON DELETE CASCADE,
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Bookmark/Important (Tùy chọn)
    is_important BOOLEAN DEFAULT FALSE,
    
    -- Xóa thông báo (Soft delete cho phía người dùng)
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng Cấu hình thông báo người dùng (User Notification Settings) - Nếu cần sau này
-- Cho phép người dùng bật/tắt nhận từng loại thông báo
CREATE TABLE IF NOT EXISTS user_notification_settings (
    user_id UUID PRIMARY KEY REFERENCES public_users(id) ON DELETE CASCADE,
    enable_email BOOLEAN DEFAULT TRUE,
    enable_push BOOLEAN DEFAULT TRUE,
    enable_sms BOOLEAN DEFAULT FALSE,
    muted_categories TEXT[], -- Danh sách các category bị tắt thông báo
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


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

ALTER TABLE showcase_event_participants ADD COLUMN IF NOT EXISTS can_upload_gallery BOOLEAN DEFAULT FALSE;
