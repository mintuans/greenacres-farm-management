-- Migration: Tạo category "Lương nhân viên" cho payroll
-- Ngày tạo: 2026-01-17

-- Tạo category cho lương nhân viên (nếu chưa có)
INSERT INTO categories (category_code, category_name, scope, parent_id)
VALUES ('CAT-LUONG', 'Lương nhân viên', 'FARM', NULL)
ON CONFLICT (category_code) DO NOTHING;

-- Kiểm tra kết quả
SELECT * FROM categories WHERE category_code = 'CAT-LUONG';
