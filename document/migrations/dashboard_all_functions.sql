-- =================================================================================
-- MIGRATION TỔNG HỢP CHO DASHBOARD
-- Chạy file này để tạo tất cả các stored functions cần thiết
-- =================================================================================

-- =================================================================================
-- 1. FUNCTION: get_dashboard_stats
-- Lấy thống kê tổng quan (4 thẻ metrics)
-- =================================================================================

CREATE OR REPLACE FUNCTION get_dashboard_stats(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_income DECIMAL(15, 2),
    total_expense DECIMAL(15, 2),
    net_profit DECIMAL(15, 2),
    total_season_investment DECIMAL(15, 2),
    income_growth_rate DECIMAL(5, 2),
    expense_growth_rate DECIMAL(5, 2),
    active_seasons_count INT,
    total_workers INT
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
    v_start_date := COALESCE(p_start_date, DATE_TRUNC('month', CURRENT_DATE)::DATE);
    v_end_date := COALESCE(p_end_date, (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE);
    
    v_prev_start_date := v_start_date - INTERVAL '1 month';
    v_prev_end_date := v_end_date - INTERVAL '1 month';

    RETURN QUERY
    WITH current_period AS (
        SELECT 
            COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) AS income,
            COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS expense
        FROM transactions
        WHERE transaction_date::DATE BETWEEN v_start_date AND v_end_date
    ),
    previous_period AS (
        SELECT 
            COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) AS income,
            COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS expense
        FROM transactions
        WHERE transaction_date::DATE BETWEEN v_prev_start_date AND v_prev_end_date
    ),
    season_stats AS (
        SELECT 
            COUNT(*) FILTER (WHERE status = 'ACTIVE') AS active_count,
            COALESCE(SUM(expected_revenue), 0) AS total_investment
        FROM seasons
    ),
    worker_stats AS (
        SELECT COUNT(*) AS worker_count
        FROM partners
        WHERE type = 'WORKER'
    )
    SELECT 
        cp.income AS total_income,
        cp.expense AS total_expense,
        (cp.income - cp.expense) AS net_profit,
        ss.total_investment AS total_season_investment,
        CASE 
            WHEN pp.income > 0 THEN ROUND(((cp.income - pp.income) / pp.income * 100)::NUMERIC, 2)
            ELSE 0
        END AS income_growth_rate,
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
-- 2. FUNCTION: get_cash_flow_history
-- Lấy lịch sử dòng tiền (biểu đồ)
-- =================================================================================

CREATE OR REPLACE FUNCTION get_cash_flow_history(
    p_months INT DEFAULT 6
)
RETURNS TABLE (
    month_label VARCHAR(10),
    month_number INT,
    year_number INT,
    total_income DECIMAL(15, 2),
    total_expense DECIMAL(15, 2),
    net_profit DECIMAL(15, 2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH month_series AS (
        SELECT 
            generate_series(
                DATE_TRUNC('month', CURRENT_DATE) - (p_months - 1 || ' months')::INTERVAL,
                DATE_TRUNC('month', CURRENT_DATE),
                '1 month'::INTERVAL
            )::DATE AS month_start
    ),
    monthly_transactions AS (
        SELECT 
            DATE_TRUNC('month', t.transaction_date)::DATE AS month_start,
            COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS income,
            COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS expense
        FROM transactions t
        WHERE t.transaction_date >= DATE_TRUNC('month', CURRENT_DATE) - (p_months - 1 || ' months')::INTERVAL
        GROUP BY DATE_TRUNC('month', t.transaction_date)::DATE
    )
    SELECT 
        ('Th' || EXTRACT(MONTH FROM ms.month_start)::TEXT)::VARCHAR(10) AS month_label,
        EXTRACT(MONTH FROM ms.month_start)::INT AS month_number,
        EXTRACT(YEAR FROM ms.month_start)::INT AS year_number,
        COALESCE(mt.income, 0)::DECIMAL(15, 2) AS total_income,
        COALESCE(mt.expense, 0)::DECIMAL(15, 2) AS total_expense,
        (COALESCE(mt.income, 0) - COALESCE(mt.expense, 0))::DECIMAL(15, 2) AS net_profit
    FROM month_series ms
    LEFT JOIN monthly_transactions mt ON ms.month_start = mt.month_start
    ORDER BY ms.month_start ASC;
END;
$$;

-- =================================================================================
-- 3. FUNCTION: get_low_stock_items
-- Lấy danh sách vật tư sắp hết
-- =================================================================================

CREATE OR REPLACE FUNCTION get_low_stock_items(
    p_limit INT DEFAULT 10
)
RETURNS TABLE (
    item_id UUID,
    item_code VARCHAR(50),
    item_name VARCHAR(255),
    category_name VARCHAR(100),
    current_quantity DECIMAL(12, 2),
    min_stock_level DECIMAL(12, 2),
    unit_of_measure VARCHAR(50),
    shortage_amount DECIMAL(12, 2),
    shortage_percentage DECIMAL(5, 2),
    last_import_price DECIMAL(15, 2),
    thumbnail_url TEXT,
    urgency_level VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id AS item_id,
        i.inventory_code AS item_code,
        i.inventory_name AS item_name,
        COALESCE(c.category_name, 'Chưa phân loại') AS category_name,
        i.stock_quantity AS current_quantity,
        i.min_stock_level,
        COALESCE(i.unit_of_measure, 'Đơn vị') AS unit_of_measure,
        (i.min_stock_level - i.stock_quantity) AS shortage_amount,
        CASE 
            WHEN i.min_stock_level > 0 THEN 
                ROUND(((i.min_stock_level - i.stock_quantity) / i.min_stock_level * 100)::NUMERIC, 2)
            ELSE 0
        END AS shortage_percentage,
        i.last_import_price,
        NULL::TEXT AS thumbnail_url,  -- Không sử dụng vì media_files lưu binary data
        CASE 
            WHEN i.stock_quantity = 0 THEN 'CRITICAL'::VARCHAR(20)
            WHEN i.stock_quantity <= (i.min_stock_level * 0.3) THEN 'CRITICAL'::VARCHAR(20)
            WHEN i.stock_quantity <= (i.min_stock_level * 0.5) THEN 'WARNING'::VARCHAR(20)
            ELSE 'LOW'::VARCHAR(20)
        END AS urgency_level
    FROM inventory i
    LEFT JOIN categories c ON i.category_id = c.id
    WHERE i.stock_quantity <= i.min_stock_level
    ORDER BY 
        CASE 
            WHEN i.stock_quantity = 0 THEN 0
            ELSE 1
        END,
        (i.stock_quantity / NULLIF(i.min_stock_level, 0)) ASC,
        i.stock_quantity ASC
    LIMIT p_limit;
END;
$$;

-- =================================================================================
-- KIỂM TRA KẾT QUẢ
-- =================================================================================

-- Test các functions
SELECT 'Dashboard Stats' AS test_name, * FROM get_dashboard_stats();
SELECT 'Cash Flow History' AS test_name, * FROM get_cash_flow_history(6);
SELECT 'Low Stock Items' AS test_name, * FROM get_low_stock_items(5);

-- Thông báo hoàn tất
SELECT 'Migration completed successfully!' AS status;
