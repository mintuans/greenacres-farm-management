-- Migration: Tính toán lại số dư cho toàn bộ đối tác dựa trên lịch sử
-- Ngày tạo: 2026-01-30

-- Cập nhật lại số dư cho tất cả partners dựa trên:
-- 1. Tổng tiền từ Nhật ký công việc (Daily Work Logs) có trạng thái DONE
-- 2. Chênh lệch (Amount - Paid_Amount) từ các giao dịch (Transactions)

UPDATE partners p
SET current_balance = 
    -- 1. Cộng tiền từ công việc (đối với nhân viên)
    COALESCE((
        SELECT SUM(total_amount)
        FROM daily_work_logs
        WHERE partner_id = p.id AND status = 'DONE'
    ), 0) 
    + 
    -- 2. Cộng/Trừ nợ từ các giao dịch tài chính
    COALESCE((
        SELECT SUM(
            CASE 
                WHEN type = 'EXPENSE' THEN (amount - paid_amount)
                WHEN type = 'INCOME' THEN -(amount - paid_amount)
                ELSE 0
            END
        )
        FROM transactions
        WHERE partner_id = p.id
    ), 0);

-- Thông báo kết quả
SELECT partner_name, partner_code, current_balance FROM partners ORDER BY current_balance DESC;
