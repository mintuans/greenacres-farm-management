-- =================================================================================
-- VÍ DỤ: Quy trình thanh toán lương cho nhân viên
-- =================================================================================

-- BƯỚC 1: Tạo phiếu lương mới (DRAFT)
-- Giả sử thanh toán cho nhân viên Nguyễn Văn A công tháng 1/2026
INSERT INTO payrolls (
    partner_id,
    title,
    total_amount,
    bonus,
    deductions,
    final_amount,
    status
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001', -- ID của Nguyễn Văn A
    'Thanh toán công tháng 01/2026 - Nguyễn Văn A',
    5000000, -- Tổng công
    500000,  -- Thưởng
    200000,  -- Trừ ứng lương
    5300000, -- = 5000000 + 500000 - 200000
    'DRAFT'
) RETURNING id; -- Giả sử trả về: 'payroll-001'

-- BƯỚC 2: Gom các ngày công vào phiếu lương này
UPDATE daily_work_logs 
SET payroll_id = 'payroll-001'
WHERE partner_id = '550e8400-e29b-41d4-a716-446655440001'
  AND work_date BETWEEN '2026-01-01' AND '2026-01-31'
  AND payroll_id IS NULL; -- Chỉ lấy những ngày chưa thanh toán

-- BƯỚC 3: Khi thực sự chi tiền, tạo giao dịch
INSERT INTO transactions (
    account_id,
    partner_id,
    category_id,
    amount,
    paid_amount,
    type,
    transaction_date,
    note
) VALUES (
    'account-tien-mat', -- Tài khoản tiền mặt
    '550e8400-e29b-41d4-a716-446655440001', -- Nguyễn Văn A
    'category-luong', -- Danh mục lương
    5300000,
    5300000, -- Trả đủ
    'EXPENSE',
    NOW(),
    'Chi lương tháng 01/2026 cho Nguyễn Văn A'
) RETURNING id; -- Giả sử trả về: 'transaction-001'

-- BƯỚC 4: Cập nhật phiếu lương với transaction_id
UPDATE payrolls 
SET 
    transaction_id = 'transaction-001',
    status = 'PAID',
    payment_date = NOW()
WHERE id = 'payroll-001';

-- =================================================================================
-- TRUY VẤN HỮU ÍCH
-- =================================================================================

-- 1. Xem chi tiết phiếu lương kèm giao dịch
SELECT 
    p.id as payroll_id,
    p.title,
    p.final_amount,
    p.status,
    p.payment_date,
    t.id as transaction_id,
    t.amount as paid_amount,
    t.transaction_date,
    part.partner_name as employee_name
FROM payrolls p
LEFT JOIN transactions t ON p.transaction_id = t.id
LEFT JOIN partners part ON p.partner_id = part.id
WHERE p.id = 'payroll-001';

-- 2. Danh sách phiếu lương chưa thanh toán
SELECT 
    p.id,
    p.title,
    p.final_amount,
    part.partner_name,
    p.created_at
FROM payrolls p
JOIN partners part ON p.partner_id = part.id
WHERE p.transaction_id IS NULL
ORDER BY p.created_at DESC;

-- 3. Tổng lương đã chi trong tháng
SELECT 
    DATE_TRUNC('month', p.payment_date) as month,
    COUNT(*) as total_payrolls,
    SUM(p.final_amount) as total_paid,
    SUM(t.amount) as total_transaction_amount
FROM payrolls p
JOIN transactions t ON p.transaction_id = t.id
WHERE p.status = 'PAID'
  AND p.payment_date >= '2026-01-01'
  AND p.payment_date < '2026-02-01'
GROUP BY DATE_TRUNC('month', p.payment_date);

-- 4. Chi tiết công việc của một phiếu lương
SELECT 
    dwl.work_date,
    ws.shift_name,
    jt.job_name,
    dwl.quantity,
    dwl.applied_rate,
    dwl.total_amount,
    dwl.note
FROM daily_work_logs dwl
LEFT JOIN work_shifts ws ON dwl.shift_id = ws.id
LEFT JOIN job_types jt ON dwl.job_type_id = jt.id
WHERE dwl.payroll_id = 'payroll-001'
ORDER BY dwl.work_date;

-- 5. Kiểm tra tính toàn vẹn dữ liệu (payroll amount = sum of daily logs)
SELECT 
    p.id,
    p.title,
    p.total_amount as payroll_total,
    SUM(dwl.total_amount) as logs_total,
    p.total_amount - SUM(dwl.total_amount) as difference
FROM payrolls p
LEFT JOIN daily_work_logs dwl ON p.id = dwl.payroll_id
GROUP BY p.id, p.title, p.total_amount
HAVING p.total_amount != SUM(dwl.total_amount);

-- =================================================================================
-- XỬ LÝ NGOẠI LỆ
-- =================================================================================

-- Hủy thanh toán (nếu phát hiện sai sót)
-- Lưu ý: Chỉ nên làm điều này trong trường hợp đặc biệt
UPDATE payrolls 
SET 
    transaction_id = NULL,
    status = 'DRAFT',
    payment_date = NULL
WHERE id = 'payroll-001'
  AND status = 'PAID';

-- Sau đó có thể xóa hoặc đánh dấu void transaction
UPDATE transactions 
SET note = CONCAT(note, ' [VOID - Đã hủy]')
WHERE id = 'transaction-001';
