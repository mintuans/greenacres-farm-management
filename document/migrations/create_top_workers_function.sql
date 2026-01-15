-- =================================================================================
-- STORED FUNCTION: Lấy danh sách nhân viên có số dư lương cao nhất
-- Sắp xếp theo current_balance giảm dần (nhiều nhất ở đầu)
-- =================================================================================

CREATE OR REPLACE FUNCTION get_top_workers_by_balance(
    p_limit INT DEFAULT 10  -- Số lượng nhân viên muốn lấy (mặc định 10)
)
RETURNS TABLE (
    worker_id UUID,
    worker_code VARCHAR(50),
    worker_name VARCHAR(255),
    current_balance DECIMAL(15, 2),
    total_paid DECIMAL(15, 2),        -- Tổng đã trả
    balance_percentage DECIMAL(5, 2)  -- % số dư so với tổng
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_balance DECIMAL(15, 2);
BEGIN
    -- Tính tổng số dư của tất cả nhân viên
    SELECT COALESCE(SUM(p.current_balance), 0) INTO v_total_balance
    FROM partners p
    WHERE p.type = 'WORKER';

    RETURN QUERY
    SELECT 
        p.id AS worker_id,
        p.partner_code AS worker_code,
        p.partner_name AS worker_name,
        p.current_balance AS current_balance,
        
        -- Tính tổng đã trả cho nhân viên này
        COALESCE((
            SELECT SUM(pr.final_amount)
            FROM payrolls pr
            WHERE pr.partner_id = p.id
        ), 0) AS total_paid,
        
        -- Tính % số dư so với tổng
        CASE 
            WHEN v_total_balance > 0 THEN 
                ROUND((p.current_balance / v_total_balance * 100)::NUMERIC, 2)
            ELSE 0
        END AS balance_percentage
        
    FROM partners p
    WHERE p.type = 'WORKER'
    
    -- Sắp xếp: Số dư nhiều nhất ở đầu
    ORDER BY p.current_balance DESC
    
    LIMIT p_limit;
END;
$$;

-- =================================================================================
-- Ví dụ sử dụng:
-- =================================================================================

-- Lấy 10 nhân viên có số dư cao nhất (mặc định)
-- SELECT * FROM get_top_workers_by_balance();

-- Lấy 5 nhân viên có số dư cao nhất
-- SELECT * FROM get_top_workers_by_balance(5);

-- Lấy 3 nhân viên có số dư cao nhất
-- SELECT * FROM get_top_workers_by_balance(3);

-- =================================================================================
-- Kết quả mẫu:
-- =================================================================================
-- worker_id | worker_code | worker_name           | current_balance | total_paid   | balance_percentage
-- ----------|-------------|----------------------|-----------------|--------------|-------------------
-- uuid1     | NV-001      | Ngân hàng NN & PTNT  | 310000000.00    | 200000000.00 | 65.00
-- uuid2     | NV-002      | Đại lý phân bón Tám  | 125000000.00    | 50000000.00  | 25.00
-- uuid3     | NV-003      | Cửa hàng hạt giống   | 21000000.00     | 10000000.00  | 5.00
