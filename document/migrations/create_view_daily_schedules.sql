-- =================================================================================
-- Migration: Tạo VIEW tổng hợp lịch trình
-- Mục đích: Kết hợp dữ liệu từ work_schedules (DONE) và farm_events
-- Ngày tạo: 2026-01-16
-- =================================================================================

-- Xóa VIEW cũ nếu tồn tại
DROP VIEW IF EXISTS view_daily_schedules;

-- Tạo VIEW mới
CREATE OR REPLACE VIEW view_daily_schedules AS
-- 1. Lấy dữ liệu từ bảng Kế hoạch làm việc (Ai làm, ca nào, việc gì)
-- Chỉ lấy các bản ghi đã hoàn thành (DONE)
SELECT 
    ws.id AS event_id,
    'WORK_SHIFT'::VARCHAR(50) AS event_type,
    (p.partner_name || ' - ' || j.job_name)::TEXT AS title,
    ws.work_date AS event_date,
    s.start_time,
    s.end_time,
    ws.status,
    ws.note AS description,
    '#13ec49'::VARCHAR(20) AS display_color, -- Màu xanh cho công việc
    ws.partner_id,
    ws.season_id,
    p.partner_name,
    j.job_name,
    s.shift_name
FROM work_schedules ws
JOIN partners p ON ws.partner_id = p.id
JOIN work_shifts s ON ws.shift_id = s.id
JOIN job_types j ON ws.job_type_id = j.id
WHERE ws.status = 'DONE'

UNION ALL

-- 2. Lấy dữ liệu từ bảng Sự kiện nông trại (Thu hoạch, vấn đề...)
SELECT 
    fe.id AS event_id,
    'FARM_EVENT'::VARCHAR(50) AS event_type,
    fe.title::TEXT,
    fe.start_time::DATE AS event_date,
    fe.start_time::TIME AS start_time,
    fe.end_time::TIME AS end_time,
    'CONFIRMED'::VARCHAR(20) AS status,
    fe.description,
    CASE 
        WHEN fe.event_type = 'HARVEST' THEN '#fbbf24' -- Vàng cho thu hoạch
        WHEN fe.event_type = 'ISSUE' THEN '#ef4444'   -- Đỏ cho vấn đề
        WHEN fe.event_type = 'TASK' THEN '#10b981'    -- Xanh lục cho công việc
        ELSE '#3b82f6'                                -- Xanh dương cho khác
    END AS display_color,
    NULL::UUID AS partner_id,
    fe.season_id,
    NULL::VARCHAR AS partner_name,
    NULL::VARCHAR AS job_name,
    NULL::VARCHAR AS shift_name
FROM farm_events fe;

-- Kiểm tra VIEW đã tạo thành công
SELECT COUNT(*) as total_events FROM view_daily_schedules;
