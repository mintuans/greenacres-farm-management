-- =================================================================================
-- STORED FUNCTION: Lấy thống kê tổng quan Dashboard
-- Tính toán: Tổng thu nhập, Tổng chi phí, Lợi nhuận ròng, Đầu tư mùa vụ
-- =================================================================================

CREATE OR REPLACE FUNCTION get_dashboard_stats(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_income DECIMAL(15, 2),           -- Tổng thu nhập
    total_expense DECIMAL(15, 2),          -- Tổng chi phí
    net_profit DECIMAL(15, 2),             -- Lợi nhuận ròng
    total_season_investment DECIMAL(15, 2), -- Tổng đầu tư vào các mùa vụ
    income_growth_rate DECIMAL(5, 2),      -- Tỷ lệ tăng trưởng thu nhập (%)
    expense_growth_rate DECIMAL(5, 2),     -- Tỷ lệ tăng trưởng chi phí (%)
    active_seasons_count INT,              -- Số mùa vụ đang hoạt động
    total_workers INT                      -- Tổng số nhân viên
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_prev_start_date DATE;
    v_prev_end_date DATE;
    v_prev_income DECIMAL(15, 2);
    v_prev_expense DECIMAL(15, 2);
BEGIN
    -- Nếu không truyền tham số, mặc định lấy tháng hiện tại
    v_start_date := COALESCE(p_start_date, DATE_TRUNC('month', CURRENT_DATE)::DATE);
    v_end_date := COALESCE(p_end_date, (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE);
    
    -- Tính khoảng thời gian tháng trước để so sánh
    v_prev_start_date := v_start_date - INTERVAL '1 month';
    v_prev_end_date := v_end_date - INTERVAL '1 month';

    RETURN QUERY
    WITH current_period AS (
        -- Tính thu nhập và chi phí trong kỳ hiện tại
        SELECT 
            COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) AS income,
            COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS expense
        FROM transactions
        WHERE transaction_date::DATE BETWEEN v_start_date AND v_end_date
    ),
    previous_period AS (
        -- Tính thu nhập và chi phí kỳ trước
        SELECT 
            COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) AS income,
            COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS expense
        FROM transactions
        WHERE transaction_date::DATE BETWEEN v_prev_start_date AND v_prev_end_date
    ),
    season_stats AS (
        -- Thống kê mùa vụ
        SELECT 
            COUNT(*) FILTER (WHERE status = 'ACTIVE') AS active_count,
            COALESCE(SUM(expected_revenue), 0) AS total_investment
        FROM seasons
    ),
    worker_stats AS (
        -- Thống kê nhân viên
        SELECT COUNT(*) AS worker_count
        FROM partners
        WHERE type = 'WORKER'
    )
    SELECT 
        cp.income AS total_income,
        cp.expense AS total_expense,
        (cp.income - cp.expense) AS net_profit,
        ss.total_investment AS total_season_investment,
        -- Tính tỷ lệ tăng trưởng thu nhập
        CASE 
            WHEN pp.income > 0 THEN ROUND(((cp.income - pp.income) / pp.income * 100)::NUMERIC, 2)
            ELSE 0
        END AS income_growth_rate,
        -- Tính tỷ lệ tăng trưởng chi phí
        CASE 
            WHEN pp.expense > 0 THEN ROUND(((cp.expense - pp.expense) / pp.expense * 100)::NUMERIC, 2)
            ELSE 0
        END AS expense_growth_rate,
        ss.active_count::INT AS active_seasons_count,
        ws.worker_count::INT AS total_workers
    FROM current_period cp
    CROSS JOIN previous_period pp
    CROSS JOIN season_stats ss
    CROSS JOIN worker_stats ws;
END;
$$;

-- =================================================================================
-- Ví dụ sử dụng:
-- =================================================================================

-- Lấy thống kê tháng hiện tại (mặc định)
-- SELECT * FROM get_dashboard_stats();

-- Lấy thống kê tháng 10/2024
-- SELECT * FROM get_dashboard_stats('2024-10-01', '2024-10-31');

-- Lấy thống kê quý 4/2024
-- SELECT * FROM get_dashboard_stats('2024-10-01', '2024-12-31');
