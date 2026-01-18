# Tài liệu: Tự động tạo Transaction khi trả lương

## Tổng quan
Hệ thống đã được cấu hình để **tự động tạo giao dịch (transaction)** trong sổ tài chính khi bạn trả lương cho nhân viên.

## Cách hoạt động

### 1. Quy trình trả lương
```
Tạo Payroll (DRAFT) → Duyệt → Chuyển sang PAID → Tự động tạo Transaction
```

### 2. Khi nào Transaction được tạo?
Transaction sẽ được tự động tạo khi:
- Bạn tạo mới một Payroll với trạng thái `PAID`
- Hoặc bạn cập nhật Payroll từ trạng thái khác (`DRAFT`, `APPROVED`) sang `PAID`

### 3. Thông tin Transaction tự động
Khi payroll được đánh dấu là PAID, hệ thống sẽ tự động tạo:

| Trường | Giá trị |
|--------|---------|
| **Type** | `EXPENSE` (Chi tiền) |
| **Amount** | `final_amount` từ payroll |
| **Paid Amount** | `final_amount` (đã trả đủ) |
| **Partner** | Nhân viên nhận lương |
| **Category** | "Lương nhân viên" (CAT-LUONG) |
| **Transaction Date** | Ngày trả lương (payment_date) |
| **Note** | "Thanh toán lương - Phiếu lương: [Mã phiếu lương]" |

### 4. Liên kết giữa Payroll và Transaction
- Sau khi transaction được tạo, `payroll.transaction_id` sẽ được cập nhật
- Bạn có thể tra cứu giao dịch chi tiền từ phiếu lương
- Ngược lại, từ transaction có thể tìm lại phiếu lương gốc

### 5. Xử lý khi hủy Payroll
Nếu bạn chuyển payroll từ `PAID` sang `CANCELLED`:
- Transaction tương ứng sẽ bị **xóa tự động**
- Liên kết `transaction_id` sẽ được gỡ bỏ

## Lợi ích

✅ **Tự động hóa**: Không cần tạo transaction thủ công  
✅ **Chính xác**: Đảm bảo mọi khoản chi lương đều được ghi nhận  
✅ **Nhất quán**: Dữ liệu giữa payroll và transaction luôn đồng bộ  
✅ **Báo cáo**: Dễ dàng theo dõi dòng tiền chi lương trong báo cáo tài chính  

## Ví dụ sử dụng

### Tạo phiếu lương và tự động tạo transaction:
```sql
-- Tạo phiếu lương với trạng thái PAID
INSERT INTO payrolls (
    payroll_code, partner_id, total_amount, final_amount, status
) VALUES (
    'PL-20260117-001', 
    '123e4567-e89b-12d3-a456-426614174000', -- ID nhân viên
    5000000, 
    5000000, 
    'PAID' -- Trigger sẽ tự động tạo transaction
);
```

### Hoặc cập nhật payroll sang PAID:
```sql
-- Duyệt và thanh toán phiếu lương
UPDATE payrolls 
SET status = 'PAID', 
    payment_date = CURRENT_TIMESTAMP
WHERE payroll_code = 'PL-20260117-001';
-- Trigger sẽ tự động tạo transaction
```

## Kiểm tra

Sau khi trả lương, bạn có thể kiểm tra:

```sql
-- Xem payroll và transaction liên kết
SELECT 
    p.payroll_code,
    p.final_amount,
    p.status,
    t.id as transaction_id,
    t.amount,
    t.transaction_date
FROM payrolls p
LEFT JOIN transactions t ON p.transaction_id = t.id
WHERE p.payroll_code = 'PL-20260117-001';
```

## Lưu ý quan trọng

⚠️ **Category "Lương nhân viên"**: Hệ thống sẽ tự động tạo category với mã `CAT-LUONG`. Đảm bảo category này tồn tại trong database.

⚠️ **Season ID**: Transaction lương thường không gắn với season cụ thể (NULL). Nếu bạn muốn gắn lương vào season, cần custom thêm logic.

⚠️ **Trigger order**: Trigger này chạy AFTER INSERT/UPDATE, đảm bảo không xung đột với trigger cập nhật balance.

## Migration

Để áp dụng tính năng này, chạy migration:
```bash
psql -U postgres -d greenacres_farm -f backend/migrations/auto_create_transaction_on_payroll.sql
```

---
**Ngày tạo**: 2026-01-17  
**Phiên bản**: 1.0
