-- Migration: Thêm cột import_date vào bảng inventory
-- Ngày tạo: 2026-01-17

-- Thêm cột import_date với giá trị mặc định là thời gian hiện tại
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Cập nhật dữ liệu cũ: Nếu có dữ liệu cũ chưa có ngày nhập, set về thời gian hiện tại
UPDATE inventory 
SET import_date = CURRENT_TIMESTAMP 
WHERE import_date IS NULL;

-- Thêm comment cho cột
COMMENT ON COLUMN inventory.import_date IS 'Ngày nhập vật tư vào kho';
