-- =================================================================================
-- HỆ THỐNG QUẢN TRỊ NÔNG NGHIỆP TỔNG HỢP (FARM ERP)
-- Database: PostgreSQL
-- Module: Đối tác, Sản xuất, Tài chính, Kho vận, Nhân sự (Chấm công linh hoạt)
-- =================================================================================

-- 1. KÍCH HOẠT BỘ TẠO MÃ UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =================================================================================
-- PHẦN 1: QUẢN LÝ ĐỐI TÁC & CẤU HÌNH CƠ BẢN
-- =================================================================================

-- 2. Quản lý Đối tác (Đại lý, Thương lái, Người làm thuê)
-- Nhân viên thời vụ cũng nằm ở đây với type = 'WORKER'
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_code VARCHAR(20) UNIQUE NOT NULL, -- Sửa: code -> partner_code
    partner_name VARCHAR(255) NOT NULL,       -- Sửa: name -> partner_name
    type VARCHAR(50) NOT NULL CHECK (type IN ('SUPPLIER', 'BUYER', 'WORKER')),
    phone VARCHAR(20),
    address TEXT,
    current_balance DECIMAL(15, 2) DEFAULT 0,
    thumbnail_id UUID REFERENCES media_files(id), -- Thêm ảnh đại diện
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Quản lý Đơn vị Sản xuất (Vị trí vật lý)
CREATE TABLE production_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_code VARCHAR(20) UNIQUE NOT NULL,    -- Thêm mới
    unit_name VARCHAR(100) NOT NULL,          -- Sửa: name -> unit_name
    type VARCHAR(50), -- 'CROP', 'LIVESTOCK'
    area_size DECIMAL(10, 2),
    description TEXT
);

-- 4. Quản lý Mùa vụ / Lứa nuôi
-- Đây là trung tâm để gom chi phí và tính lãi lỗ
CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES production_units(id),
    season_code VARCHAR(50) UNIQUE NOT NULL,  -- Thêm mới (VD: 'VU-MAN-2026')
    season_name VARCHAR(255) NOT NULL,        -- Sửa: name -> season_name
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    expected_revenue DECIMAL(15, 2),
    thumbnail_id UUID REFERENCES media_files(id) -- Thêm ảnh vụ mùa
);

-- 5. Danh mục Hạng mục Thu/Chi
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(50) UNIQUE NOT NULL, -- Thêm mới (VD: 'CAT-PHAN-BON')
    category_name VARCHAR(100) NOT NULL,       -- Sửa: name -> category_name
    parent_id UUID REFERENCES categories(id),
    scope VARCHAR(50) NOT NULL CHECK (scope IN ('FARM', 'PERSONAL', 'BOTH')),
    thumbnail_id UUID REFERENCES media_files(id) -- Thêm ảnh danh mục
);


-- =================================================================================
-- PHẦN 2: QUẢN LÝ TÀI CHÍNH & KHO VẬN
-- =================================================================================

-- 7. Bảng Hóa đơn & Giao dịch chính (Dòng tiền)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id), -- Giao dịch với ai (có thể NULL nếu chi tiêu vặt)
    season_id UUID REFERENCES seasons(id),   -- Tính cho vụ nào (QUAN TRỌNG ĐỂ TÍNH LÃI)
    category_id UUID REFERENCES categories(id),
    
    amount DECIMAL(15, 2) NOT NULL,          -- Tổng giá trị giao dịch
    paid_amount DECIMAL(15, 2) DEFAULT 0,    -- Số tiền thực trả ngay lúc đó
    -- Nợ = amount - paid_amount
    
    type VARCHAR(20) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    is_inventory_affected BOOLEAN DEFAULT FALSE, -- Đánh dấu nếu giao dịch này nhập hàng vào kho
    
    -- Chi tiết bổ sung cho mận/hàng hóa
    quantity DECIMAL(15, 2),
    unit VARCHAR(50),
    unit_price DECIMAL(15, 2)
);

-- 8. Bảng Chi tiết Thanh toán Nợ (Trả dần)
CREATE TABLE debt_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id), -- Trả cho hóa đơn nợ nào
    amount_paid DECIMAL(15, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT
);

-- 9. Quản lý Kho vật tư (Đã thêm giá mua và ảnh)
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_code VARCHAR(50) UNIQUE NOT NULL, 
    inventory_name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id),
    unit_of_measure VARCHAR(50), -- 'Bao', 'Kg', 'Chai'
    sku VARCHAR(100) UNIQUE,    -- Cột SKU để quét mã vạch
    stock_quantity DECIMAL(12, 2) DEFAULT 0,    -- Số lượng đang có
    min_stock_level DECIMAL(12, 2) DEFAULT 0,   -- Mức cảnh báo 
    last_import_price DECIMAL(15, 2) DEFAULT 0, -- Giá mua gần nhất
    import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Ngày nhập
    thumbnail_id UUID REFERENCES media_files(id), -- Ảnh từ media_library
    note TEXT                                   -- Ghi chú
);
-- 10. Nhật ký Xuất kho (Sử dụng vật tư)
CREATE TABLE inventory_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES inventory(id),
    season_id UUID REFERENCES seasons(id),       -- Dùng cho vụ nào (QUAN TRỌNG)
    unit_id UUID REFERENCES production_units(id), -- Dùng ở đâu
    
    quantity DECIMAL(12, 2) NOT NULL,
    purpose TEXT, -- 'Bón lót đợt 1', 'Trị bệnh nấm'
    usage_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID -- ID người nhập liệu (nếu có hệ thống user sau này)
);

-- =================================================================================
-- PHẦN 3: QUẢN LÝ NHÂN SỰ & CHẤM CÔNG (NEW MODEL)
-- Logic: Chấm công hàng ngày -> Gom thành Phiếu Lương -> Thanh toán -> Giao dịch
-- 
-- Luồng dữ liệu:
-- 1. partners (type='WORKER') - Danh sách nhân viên
-- 2. daily_work_logs - Chấm công hàng ngày (partner_id, payroll_id=NULL khi chưa thanh toán)
-- 3. payrolls - Gom các ngày công thành phiếu lương (partner_id, transaction_id=NULL khi chưa chi tiền)
-- 4. transactions - Giao dịch chi tiền thực tế (partner_id, type='EXPENSE')
-- =================================================================================

-- 11. Bảng Ca làm việc
CREATE TABLE work_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_code VARCHAR(20) UNIQUE NOT NULL, -- Thêm mới (VD: 'SHIFT-SANG')
    shift_name VARCHAR(50) NOT NULL,        -- Sửa: name -> shift_name
    start_time TIME,
    end_time TIME
);

-- 12. Bảng Loại công việc & Đơn giá
CREATE TABLE job_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_code VARCHAR(20) UNIQUE NOT NULL, -- Thêm mới (VD: 'JOB-HAI-TRAI')
    job_name VARCHAR(255) NOT NULL,       -- Sửa: name -> job_name
    base_rate DECIMAL(15, 2) DEFAULT 0,
    description TEXT
);

-- 13. Bảng Phiếu Lương / Đợt Thanh Toán
-- Dùng để GOM các ngày công lại để trả tiền một lần
CREATE TABLE payrolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_code VARCHAR(50) UNIQUE NOT NULL, -- VD: PL-202410-001
    partner_id UUID REFERENCES partners(id) NOT NULL,
    
    total_amount DECIMAL(15, 2) DEFAULT 0,   -- Tổng tiền công (tổng từ logs)
    bonus DECIMAL(15, 2) DEFAULT 0,          -- Thưởng
    deductions DECIMAL(15, 2) DEFAULT 0,     -- Khấu trừ (ứng trước, phạt)
    final_amount DECIMAL(15, 2) NOT NULL,    -- Thực nhận = total + bonus - deductions
    
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'PAID', 'CANCELLED')),
    
    -- Liên kết với giao dịch chi tiền thực tế
    transaction_id UUID REFERENCES transactions(id), 
    
    payment_date TIMESTAMP, -- Ngày trả tiền thực tế
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- 14. Bảng Nhật ký Công việc Hàng ngày (Daily Logs)
-- Chi tiết: Ai làm gì, ngày nào, số lượng bao nhiêu, giá bao nhiêu?
CREATE TABLE daily_work_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) NOT NULL,
    payroll_id UUID REFERENCES payrolls(id), -- NULL = Chưa thanh toán. Có ID = Đã gộp vào phiếu lương đó.
    
    -- Liên kết để tính chi phí sản xuất và quản lý (QUAN TRỌNG)
    season_id UUID REFERENCES seasons(id), 
    unit_id UUID REFERENCES production_units(id), 
    schedule_id UUID REFERENCES work_schedules(id), -- Link tới lịch đã đăng ký (nếu có)

    work_date DATE NOT NULL,
    shift_id UUID REFERENCES work_shifts(id),
    job_type_id UUID REFERENCES job_types(id) NOT NULL,
    
    quantity DECIMAL(12, 2) DEFAULT 1,    -- Số lượng (VD: 1 ngày, 0.5 buổi, hoặc 50 kg)
    unit VARCHAR(50) DEFAULT 'DAY',      -- 'DAY', 'KG', 'HOUR', 'SESSION'
    
    applied_rate DECIMAL(15, 2) NOT NULL, -- Đơn giá chốt tại thời điểm làm
    total_amount DECIMAL(15, 2) NOT NULL, -- = quantity * applied_rate
    
    mandays INT DEFAULT 0, -- 0: Cả ngày, 1: Nửa ngày
    
    note TEXT,
    status VARCHAR(20) DEFAULT 'DONE', -- 'DONE', 'CANCELLED', 'REJECTED', 'INPROGRESS'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Bảng Lịch làm việc (Kế hoạch)
CREATE TABLE work_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id), -- Nhân viên nào
    shift_id UUID REFERENCES work_shifts(id), -- Ca nào
    job_type_id UUID REFERENCES job_types(id), -- Dự kiến làm việc gì
    
    work_date DATE NOT NULL,
    
    -- Trạng thái: 'PLANNED' (Dự kiến), 'CONFIRMED' (Chốt), 'CANCELLED' (Hủy)
    status VARCHAR(20) DEFAULT 'PLANNED', 
    note TEXT,
    
    -- Liên kết mùa vụ
    season_id UUID REFERENCES seasons(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 16. Bảng Sự kiện Nông trại (Farm Events)
CREATE TABLE farm_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL, -- Tên sự kiện: "Thu hoạch Vườn A", "Bão số 1"
    
    -- Loại sự kiện để tô màu trên lịch
    -- HARVEST (Vàng), ISSUE (Đỏ), TASK (Xanh lá)
    event_type VARCHAR(50) CHECK (event_type IN ('HARVEST', 'ISSUE', 'TASK', 'OTHER')),
    
    start_time TIMESTAMP NOT NULL, -- Có thể là cả ngày hoặc 1 khung giờ
    end_time TIMESTAMP,
    is_all_day BOOLEAN DEFAULT TRUE,
    
    description TEXT, -- Ghi chú chi tiết
    
    -- Có thể link tới Vụ mùa hoặc Đơn vị sản xuất để biết sự kiện ở đâu
    season_id UUID REFERENCES seasons(id),
    unit_id UUID REFERENCES production_units(id)
);
-- 17. Bảng Tổng hợp Lịch trình (Consolidated Schedules)
-- Dùng để query nhanh toàn bộ sự kiện trên lịch từ nhiều nguồn khác nhau
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Phân loại nguồn: 'WORK_SHIFT' (từ work_schedules), 'FARM_EVENT' (từ farm_events)
    source_type VARCHAR(50) NOT NULL, 
    source_id UUID NOT NULL, -- ID của bản ghi gốc ở bảng tương ứng
    
    title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    
    -- Trạng thái để đồng bộ màu sắc và trạng thái xử lý
    status VARCHAR(20), 
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
-- PHẦN 4: QUẢN LÝ KHO LÝ (Gia dụng, Điện tử, Hoa kiểng)
-- =================================================================================

-- 18. Loại Kho (Phân loại kho vật lý)
CREATE TABLE warehouse_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_code VARCHAR(20) UNIQUE NOT NULL, -- VD: 'KHO-GIA-DUNG'
    warehouse_name VARCHAR(255) NOT NULL,        -- VD: 'Kho Gia dụng'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. Danh mục vật phẩm trong Kho (Gộp chung Gia dụng, Điện tử, Hoa kiểng...)
CREATE TABLE warehouse_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_type_id UUID REFERENCES warehouse_types(id) NOT NULL,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE, -- Cột SKU để quét mã vạch Check-in/Check-out
    item_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(12, 2) DEFAULT 0,
    unit VARCHAR(50),
    price DECIMAL(15, 2) DEFAULT 0,
    location VARCHAR(255),   -- Vị trí trong kho (Kệ A1, Tầng 2...)
    thumbnail_id UUID REFERENCES media_files(id),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. Nhật ký Nhập/Xuất Kho (Inventory History / Check-in Check-out)
CREATE TABLE warehouse_item_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES warehouse_items(id) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('CHECK_IN', 'CHECK_OUT')),
    quantity DECIMAL(12, 2) NOT NULL,
    price DECIMAL(15, 2),          -- Giá tại thời điểm nhập/xuất
    partner_id UUID REFERENCES partners(id), -- Giao dịch với đối tác nào
    sku_scanned VARCHAR(100),      -- SKU thực tế lúc quét để đối chiếu
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID                -- ID người thực hiện
);

-- =================================================================================
-- VIEW: Tổng hợp Lịch trình từ nhiều nguồn
-- Kết hợp dữ liệu từ work_schedules (status = DONE) và farm_events
-- =================================================================================
CREATE OR REPLACE VIEW view_daily_schedules AS
-- 1. Lấy dữ liệu từ bảng Kế hoạch làm việc (Ai làm, ca nào, việc gì)
-- Chỉ lấy các bản ghi đã hoàn thành (DONE)
SELECT 
    ws.id AS event_id,
    'WORK_SHIFT'::VARCHAR(50) AS event_type,
    (p.partner_name || ' - ' || j.job_name)::TEXT AS title,
    ws.work_date AS event_date,
    s.start_time,
    s.end_time,
    ws.status,
    ws.note AS description,
    '#13ec49'::VARCHAR(20) AS display_color, -- Màu xanh cho công việc
    ws.partner_id,
    ws.season_id,
    p.partner_name,
    j.job_name,
    s.shift_name
FROM work_schedules ws
JOIN partners p ON ws.partner_id = p.id
JOIN work_shifts s ON ws.shift_id = s.id
JOIN job_types j ON ws.job_type_id = j.id
WHERE ws.status = 'DONE'

UNION ALL

-- 2. Lấy dữ liệu từ bảng Sự kiện nông trại (Thu hoạch, vấn đề...)
SELECT 
    fe.id AS event_id,
    'FARM_EVENT'::VARCHAR(50) AS event_type,
    fe.title::TEXT,
    fe.start_time::DATE AS event_date,
    fe.start_time::TIME AS start_time,
    fe.end_time::TIME AS end_time,
    'CONFIRMED'::VARCHAR(20) AS status,
    fe.description,
    CASE 
        WHEN fe.event_type = 'HARVEST' THEN '#fbbf24' -- Vàng cho thu hoạch
        WHEN fe.event_type = 'ISSUE' THEN '#ef4444'   -- Đỏ cho vấn đề
        WHEN fe.event_type = 'TASK' THEN '#10b981'    -- Xanh lục cho công việc
        ELSE '#3b82f6'                                -- Xanh dương cho khác
    END AS display_color,
    NULL::UUID AS partner_id,
    fe.season_id,
    NULL::VARCHAR AS partner_name,
    NULL::VARCHAR AS job_name,
    NULL::VARCHAR AS shift_name
FROM farm_events fe;

-- =================================================================================
-- PHẦN 5: CÁC STORED PROCEDURES / FUNCTIONS (NGHIỆP VỤ)
-- =================================================================================

-- 1. Chuyển từ Lịch làm việc sang Nhật ký công việc (Daily Log)
-- Chạy khi xác nhận nhân viên đã đi làm theo lịch (Có thể gọi thủ công để chốt mandays)
CREATE OR REPLACE FUNCTION confirm_schedule_to_log(p_schedule_id UUID, p_mandays INT DEFAULT 0)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_rate DECIMAL(15, 2);
    v_status VARCHAR(20);
BEGIN
    -- Lấy đơn giá và trạng thái hiện tại
    SELECT 
        COALESCE(jt.base_rate, 0),
        CASE 
            WHEN ws.status = 'PLANNED' THEN 'INPROGRESS'
            WHEN ws.status = 'CONFIRMED' THEN 'DONE'
            WHEN ws.status = 'CANCELLED' THEN 'CANCELLED'
            ELSE 'INPROGRESS'
        END
    INTO v_rate, v_status
    FROM work_schedules ws
    LEFT JOIN job_types jt ON ws.job_type_id = jt.id
    WHERE ws.id = p_schedule_id;

    -- Kiểm tra xem đã có log chưa
    SELECT id INTO v_log_id FROM daily_work_logs WHERE schedule_id = p_schedule_id;

    IF v_log_id IS NOT NULL THEN
        -- Cập nhật log hiện có
        UPDATE daily_work_logs SET
            applied_rate = v_rate,
            mandays = p_mandays,
            total_amount = CASE 
                WHEN p_mandays = 1 THEN v_rate * 0.5 
                ELSE v_rate 
            END,
            status = 'DONE' -- Khi gọi function confirm thì ép về DONE
        WHERE id = v_log_id;
        
        -- Cập nhật trạng thái lịch
        UPDATE work_schedules SET status = 'CONFIRMED' WHERE id = p_schedule_id;
    ELSE
        -- Chèn mới nếu chưa có (trường hợp hiếm nếu trigger hoạt động tốt)
        INSERT INTO daily_work_logs (
            partner_id, schedule_id, work_date, shift_id, job_type_id, 
            applied_rate, mandays, quantity, total_amount, season_id, status
        )
        SELECT 
            partner_id, id, work_date, shift_id, job_type_id, 
            v_rate, p_mandays, 1.0,
            CASE WHEN p_mandays = 1 THEN v_rate * 0.5 ELSE v_rate END,
            season_id, 'DONE'
        FROM work_schedules
        WHERE id = p_schedule_id
        RETURNING id INTO v_log_id;

        UPDATE work_schedules SET status = 'CONFIRMED' WHERE id = p_schedule_id;
    END IF;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;


-- 2. Tính lương và tạo Phiếu lương từ Nhật ký công việc
-- Chạy khi bấm nút "Tính lương" trên record của Daily Work Log
CREATE OR REPLACE FUNCTION calculate_payroll_from_log(p_log_id UUID)
RETURNS UUID AS $$
DECLARE
    v_payroll_id UUID;
    v_payroll_code VARCHAR(50);
    v_log_record RECORD;
BEGIN
    -- Lấy thông tin nhật ký
    SELECT * INTO v_log_record FROM daily_work_logs WHERE id = p_log_id;
    
    -- Kiểm tra nếu đã có lương rồi thì không tạo nữa
    IF v_log_record.payroll_id IS NOT NULL THEN
        RETURN v_log_record.payroll_id;
    END IF;

    -- Tạo mã phiếu lương tự động (PL + Ngày + 4 số ngẫu nhiên)
    v_payroll_code := 'PL-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || floor(random() * 9000 + 1000)::text;

    -- Tạo phiếu lương
    INSERT INTO payrolls (
        payroll_code,
        partner_id,
        total_amount,
        final_amount,
        status
    )
    VALUES (
        v_payroll_code,
        v_log_record.partner_id,
        v_log_record.total_amount,
        v_log_record.total_amount, -- Mặc định chưa có thưởng/phạt
        'DRAFT'
    )
    RETURNING id INTO v_payroll_id;

    -- Cập nhật ngược lại bảng nhật ký để biết đã gom vào phiếu lương nào
    UPDATE daily_work_logs 
    SET payroll_id = v_payroll_id 
    WHERE id = p_log_id;

    RETURN v_payroll_id;
END;
$$ LANGUAGE plpgsql;


-- 3. Tính lương gộp cho nhiều bản ghi Nhật ký công việc
-- Nhận vào một mảng các UUID của nhật ký
CREATE OR REPLACE FUNCTION calculate_payroll_bulk(p_log_ids UUID[])
RETURNS UUID AS $$
DECLARE
    v_payroll_id UUID;
    v_payroll_code VARCHAR(50);
    v_total_amount DECIMAL(15, 2);
    v_partner_id UUID;
BEGIN
    -- Kiểm tra xem tất cả các log có cùng 1 nhân viên không
    SELECT partner_id INTO v_partner_id
    FROM daily_work_logs
    WHERE id = ANY(p_log_ids)
    GROUP BY partner_id
    HAVING COUNT(DISTINCT partner_id) = 1;

    IF v_partner_id IS NULL THEN
        RAISE EXCEPTION 'Tất cả các ngày công phải thuộc cùng một nhân viên để gộp phiếu lương.';
    END IF;

    -- Tính tổng tiền
    SELECT SUM(total_amount) INTO v_total_amount
    FROM daily_work_logs
    WHERE id = ANY(p_log_ids) AND payroll_id IS NULL;

    IF v_total_amount IS NULL OR v_total_amount = 0 THEN
        RAISE EXCEPTION 'Không có dữ liệu hợp lệ hoặc các ngày công đã được tính lương.';
    END IF;

    -- Tạo mã phiếu lương
    v_payroll_code := 'PL-GOP-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || floor(random() * 9000 + 1000)::text;

    -- Tạo phiếu lương
    INSERT INTO payrolls (
        payroll_code,
        partner_id,
        total_amount,
        final_amount,
        status
    )
    VALUES (
        v_payroll_code,
        v_partner_id,
        v_total_amount,
        v_total_amount,
        'DRAFT'
    )
    RETURNING id INTO v_payroll_id;

    -- Cập nhật ngược lại bảng nhật ký
    UPDATE daily_work_logs 
    SET payroll_id = v_payroll_id 
    WHERE id = ANY(p_log_ids);

    RETURN v_payroll_id;
END;
$$ LANGUAGE plpgsql;


-- 3. Trigger tự động đồng bộ Log khi tạo/sửa/xóa lịch làm việc
CREATE OR REPLACE FUNCTION trg_sync_schedule_to_log()
RETURNS TRIGGER AS $$
DECLARE
    v_log_status VARCHAR(20);
    v_rate DECIMAL(15, 2);
BEGIN
    IF (TG_OP = 'DELETE') THEN
        -- Khi xóa lịch, chuyển trạng thái log sang REJECTED và gỡ liên kết schedule_id
        UPDATE daily_work_logs 
        SET status = 'REJECTED', schedule_id = NULL 
        WHERE schedule_id = OLD.id;
        RETURN OLD;
    END IF;

    -- Ánh xạ trạng thái từ Lịch sang Log
    v_log_status := CASE 
        WHEN NEW.status = 'PLANNED' THEN 'INPROGRESS'
        WHEN NEW.status = 'CONFIRMED' THEN 'DONE'
        WHEN NEW.status = 'CANCELLED' THEN 'CANCELLED'
        ELSE 'INPROGRESS'
    END;

    -- Lấy đơn giá hiện tại
    SELECT COALESCE(jt.base_rate, 0) INTO v_rate
    FROM job_types jt
    WHERE jt.id = NEW.job_type_id;

    IF (TG_OP = 'INSERT') THEN
        -- Tự động tạo Log ở trạng thái INPROGRESS khi thêm Lịch mới
        INSERT INTO daily_work_logs (
            partner_id, schedule_id, work_date, shift_id, job_type_id, 
            applied_rate, mandays, quantity, total_amount, season_id, status
        )
        VALUES (
            NEW.partner_id, NEW.id, NEW.work_date, NEW.shift_id, NEW.job_type_id,
            v_rate, 0, 1.0, v_rate, NEW.season_id, v_log_status
        );
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Cập nhật bản ghi Log tương ứng
        IF EXISTS (SELECT 1 FROM daily_work_logs WHERE schedule_id = NEW.id) THEN
            UPDATE daily_work_logs SET
                work_date = NEW.work_date,
                shift_id = NEW.shift_id,
                job_type_id = NEW.job_type_id,
                applied_rate = v_rate,
                total_amount = CASE 
                    WHEN mandays = 1 THEN v_rate * 0.5 
                    ELSE v_rate 
                END,
                season_id = NEW.season_id,
                status = v_log_status
            WHERE schedule_id = NEW.id;
        ELSE
            -- Nếu chưa có log (do dữ liệu cũ) thì tạo mới
            INSERT INTO daily_work_logs (
                partner_id, schedule_id, work_date, shift_id, job_type_id, 
                applied_rate, mandays, quantity, total_amount, season_id, status
            )
            VALUES (
                NEW.partner_id, NEW.id, NEW.work_date, NEW.shift_id, NEW.job_type_id,
                v_rate, 0, 1.0, v_rate, NEW.season_id, v_log_status
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS work_schedule_auto_log_trigger ON work_schedules;
CREATE TRIGGER work_schedule_auto_log_trigger
AFTER INSERT OR UPDATE OR DELETE ON work_schedules
FOR EACH ROW
EXECUTE FUNCTION trg_sync_schedule_to_log();

-- 4. Tự động cập nhật số dư Đối tác (Nhân viên) dựa trên Phiếu lương
-- 1. Hàm cập nhật số dư khi có Giao dịch (Transaction)
CREATE OR REPLACE FUNCTION trg_update_partner_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Nếu chi tiền (EXPENSE) => Số dư nợ giảm đi
        IF (NEW.type = 'EXPENSE') THEN
            UPDATE partners SET current_balance = current_balance - NEW.amount WHERE id = NEW.partner_id;
        -- Nếu thu tiền (INCOME) => Số dư nợ tăng lên
        ELSIF (NEW.type = 'INCOME') THEN
            UPDATE partners SET current_balance = current_balance + NEW.amount WHERE id = NEW.partner_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Hoàn lại số cũ
        IF (OLD.type = 'EXPENSE') THEN
            UPDATE partners SET current_balance = current_balance + OLD.amount WHERE id = OLD.partner_id;
        ELSIF (OLD.type = 'INCOME') THEN
            UPDATE partners SET current_balance = current_balance - OLD.amount WHERE id = OLD.partner_id;
        END IF;
        -- Cộng số mới
        IF (NEW.type = 'EXPENSE') THEN
            UPDATE partners SET current_balance = current_balance - NEW.amount WHERE id = NEW.partner_id;
        ELSIF (NEW.type = 'INCOME') THEN
            UPDATE partners SET current_balance = current_balance + NEW.amount WHERE id = NEW.partner_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        -- Khi xóa giao dịch => Giao dịch chi mất đi thì nợ phải tăng lại
        IF (OLD.type = 'EXPENSE') THEN
            UPDATE partners SET current_balance = current_balance + OLD.amount WHERE id = OLD.partner_id;
        ELSIF (OLD.type = 'INCOME') THEN
            UPDATE partners SET current_balance = current_balance - OLD.amount WHERE id = OLD.partner_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Đăng ký Trigger cho bảng transactions
DROP TRIGGER IF EXISTS trg_transaction_balance_sync ON transactions;
CREATE TRIGGER trg_transaction_balance_sync
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION trg_update_partner_balance_on_transaction();

-- 5. Hàm lấy danh sách giao dịch theo tháng/năm
CREATE OR REPLACE FUNCTION get_transactions_by_month(
    p_month integer,
    p_year integer,
    p_season_id uuid default null
)
RETURNS TABLE (
    id uuid,
    partner_id uuid,
    season_id uuid,
    category_id uuid,
    amount numeric,
    paid_amount numeric,
    type varchar,
    transaction_date timestamp with time zone,
    note text,
    is_inventory_affected boolean,
    quantity numeric,
    unit varchar,
    unit_price numeric,
    partner_name varchar,
    category_name varchar,
    category_code varchar,
    season_name varchar
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.partner_id, t.season_id, t.category_id, t.amount, t.paid_amount, 
           t.type::varchar, t.transaction_date, t.note, t.is_inventory_affected,
           t.quantity, t.unit, t.unit_price,
           p.partner_name, c.category_name, c.category_code, s.season_name
    FROM transactions t
    LEFT JOIN partners p ON t.partner_id = p.id
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN seasons s ON t.season_id = s.id
    WHERE EXTRACT(MONTH FROM t.transaction_date) = p_month
      AND EXTRACT(YEAR FROM t.transaction_date) = p_year
      AND (p_season_id IS NULL OR t.season_id = p_season_id)
    ORDER BY t.transaction_date DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. Tự động tạo Transaction khi trả lương (Payroll)
-- Khi payroll chuyển sang trạng thái PAID, tự động tạo transaction chi tiền
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
                NULL, -- Lương thường không gắn với season cụ thể
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
    
    -- Nếu payroll bị hủy (CANCELLED), xóa transaction tương ứng
    IF (TG_OP = 'UPDATE' AND OLD.status = 'PAID' AND NEW.status = 'CANCELLED') THEN
        IF NEW.transaction_id IS NOT NULL THEN
            DELETE FROM transactions WHERE id = NEW.transaction_id;
            UPDATE payrolls SET transaction_id = NULL WHERE id = NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payroll_auto_transaction_trigger ON payrolls;
CREATE TRIGGER payroll_auto_transaction_trigger
AFTER INSERT OR UPDATE ON payrolls
FOR EACH ROW
EXECUTE FUNCTION trg_auto_create_transaction_on_payroll();

-- =================================================================================
-- HẾT
-- =================================================================================
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
