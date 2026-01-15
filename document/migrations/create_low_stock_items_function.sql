-- =================================================================================
-- STORED FUNCTION: Lấy danh sách vật tư sắp hết
-- Lọc các vật tư có số lượng <= mức cảnh báo (min_stock_level)
-- Sắp xếp theo mức độ thiếu hụt (vật tư nào ít nhất ở đầu)
-- =================================================================================

CREATE OR REPLACE FUNCTION get_low_stock_items(
    p_limit INT DEFAULT 10  -- Số lượng item muốn lấy (mặc định 10)
)
RETURNS TABLE (
    item_id UUID,
    item_code VARCHAR(50),
    item_name VARCHAR(255),
    category_name VARCHAR(100),
    current_quantity DECIMAL(12, 2),
    min_stock_level DECIMAL(12, 2),
    unit_of_measure VARCHAR(50),
    shortage_amount DECIMAL(12, 2),    -- Số lượng thiếu = min - current
    shortage_percentage DECIMAL(5, 2), -- % thiếu hụt
    last_import_price DECIMAL(15, 2),
    thumbnail_url TEXT,
    urgency_level VARCHAR(20)          -- 'CRITICAL', 'WARNING', 'LOW'
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
        
        -- Tính số lượng thiếu
        (i.min_stock_level - i.stock_quantity) AS shortage_amount,
        
        -- Tính % thiếu hụt
        CASE 
            WHEN i.min_stock_level > 0 THEN 
                ROUND(((i.min_stock_level - i.stock_quantity) / i.min_stock_level * 100)::NUMERIC, 2)
            ELSE 0
        END AS shortage_percentage,
        
        i.last_import_price,
        
        -- Lấy URL thumbnail (nếu có)
        CASE 
            WHEN i.thumbnail_id IS NOT NULL THEN 
                (SELECT file_path FROM media_files WHERE id = i.thumbnail_id)
            ELSE NULL
        END AS thumbnail_url,
        
        -- Xác định mức độ khẩn cấp
        CASE 
            WHEN i.stock_quantity = 0 THEN 'CRITICAL'::VARCHAR(20)
            WHEN i.stock_quantity <= (i.min_stock_level * 0.3) THEN 'CRITICAL'::VARCHAR(20)
            WHEN i.stock_quantity <= (i.min_stock_level * 0.5) THEN 'WARNING'::VARCHAR(20)
            ELSE 'LOW'::VARCHAR(20)
        END AS urgency_level
        
    FROM inventory i
    LEFT JOIN categories c ON i.category_id = c.id
    
    -- Chỉ lấy các vật tư có số lượng <= mức cảnh báo
    WHERE i.stock_quantity <= i.min_stock_level
    
    -- Sắp xếp: Vật tư nào ít nhất (thiếu nhiều nhất) ở đầu
    ORDER BY 
        CASE 
            WHEN i.stock_quantity = 0 THEN 0  -- Hết hàng lên đầu
            ELSE 1
        END,
        (i.stock_quantity / NULLIF(i.min_stock_level, 0)) ASC,  -- Tỷ lệ còn/cần (nhỏ nhất trước)
        i.stock_quantity ASC  -- Số lượng ít nhất trước
    
    LIMIT p_limit;
END;
$$;

-- =================================================================================
-- Ví dụ sử dụng:
-- =================================================================================

-- Lấy 10 vật tư sắp hết (mặc định)
-- SELECT * FROM get_low_stock_items();

-- Lấy 5 vật tư sắp hết
-- SELECT * FROM get_low_stock_items(5);

-- Lấy tất cả vật tư sắp hết
-- SELECT * FROM get_low_stock_items(999);

-- =================================================================================
-- Kết quả mẫu:
-- =================================================================================
-- item_id | item_code    | item_name           | category_name | current_quantity | min_stock_level | unit_of_measure | shortage_amount | shortage_percentage | urgency_level
-- --------|--------------|---------------------|---------------|------------------|-----------------|-----------------|-----------------|---------------------|---------------
-- uuid1   | INV-001      | Phân bón NPK 20-20  | Phân bón      | 0.00             | 50.00           | Bao               | 50.00           | 100.00              | CRITICAL
-- uuid2   | INV-002      | Thuốc trừ sâu Bio  | Thuốc BVTV    | 2.00             | 20.00           | Chai              | 18.00           | 90.00               | CRITICAL
-- uuid3   | INV-003      | Hạt giống ngô       | Hạt giống     | 15.00            | 30.00           | Kg                | 15.00           | 50.00               | WARNING
