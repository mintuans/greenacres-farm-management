-- Migration: Sửa lỗi cập nhật số dư đối tác (Nhân viên, Nhà cung cấp, Người mua)
-- Ngày tạo: 2026-01-30
-- Mô tả: 
-- 1. Thêm trigger cập nhật số dư khi có Nhật ký công việc (Daily Work Log) - Giúp tăng số dư khi nhân viên làm việc.
-- 2. Sửa trigger cập nhật số dư khi có Giao dịch (Transaction) - Sử dụng logic (amount - paid_amount) để tính nợ.
-- 3. Cập nhật trigger tự động tạo Giao dịch từ Phiếu lương (Payroll) - Đảm bảo không tạo nợ lặp lại.

-- =================================================================================
-- 1. TRIGGER CHO NHẬT KÝ CÔNG VIỆC (DAILY WORK LOGS)
-- Mục đích: Khi nhân viên làm xong việc (DONE), số dư (số tiền farm nợ họ) phải tăng lên.
-- =================================================================================

CREATE OR REPLACE FUNCTION trg_update_partner_balance_on_work_log()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.status = 'DONE') THEN
            UPDATE partners SET current_balance = current_balance + NEW.total_amount WHERE id = NEW.partner_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Nếu chuyển sang DONE (từ trạng thái khác)
        IF (OLD.status <> 'DONE' AND NEW.status = 'DONE') THEN
            UPDATE partners SET current_balance = current_balance + NEW.total_amount WHERE id = NEW.partner_id;
        -- Nếu từ DONE chuyển sang trạng thái khác (Hủy/Sửa)
        ELSIF (OLD.status = 'DONE' AND NEW.status <> 'DONE') THEN
            UPDATE partners SET current_balance = current_balance - OLD.total_amount WHERE id = OLD.partner_id;
        -- Nếu vẫn là DONE nhưng thay đổi số tiền
        ELSIF (OLD.status = 'DONE' AND NEW.status = 'DONE' AND OLD.total_amount <> NEW.total_amount) THEN
            UPDATE partners SET current_balance = current_balance - OLD.total_amount + NEW.total_amount WHERE id = NEW.partner_id;
        END IF;
        
        -- Nếu thay đổi nhân viên (trường hợp hiếm)
        IF (OLD.partner_id <> NEW.partner_id AND OLD.status = 'DONE') THEN
            UPDATE partners SET current_balance = current_balance - OLD.total_amount WHERE id = OLD.partner_id;
            UPDATE partners SET current_balance = current_balance + NEW.total_amount WHERE id = NEW.partner_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.status = 'DONE') THEN
            UPDATE partners SET current_balance = current_balance - OLD.total_amount WHERE id = OLD.partner_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_work_log_balance_sync ON daily_work_logs;
CREATE TRIGGER trg_work_log_balance_sync
AFTER INSERT OR UPDATE OR DELETE ON daily_work_logs
FOR EACH ROW
EXECUTE FUNCTION trg_update_partner_balance_on_work_log();


-- =================================================================================
-- 2. TRIGGER CHO GIAO DỊCH (TRANSACTIONS)
-- Mục đích: Cập nhật số dư dựa trên chênh lệch giữa tổng tiền (amount) và thực trả (paid_amount).
-- Logic:
-- - Nếu là CHI (EXPENSE): balance += (amount - paid_amount)
-- - Nếu là THU (INCOME): balance -= (amount - paid_amount)
-- =================================================================================

CREATE OR REPLACE FUNCTION trg_update_partner_balance_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
    v_diff_old DECIMAL(15, 2) := 0;
    v_diff_new DECIMAL(15, 2) := 0;
BEGIN
    -- Tính toán phần nợ mới phát sinh (amount - paid_amount)
    -- Nếu amount > paid_amount: Nợ tăng
    -- Nếu amount < paid_amount (thanh toán nợ cũ): Nợ giảm
    
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.partner_id IS NOT NULL) THEN
            IF (NEW.type = 'EXPENSE') THEN
                UPDATE partners SET current_balance = current_balance + (NEW.amount - NEW.paid_amount) WHERE id = NEW.partner_id;
            ELSE
                UPDATE partners SET current_balance = current_balance - (NEW.amount - NEW.paid_amount) WHERE id = NEW.partner_id;
            END IF;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Hoàn lại trạng thái cũ
        IF (OLD.partner_id IS NOT NULL) THEN
            IF (OLD.type = 'EXPENSE') THEN
                UPDATE partners SET current_balance = current_balance - (OLD.amount - OLD.paid_amount) WHERE id = OLD.partner_id;
            ELSE
                UPDATE partners SET current_balance = current_balance + (OLD.amount - OLD.paid_amount) WHERE id = OLD.partner_id;
            END IF;
        END IF;
        -- Áp dụng trạng thái mới
        IF (NEW.partner_id IS NOT NULL) THEN
            IF (NEW.type = 'EXPENSE') THEN
                UPDATE partners SET current_balance = current_balance + (NEW.amount - NEW.paid_amount) WHERE id = NEW.partner_id;
            ELSE
                UPDATE partners SET current_balance = current_balance - (NEW.amount - NEW.paid_amount) WHERE id = NEW.partner_id;
            END IF;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.partner_id IS NOT NULL) THEN
            IF (OLD.type = 'EXPENSE') THEN
                UPDATE partners SET current_balance = current_balance - (OLD.amount - OLD.paid_amount) WHERE id = OLD.partner_id;
            ELSE
                UPDATE partners SET current_balance = current_balance + (OLD.amount - OLD.paid_amount) WHERE id = OLD.partner_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_transaction_balance_sync ON transactions;
CREATE TRIGGER trg_transaction_balance_sync
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION trg_update_partner_balance_on_transaction();


-- =================================================================================
-- 3. CẬP NHẬT TRIGGER TẠO GIAO DỊCH TỪ PAYROLL
-- Mục đích: Đảm bảo khi trả lương, transaction được tạo ra với amount = 0.
-- Vì tiền công đã được cộng vào balance qua Daily Work Log rồi, 
-- nên Transaction trả lương chỉ mang tính chất GIẢM nợ (thanh toán cash).
-- =================================================================================

CREATE OR REPLACE FUNCTION trg_auto_create_transaction_on_payroll()
RETURNS TRIGGER AS $$
DECLARE
    v_transaction_id UUID;
    v_category_id UUID;
BEGIN
    -- Chỉ xử lý khi chuyển sang 'PAID'
    IF ((TG_OP = 'INSERT' AND NEW.status = 'PAID') OR 
        (TG_OP = 'UPDATE' AND OLD.status <> 'PAID' AND NEW.status = 'PAID')) THEN
        
        IF NEW.transaction_id IS NULL THEN
            -- Tìm category cho Lương
            SELECT id INTO v_category_id FROM categories WHERE category_code = 'CAT-LUONG' LIMIT 1;
            
            -- Tạo transaction thanh toán (Amount = 0 vì không mua thêm dịch vụ, chỉ trả nợ cũ)
            INSERT INTO transactions (
                partner_id, season_id, category_id, 
                amount, paid_amount, type, 
                transaction_date, note, is_inventory_affected
            ) VALUES (
                NEW.partner_id, NULL, v_category_id, 
                0, -- QUAN TRỌNG: 0 thay vì Newton.final_amount để tránh nhân đôi nợ
                NEW.final_amount, -- Số tiền thực trả
                'EXPENSE',
                COALESCE(NEW.payment_date, CURRENT_TIMESTAMP),
                'Thanh toán lương - Mã phiếu: ' || NEW.payroll_code,
                FALSE
            )
            RETURNING id INTO v_transaction_id;
            
            -- Cập nhật ngược lại payroll
            UPDATE payrolls SET transaction_id = v_transaction_id WHERE id = NEW.id;
        END IF;
    END IF;

    -- Xử lý khi Hủy (CANCELLED)
    IF (TG_OP = 'UPDATE' AND OLD.status = 'PAID' AND NEW.status = 'CANCELLED') THEN
        IF NEW.transaction_id IS NOT NULL THEN
            DELETE FROM transactions WHERE id = NEW.transaction_id;
            UPDATE payrolls SET transaction_id = NULL WHERE id = NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =================================================================================
-- 4. KÍCH HOẠT LẠI BALANCE CHO DỮ LIỆU HIỆN CÓ (TÙY CHỌN - CHẠY CẨN THẬN)
-- =================================================================================

-- Đặt lại tất cả balance về 0 trước khi tính lại (Nếu muốn đồng bộ hoàn toàn)
-- UPDATE partners SET current_balance = 0;

-- Sau đó chạy hàm tính toán lại (nếu cần). 
-- Tuy nhiên ở đây chúng ta sẽ giả định người dùng muốn sửa chữa từ bây giờ.
-- Nếu muốn recalculate toàn bộ, cần viết một script riêng.
