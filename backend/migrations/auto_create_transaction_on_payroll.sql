-- Migration: Tự động tạo Transaction khi trả lương (Payroll)
-- Ngày tạo: 2026-01-17
-- Mục đích: Khi payroll chuyển sang trạng thái PAID, tự động tạo transaction chi tiền

-- Function: Tự động tạo transaction khi payroll được PAID
CREATE OR REPLACE FUNCTION trg_auto_create_transaction_on_payroll()
RETURNS TRIGGER AS $$
DECLARE
    v_transaction_id UUID;
    v_category_id UUID;
BEGIN
    -- Chỉ xử lý khi:
    -- 1. Payroll mới được tạo với status = 'PAID'
    -- 2. Hoặc payroll được cập nhật từ trạng thái khác sang 'PAID'
    IF (TG_OP = 'INSERT' AND NEW.status = 'PAID') OR 
       (TG_OP = 'UPDATE' AND OLD.status <> 'PAID' AND NEW.status = 'PAID') THEN
        
        -- Kiểm tra xem đã có transaction chưa
        IF NEW.transaction_id IS NULL THEN
            
            -- Tìm category_id cho "Lương nhân viên" (nếu có)
            -- Bạn có thể tạo một category riêng cho lương, hoặc để NULL
            SELECT id INTO v_category_id 
            FROM categories 
            WHERE category_code = 'CAT-LUONG' 
            LIMIT 1;
            
            -- Tạo transaction mới
            INSERT INTO transactions (
                partner_id,
                season_id,
                category_id,
                amount,
                paid_amount,
                type,
                transaction_date,
                note,
                is_inventory_affected
            ) VALUES (
                NEW.partner_id,
                NULL, -- Lương thường không gắn với season cụ thể, hoặc bạn có thể lấy từ daily_work_logs
                v_category_id,
                NEW.final_amount,
                NEW.final_amount, -- Đã trả đủ
                'EXPENSE',
                COALESCE(NEW.payment_date, CURRENT_TIMESTAMP),
                'Thanh toán lương - Phiếu lương: ' || NEW.payroll_code,
                FALSE
            )
            RETURNING id INTO v_transaction_id;
            
            -- Cập nhật lại payroll với transaction_id
            UPDATE payrolls 
            SET transaction_id = v_transaction_id,
                payment_date = COALESCE(NEW.payment_date, CURRENT_TIMESTAMP)
            WHERE id = NEW.id;
            
        END IF;
    END IF;
    
    -- Nếu payroll bị hủy (CANCELLED), có thể xóa transaction tương ứng
    IF (TG_OP = 'UPDATE' AND OLD.status = 'PAID' AND NEW.status = 'CANCELLED') THEN
        IF NEW.transaction_id IS NOT NULL THEN
            -- Xóa transaction đã tạo
            DELETE FROM transactions WHERE id = NEW.transaction_id;
            
            -- Xóa liên kết
            UPDATE payrolls 
            SET transaction_id = NULL 
            WHERE id = NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger
DROP TRIGGER IF EXISTS payroll_auto_transaction_trigger ON payrolls;
CREATE TRIGGER payroll_auto_transaction_trigger
AFTER INSERT OR UPDATE ON payrolls
FOR EACH ROW
EXECUTE FUNCTION trg_auto_create_transaction_on_payroll();

-- Tạo category cho lương (nếu chưa có)
INSERT INTO categories (category_code, category_name, scope)
VALUES ('CAT-LUONG', 'Lương nhân viên', 'FARM')
ON CONFLICT (category_code) DO NOTHING;

COMMENT ON FUNCTION trg_auto_create_transaction_on_payroll() IS 'Tự động tạo transaction khi payroll chuyển sang trạng thái PAID';
