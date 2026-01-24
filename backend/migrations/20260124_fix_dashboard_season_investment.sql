-- Migration: Fix Season Investment and Add Season Filter in Dashboard
-- Ngày tạo: 2026-01-25
-- Mục đích: Hỗ trợ lọc thống kê theo mùa vụ và tính toán chính xác số tiền đầu tư

DROP FUNCTION IF EXISTS get_dashboard_stats(DATE, DATE);

CREATE OR REPLACE FUNCTION get_dashboard_stats(
    p_start_date DATE DEFAULT NULL, 
    p_end_date DATE DEFAULT NULL,
    p_season_id UUID DEFAULT NULL
)
RETURNS TABLE (
    total_income NUMERIC,
    total_expense NUMERIC,
    net_profit NUMERIC,
    total_season_investment NUMERIC,
    income_growth_rate NUMERIC,
    expense_growth_rate NUMERIC,
    active_seasons_count BIGINT,
    total_workers BIGINT
) AS $$
DECLARE
    v_start_date DATE := COALESCE(p_start_date, date_trunc('month', CURRENT_DATE)::DATE);
    v_end_date DATE := COALESCE(p_end_date, (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::DATE);
    v_prev_start_date DATE := (v_start_date - interval '1 month')::DATE;
    v_prev_end_date DATE := (v_start_date - interval '1 day')::DATE;
    
    v_curr_income NUMERIC;
    v_curr_expense NUMERIC;
    v_prev_income NUMERIC;
    v_prev_expense NUMERIC;
    v_total_season_investment NUMERIC;
BEGIN
    IF p_season_id IS NOT NULL THEN
        -- 1. Thống kê theo MÙA VỤ cụ thể (Bỏ qua lọc ngày)
        SELECT COALESCE(SUM(amount), 0) INTO v_curr_income 
        FROM transactions 
        WHERE type = 'INCOME' AND season_id = p_season_id;
        
        SELECT COALESCE(SUM(amount), 0) INTO v_curr_expense 
        FROM transactions 
        WHERE type = 'EXPENSE' AND season_id = p_season_id;

        -- Đối với mùa vụ, đầu tư chính là tổng chi phí của mùa đó
        v_total_season_investment := v_curr_expense;
        
        -- Tăng trưởng để mặc định là 0 (hoặc có thể tính so với dự kiến thu)
        v_prev_income := 0;
        v_prev_expense := 0;
    ELSE
        -- 2. Thống kê theo THỜI GIAN (Mặc định - như cũ)
        SELECT COALESCE(SUM(amount), 0) INTO v_curr_income 
        FROM transactions 
        WHERE type = 'INCOME' AND transaction_date BETWEEN v_start_date AND v_end_date;
        
        SELECT COALESCE(SUM(amount), 0) INTO v_curr_expense 
        FROM transactions 
        WHERE type = 'EXPENSE' AND transaction_date BETWEEN v_start_date AND v_end_date;
        
        -- Thống kê kỳ trước để tính tăng trưởng
        SELECT COALESCE(SUM(amount), 0) INTO v_prev_income 
        FROM transactions 
        WHERE type = 'INCOME' AND transaction_date BETWEEN v_prev_start_date AND v_prev_end_date;
        
        SELECT COALESCE(SUM(amount), 0) INTO v_prev_expense 
        FROM transactions 
        WHERE type = 'EXPENSE' AND transaction_date BETWEEN v_prev_start_date AND v_prev_end_date;

        -- Đầu tư mùa vụ của các vụ đang ACTIVE
        SELECT COALESCE(SUM(t.amount), 0) INTO v_total_season_investment
        FROM transactions t
        JOIN seasons s ON t.season_id = s.id
        WHERE s.status = 'ACTIVE' AND t.type = 'EXPENSE';
    END IF;
    
    RETURN QUERY
    SELECT 
        v_curr_income,
        v_curr_expense,
        v_curr_income - v_curr_expense,
        v_total_season_investment,
        CASE WHEN v_prev_income = 0 THEN 0 ELSE ((v_curr_income - v_prev_income) / v_prev_income * 100)::NUMERIC END,
        CASE WHEN v_prev_expense = 0 THEN 0 ELSE ((v_curr_expense - v_prev_expense) / v_prev_expense * 100)::NUMERIC END,
        (SELECT COUNT(*) FROM seasons WHERE status = 'ACTIVE'),
        (SELECT COUNT(*) FROM partners WHERE type = 'WORKER')
    ;
END;
$$ LANGUAGE plpgsql;
