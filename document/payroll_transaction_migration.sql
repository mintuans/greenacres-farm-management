-- =================================================================================
-- MIGRATION: Thêm liên kết giữa Payrolls và Transactions
-- Ngày tạo: 2026-01-11
-- Mục đích: Theo dõi chính xác giao dịch chi tiền lương nào tương ứng với phiếu lương nào
-- =================================================================================

-- FORWARD MIGRATION
-- Thêm cột transaction_id vào bảng payrolls
ALTER TABLE payrolls 
ADD COLUMN transaction_id UUID REFERENCES transactions(id);

-- Thêm comment giải thích
COMMENT ON COLUMN payrolls.transaction_id IS 'Liên kết với giao dịch chi tiền thực tế. NULL nếu chưa chi tiền, có giá trị khi status = PAID';

-- Tạo index để tăng tốc độ truy vấn
CREATE INDEX idx_payrolls_transaction_id ON payrolls(transaction_id);

-- =================================================================================
-- ROLLBACK MIGRATION (Nếu cần quay lại)
-- =================================================================================
-- DROP INDEX idx_payrolls_transaction_id;
-- ALTER TABLE payrolls DROP COLUMN transaction_id;

-- =================================================================================
-- HƯỚNG DẪN SỬ DỤNG
-- =================================================================================
-- 
-- 1. Khi tạo phiếu lương mới:
--    - Tạo payroll với status='DRAFT', transaction_id=NULL
--    - Gom các daily_work_logs vào payroll này
--
-- 2. Khi thanh toán lương:
--    - Tạo transaction với type='EXPENSE', partner_id=nhân viên
--    - Cập nhật payroll: SET transaction_id=<id vừa tạo>, status='PAID', payment_date=NOW()
--
-- 3. Truy vấn phiếu lương đã thanh toán:
--    SELECT p.*, t.* 
--    FROM payrolls p
--    LEFT JOIN transactions t ON p.transaction_id = t.id
--    WHERE p.status = 'PAID';
--
-- 4. Kiểm tra phiếu lương chưa thanh toán:
--    SELECT * FROM payrolls WHERE transaction_id IS NULL;
--
