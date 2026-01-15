-- =================================================================================
-- STORED FUNCTION: Lấy lịch sử dòng tiền theo tháng
-- Trả về Thu nhập và Chi phí của N tháng gần nhất
-- =================================================================================

CREATE OR REPLACE FUNCTION get_cash_flow_history(
    p_months INT DEFAULT 6  -- Số tháng muốn lấy (mặc định 6 tháng)
)
RETURNS TABLE (
    month_label VARCHAR(10),      -- Nhãn tháng: "Th5", "Th6"...
    month_number INT,              -- Số tháng: 1-12
    year_number INT,               -- Năm: 2024, 2025...
    total_income DECIMAL(15, 2),   -- Tổng thu nhập trong tháng
    total_expense DECIMAL(15, 2),  -- Tổng chi phí trong tháng
    net_profit DECIMAL(15, 2)      -- Lợi nhuận ròng
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH month_series AS (
        -- Tạo series N tháng gần nhất
        SELECT 
            generate_series(
                DATE_TRUNC('month', CURRENT_DATE) - (p_months - 1 || ' months')::INTERVAL,
                DATE_TRUNC('month', CURRENT_DATE),
                '1 month'::INTERVAL
            )::DATE AS month_start
    ),
    monthly_transactions AS (
        -- Tính tổng thu chi theo từng tháng
        SELECT 
            DATE_TRUNC('month', t.transaction_date)::DATE AS month_start,
            COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS income,
            COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS expense
        FROM transactions t
        WHERE t.transaction_date >= DATE_TRUNC('month', CURRENT_DATE) - (p_months - 1 || ' months')::INTERVAL
        GROUP BY DATE_TRUNC('month', t.transaction_date)::DATE
    )
    SELECT 
        'Th' || EXTRACT(MONTH FROM ms.month_start)::VARCHAR AS month_label,
        EXTRACT(MONTH FROM ms.month_start)::INT AS month_number,
        EXTRACT(YEAR FROM ms.month_start)::INT AS year_number,
        COALESCE(mt.income, 0) AS total_income,
        COALESCE(mt.expense, 0) AS total_expense,
        COALESCE(mt.income, 0) - COALESCE(mt.expense, 0) AS net_profit
    FROM month_series ms
    LEFT JOIN monthly_transactions mt ON ms.month_start = mt.month_start
    ORDER BY ms.month_start ASC;
END;
$$;

-- =================================================================================
-- Ví dụ sử dụng:
-- =================================================================================

-- Lấy 6 tháng gần nhất (mặc định)
-- SELECT * FROM get_cash_flow_history();

-- Lấy 12 tháng gần nhất
-- SELECT * FROM get_cash_flow_history(12);

-- Lấy 3 tháng gần nhất
-- SELECT * FROM get_cash_flow_history(3);

-- =================================================================================
-- Kết quả mẫu:
-- =================================================================================
-- month_label | month_number | year_number | total_income  | total_expense | net_profit
-- ------------|--------------|-------------|---------------|---------------|------------
-- Th5         | 5            | 2024        | 120000000.00  | 85000000.00   | 35000000.00
-- Th6         | 6            | 2024        | 150000000.00  | 95000000.00   | 55000000.00
-- Th7         | 7            | 2024        | 180000000.00  | 75000000.00   | 105000000.00
-- Th8         | 8            | 2024        | 135000000.00  | 110000000.00  | 25000000.00
-- Th9         | 9            | 2024        | 200000000.00  | 90000000.00   | 110000000.00
-- Th10        | 10           | 2024        | 220000000.00  | 125000000.00  | 95000000.00
