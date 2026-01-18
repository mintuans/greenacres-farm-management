# Template Import Transactions - Hướng dẫn

## Cấu trúc file Excel

### Sheet 1: TRANSACTIONS_DATA

| partner_code | season_code | category_code | amount | paid_amount | type | transaction_date | note | is_inventory_affected |
|--------------|-------------|---------------|--------|-------------|------|------------------|------|----------------------|
| PT-001 | VU-MAN-2026 | CAT-PHAN-BON | 5000000 | 5000000 | EXPENSE | 2026-01-15 | Mua phân bón NPK | TRUE |
| PT-002 | VU-MAN-2026 | CAT-THUOC-BVTV | 2500000 | 2000000 | EXPENSE | 2026-01-16 | Mua thuốc trừ sâu, còn nợ 500k | TRUE |
| PT-003 | VU-MAN-2026 | CAT-BAN-TRAI | 15000000 | 15000000 | INCOME | 2026-01-17 | Bán 500kg mận | FALSE |
| | | CAT-CHI-VAT | 50000 | 50000 | EXPENSE | 2026-01-17 | Chi tiêu vặt | FALSE |
| PT-001 | | CAT-TRA-NO | 500000 | 500000 | EXPENSE | 2026-01-18 | Trả nợ phân bón | FALSE |

---

## Chi tiết từng cột

### 1. partner_code (Mã đối tác)
- **Bắt buộc**: ❌ Không
- **Kiểu**: TEXT
- **Ví dụ**: `PT-001`, `PT-002`, `BUYER-001`
- **Lưu ý**: 
  - Để trống nếu là chi tiêu vặt (không liên quan đến đối tác)
  - Phải tồn tại trong bảng `partners`
  - Hệ thống sẽ tự động tìm `partner_id` từ `partner_code`

### 2. season_code (Mã mùa vụ)
- **Bắt buộc**: ❌ Không
- **Kiểu**: TEXT
- **Ví dụ**: `VU-MAN-2026`, `VU-LUA-2026-1`
- **Lưu ý**:
  - Để trống nếu không liên quan đến mùa vụ cụ thể
  - Phải tồn tại trong bảng `seasons`
  - Quan trọng để tính lãi/lỗ theo mùa vụ

### 3. category_code (Mã danh mục)
- **Bắt buộc**: ❌ Không (nhưng nên có)
- **Kiểu**: TEXT
- **Ví dụ**: `CAT-PHAN-BON`, `CAT-THUOC-BVTV`, `CAT-BAN-TRAI`
- **Lưu ý**:
  - Phải tồn tại trong bảng `categories`
  - Giúp phân loại giao dịch

### 4. amount (Tổng giá trị)
- **Bắt buộc**: ✅ Bắt buộc
- **Kiểu**: NUMBER (DECIMAL)
- **Ví dụ**: `5000000`, `2500000.50`
- **Lưu ý**:
  - Không có dấu phân cách hàng nghìn
  - Dùng dấu chấm (.) cho số thập phân
  - Luôn là số dương

### 5. paid_amount (Số tiền đã trả)
- **Bắt buộc**: ❌ Không
- **Kiểu**: NUMBER (DECIMAL)
- **Ví dụ**: `5000000`, `2000000`
- **Mặc định**: `0` nếu để trống
- **Lưu ý**:
  - Nếu `paid_amount < amount` → Còn nợ
  - Nếu `paid_amount = amount` → Đã thanh toán đủ
  - Số nợ = `amount - paid_amount`

### 6. type (Loại giao dịch)
- **Bắt buộc**: ✅ Bắt buộc
- **Kiểu**: TEXT
- **Giá trị cho phép**: 
  - `INCOME` - Thu tiền (bán hàng, thu hoạch)
  - `EXPENSE` - Chi tiền (mua vật tư, trả lương)
- **Lưu ý**: Phải viết HOA, không dấu

### 7. transaction_date (Ngày giao dịch)
- **Bắt buộc**: ❌ Không
- **Kiểu**: DATE
- **Format**: `YYYY-MM-DD` hoặc `DD/MM/YYYY`
- **Ví dụ**: `2026-01-17` hoặc `17/01/2026`
- **Mặc định**: Ngày hiện tại nếu để trống

### 8. note (Ghi chú)
- **Bắt buộc**: ❌ Không
- **Kiểu**: TEXT
- **Ví dụ**: `Mua phân bón NPK cho vườn A`, `Bán 500kg mận cho chợ đầu mối`
- **Lưu ý**: Mô tả chi tiết giao dịch

### 9. is_inventory_affected (Ảnh hưởng kho)
- **Bắt buộc**: ❌ Không
- **Kiểu**: TEXT
- **Giá trị cho phép**: `TRUE`, `FALSE`, `1`, `0`
- **Mặc định**: `FALSE` nếu để trống
- **Lưu ý**:
  - `TRUE` nếu giao dịch này nhập hàng vào kho (mua vật tư)
  - `FALSE` nếu không liên quan đến kho

---

## Ví dụ các trường hợp thực tế

### Trường hợp 1: Mua phân bón trả đủ tiền
```
partner_code: PT-001
season_code: VU-MAN-2026
category_code: CAT-PHAN-BON
amount: 5000000
paid_amount: 5000000
type: EXPENSE
transaction_date: 2026-01-15
note: Mua 10 bao phân NPK 20-20-15
is_inventory_affected: TRUE
```

### Trường hợp 2: Mua thuốc BVTV trả thiếu (còn nợ)
```
partner_code: PT-002
season_code: VU-MAN-2026
category_code: CAT-THUOC-BVTV
amount: 2500000
paid_amount: 2000000
type: EXPENSE
transaction_date: 2026-01-16
note: Mua thuốc trừ sâu, còn nợ 500k
is_inventory_affected: TRUE
```
→ Nợ = 2,500,000 - 2,000,000 = 500,000 VNĐ

### Trường hợp 3: Bán sản phẩm
```
partner_code: BUYER-001
season_code: VU-MAN-2026
category_code: CAT-BAN-TRAI
amount: 15000000
paid_amount: 15000000
type: INCOME
transaction_date: 2026-01-17
note: Bán 500kg mận giá 30k/kg
is_inventory_affected: FALSE
```

### Trường hợp 4: Chi tiêu vặt (không có đối tác)
```
partner_code: (để trống)
season_code: (để trống)
category_code: CAT-CHI-VAT
amount: 50000
paid_amount: 50000
type: EXPENSE
transaction_date: 2026-01-17
note: Mua xăng xe máy
is_inventory_affected: FALSE
```

### Trường hợp 5: Trả nợ
```
partner_code: PT-002
season_code: (để trống)
category_code: CAT-TRA-NO
amount: 500000
paid_amount: 500000
type: EXPENSE
transaction_date: 2026-01-18
note: Trả nợ thuốc BVTV kỳ trước
is_inventory_affected: FALSE
```

---

## Lưu ý quan trọng khi import

### ✅ Trước khi import:
1. Đảm bảo các **partner_code** đã tồn tại trong bảng `partners`
2. Đảm bảo các **season_code** đã tồn tại trong bảng `seasons`
3. Đảm bảo các **category_code** đã tồn tại trong bảng `categories`
4. Kiểm tra format ngày tháng đúng
5. Kiểm tra `type` chỉ có `INCOME` hoặc `EXPENSE`

### ⚠️ Các lỗi thường gặp:
- ❌ `partner_code` không tồn tại → Lỗi foreign key
- ❌ `type` viết sai (VD: `income` thay vì `INCOME`) → Lỗi CHECK constraint
- ❌ `amount` để trống → Lỗi NOT NULL
- ❌ `paid_amount > amount` → Không hợp lý (nên kiểm tra)

### 💡 Tips:
- Sắp xếp theo `transaction_date` tăng dần để dễ theo dõi
- Nhóm các giao dịch cùng loại lại với nhau
- Dùng filter Excel để kiểm tra dữ liệu trước khi import
- Backup database trước khi import số lượng lớn

---

## SQL Script để import (tham khảo)

```sql
-- Import từ CSV/Excel (sau khi convert)
COPY transactions (
    partner_id, 
    season_id, 
    category_id, 
    amount, 
    paid_amount, 
    type, 
    transaction_date, 
    note, 
    is_inventory_affected
)
FROM '/path/to/transactions.csv'
DELIMITER ','
CSV HEADER;
```

Hoặc dùng script import với lookup:

```sql
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
)
SELECT 
    p.id as partner_id,
    s.id as season_id,
    c.id as category_id,
    temp.amount,
    COALESCE(temp.paid_amount, 0),
    temp.type,
    COALESCE(temp.transaction_date, CURRENT_TIMESTAMP),
    temp.note,
    COALESCE(temp.is_inventory_affected, FALSE)
FROM temp_transactions temp
LEFT JOIN partners p ON p.partner_code = temp.partner_code
LEFT JOIN seasons s ON s.season_code = temp.season_code
LEFT JOIN categories c ON c.category_code = temp.category_code;
```

---

**Ngày tạo**: 2026-01-17  
**Phiên bản**: 1.0
