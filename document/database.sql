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
    is_inventory_affected BOOLEAN DEFAULT FALSE -- Đánh dấu nếu giao dịch này nhập hàng vào kho
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
    
    stock_quantity DECIMAL(12, 2) DEFAULT 0,    -- Số lượng đang có
    min_stock_level DECIMAL(12, 2) DEFAULT 0,   -- Mức cảnh báo 
    last_import_price DECIMAL(15, 2) DEFAULT 0, -- Giá mua gần nhất
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

-- 18. Kho Gia dụng
CREATE TABLE warehouse_household (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code VARCHAR(20) UNIQUE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity DECIMAL(12, 2) DEFAULT 0,
    unit VARCHAR(50),
    price DECIMAL(15, 2) DEFAULT 0,
    location VARCHAR(255),
    thumbnail_id UUID REFERENCES media_files(id),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. Kho Điện tử
CREATE TABLE warehouse_electronics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code VARCHAR(20) UNIQUE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity DECIMAL(12, 2) DEFAULT 0,
    unit VARCHAR(50),
    price DECIMAL(15, 2) DEFAULT 0,
    location VARCHAR(255),
    thumbnail_id UUID REFERENCES media_files(id),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. Kho Hoa kiểng
CREATE TABLE warehouse_plants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code VARCHAR(20) UNIQUE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity DECIMAL(12, 2) DEFAULT 0,
    unit VARCHAR(50),
    price DECIMAL(15, 2) DEFAULT 0,
    location VARCHAR(255),
    thumbnail_id UUID REFERENCES media_files(id),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION get_daily_schedules(target_date DATE)
RETURNS TABLE (
    event_id UUID,
    event_type VARCHAR(50), -- 'WORK_SHIFT' hoặc 'FARM_EVENT'
    title TEXT,
    start_time TIME,
    end_time TIME,
    status VARCHAR(20),
    description TEXT,
    display_color VARCHAR(20) -- Màu sắc gợi ý cho Frontend
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    -- 1. Lấy dữ liệu từ bảng Kế hoạch làm việc (Ai làm, ca nào, việc gì)
    SELECT 
        ws.id AS event_id,
        'WORK_SHIFT'::VARCHAR(50) AS event_type,
        (p.partner_name || ' - ' || j.job_name)::TEXT AS title,
        s.start_time,
        s.end_time,
        ws.status,
        ws.note AS description,
        '#13ec49'::VARCHAR(20) AS display_color -- Màu xanh cho công việc
    FROM work_schedules ws
    JOIN partners p ON ws.partner_id = p.id
    JOIN work_shifts s ON ws.shift_id = s.id
    JOIN job_types j ON ws.job_type_id = j.id
    WHERE ws.work_date = target_date

    UNION ALL

    -- 2. Lấy dữ liệu từ bảng Sự kiện nông trại (Thu hoạch, vấn đề...)
    SELECT 
        fe.id AS event_id,
        'FARM_EVENT'::VARCHAR(50) AS event_type,
        fe.title::TEXT,
        fe.start_time::TIME,
        fe.end_time::TIME,
        'CONFIRMED'::VARCHAR(20) AS status,
        fe.description,
        CASE 
            WHEN fe.event_type = 'HARVEST' THEN '#fbbf24' -- Vàng cho thu hoạch
            WHEN fe.event_type = 'ISSUE' THEN '#ef4444'   -- Đỏ cho vấn đề
            ELSE '#3b82f6'                                -- Xanh dương cho khác
        END AS display_color
    FROM farm_events fe
    WHERE fe.start_time::DATE = target_date;
END;
$$;

-- =================================================================================
-- PHẦN 5: CÁC STORED PROCEDURES / FUNCTIONS (NGHIỆP VỤ)
-- =================================================================================

-- 1. Chuyển từ Lịch làm việc sang Nhật ký công việc (Daily Log)
-- Chạy khi xác nhận nhân viên đã đi làm theo lịch
CREATE OR REPLACE FUNCTION confirm_schedule_to_log(p_schedule_id UUID, p_mandays INT DEFAULT 0)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_rate DECIMAL(15, 2);
BEGIN
    -- Lấy đơn giá hiện tại từ loại công việc
    SELECT jt.base_rate INTO v_rate
    FROM work_schedules ws
    JOIN job_types jt ON ws.job_type_id = jt.id
    WHERE ws.id = p_schedule_id;

    -- Chèn vào nhật ký làm việc
    INSERT INTO daily_work_logs (
        partner_id, 
        schedule_id, 
        work_date, 
        shift_id, 
        job_type_id, 
        applied_rate,
        mandays,
        quantity,
        total_amount
    )
    SELECT 
        partner_id, 
        id, 
        work_date, 
        shift_id, 
        job_type_id, 
        v_rate,
        p_mandays,
        1.0, -- Mặc định quantity là 1
        CASE 
            WHEN p_mandays = 1 THEN v_rate * 0.5 -- Nửa ngày
            ELSE v_rate -- Cả ngày (0)
        END
    FROM work_schedules
    WHERE id = p_schedule_id
    RETURNING id INTO v_log_id;

    -- Cập nhật trạng thái lịch
    UPDATE work_schedules SET status = 'CONFIRMED' WHERE id = p_schedule_id;

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

    IF v_total_amount IS NULL OR v_total_amount === 0 THEN
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


-- 3. Trigger tự động chốt công khi đổi trạng thái lịch sang CONFIRMED
-- Giúp đồng bộ dữ liệu dù bạn sửa ở màn hình nào
CREATE OR REPLACE FUNCTION trg_auto_log_on_confirm()
RETURNS TRIGGER AS $$
BEGIN
    -- Nếu trạng thái mới là 'CONFIRMED' và trạng thái cũ khác 'CONFIRMED'
    IF (NEW.status = 'CONFIRMED' AND (OLD.status IS NULL OR OLD.status <> 'CONFIRMED')) THEN
        -- Kiểm tra xem đã có log chưa để tránh tạo trùng bản ghi
        IF NOT EXISTS (SELECT 1 FROM daily_work_logs WHERE schedule_id = NEW.id) THEN
            PERFORM confirm_schedule_to_log(NEW.id, 0);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER work_schedule_auto_log_trigger
AFTER UPDATE OR INSERT ON work_schedules
FOR EACH ROW
EXECUTE FUNCTION trg_auto_log_on_confirm();

-- 4. Tự động cập nhật số dư Đối tác (Nhân viên) dựa trên Phiếu lương
CREATE OR REPLACE FUNCTION trg_update_partner_balance_on_payroll()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Khi tạo phiếu lương mới (mặc định không phải CANCELLED)
        IF (NEW.status <> 'CANCELLED') THEN
            UPDATE partners SET current_balance = current_balance + NEW.final_amount WHERE id = NEW.partner_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Trừ số cũ (nếu cũ không phải CANCELLED)
        IF (OLD.status <> 'CANCELLED') THEN
            UPDATE partners SET current_balance = current_balance - OLD.final_amount WHERE id = OLD.partner_id;
        END IF;
        -- Cộng số mới (nếu mới không phải CANCELLED)
        IF (NEW.status <> 'CANCELLED') THEN
            UPDATE partners SET current_balance = current_balance + NEW.final_amount WHERE id = NEW.partner_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        -- Khi xóa phiếu lương (nếu không phải CANCELLED)
        IF (OLD.status <> 'CANCELLED') THEN
            UPDATE partners SET current_balance = current_balance - OLD.final_amount WHERE id = OLD.partner_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payroll_balance_sync_trigger
AFTER INSERT OR UPDATE OR DELETE ON payrolls
FOR EACH ROW
EXECUTE FUNCTION trg_update_partner_balance_on_payroll();

-- =================================================================================
-- HẾT
-- =================================================================================
