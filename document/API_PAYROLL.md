# API Documentation: Payroll Management

## Tổng quan
API này cung cấp đầy đủ các endpoint để quản lý phiếu lương (payroll) với tính năng **tự động tạo transaction** khi trả lương.

---

## Base URL
```
http://localhost:5000/api/payroll
```

---

## Endpoints

### 1. Lấy tất cả payrolls
**GET** `/`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "payroll_code": "PL-20260117-001",
      "partner_id": "uuid",
      "partner_name": "Nguyễn Văn A",
      "total_amount": 5000000,
      "bonus": 500000,
      "deductions": 200000,
      "final_amount": 5300000,
      "status": "DRAFT",
      "transaction_id": null,
      "payment_date": null,
      "created_at": "2026-01-17T10:00:00Z"
    }
  ]
}
```

---

### 2. Lấy payroll theo ID
**GET** `/:id`

**Response:**
```json
{
  "success": true,
  "data": { /* payroll object */ }
}
```

---

### 3. Lấy payrolls theo Season
**GET** `/season/:seasonId`

**Response:**
```json
{
  "success": true,
  "data": [ /* array of payrolls */ ]
}
```

---

### 4. Lấy payrolls theo Partner (Nhân viên)
**GET** `/partner/:partnerId`

**Response:**
```json
{
  "success": true,
  "data": [ /* array of payrolls */ ]
}
```

---

### 5. Tạo payroll mới
**POST** `/`

**Request Body:**
```json
{
  "payroll_code": "PL-20260117-001",
  "partner_id": "uuid-of-worker",
  "total_amount": 5000000,
  "bonus": 500000,
  "deductions": 200000,
  "final_amount": 5300000,
  "status": "DRAFT"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* created payroll */ }
}
```

---

### 6. Cập nhật payroll
**PUT** `/:id`

**Request Body:**
```json
{
  "bonus": 600000,
  "deductions": 100000,
  "final_amount": 5400000
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated payroll */ }
}
```

---

### 7. Cập nhật trạng thái payroll ⭐ **QUAN TRỌNG**
**PUT** `/:id/status`

> **Lưu ý**: Khi status = `PAID`, trigger sẽ **tự động tạo transaction** trong database!

**Request Body:**
```json
{
  "status": "PAID",
  "payment_date": "2026-01-17T11:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "payroll_code": "PL-20260117-001",
    "status": "PAID",
    "transaction_id": "uuid-of-auto-created-transaction",
    "payment_date": "2026-01-17T11:00:00Z",
    ...
  },
  "message": "Payroll marked as PAID. Transaction created automatically."
}
```

**Các trạng thái hợp lệ:**
- `DRAFT` - Nháp
- `APPROVED` - Đã duyệt
- `PAID` - Đã trả (tự động tạo transaction)
- `CANCELLED` - Đã hủy

---

### 8. Xóa payroll
**DELETE** `/:id`

**Response:**
```json
{
  "success": true,
  "message": "Payroll deleted successfully"
}
```

---

### 9. Lấy thống kê payroll
**GET** `/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_payrolls": 150,
    "draft_count": 10,
    "approved_count": 5,
    "paid_count": 130,
    "total_paid_amount": 650000000,
    "pending_amount": 75000000
  }
}
```

---

## Tính năng tự động tạo Transaction

### Khi nào transaction được tạo?
Transaction tự động được tạo khi:
1. Payroll mới được tạo với `status = 'PAID'`
2. Payroll được cập nhật từ trạng thái khác sang `status = 'PAID'`

### Thông tin transaction tự động
```json
{
  "partner_id": "uuid-of-worker",
  "season_id": null,
  "category_id": "uuid-of-CAT-LUONG",
  "amount": 5300000,
  "paid_amount": 5300000,
  "type": "EXPENSE",
  "transaction_date": "2026-01-17T11:00:00Z",
  "note": "Thanh toán lương - Phiếu lương: PL-20260117-001",
  "is_inventory_affected": false
}
```

### Xử lý khi hủy payroll
Nếu payroll chuyển từ `PAID` sang `CANCELLED`:
- Transaction tương ứng sẽ bị **xóa tự động**
- `transaction_id` sẽ được set về `NULL`

---

## Ví dụ sử dụng

### Frontend (React/TypeScript)
```typescript
import { updatePayrollStatus } from '../api/payroll.api';

// Trả lương cho nhân viên
const handlePaySalary = async (payrollId: string) => {
  try {
    const result = await updatePayrollStatus(payrollId, 'PAID');
    console.log('Transaction ID:', result.transaction_id);
    alert('Đã trả lương và tạo transaction tự động!');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### cURL
```bash
# Cập nhật trạng thái sang PAID
curl -X PUT http://localhost:5000/api/payroll/{id}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PAID",
    "payment_date": "2026-01-17T11:00:00Z"
  }'
```

---

## Error Handling

### 400 Bad Request
```json
{
  "success": false,
  "message": "Status is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Payroll not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error message details"
}
```

---

## Database Trigger

Trigger `payroll_auto_transaction_trigger` được tạo tự động khi:
- File migration: `backend/migrations/auto_create_transaction_on_payroll.sql`
- Function: `trg_auto_create_transaction_on_payroll()`

---

**Ngày tạo**: 2026-01-17  
**Phiên bản**: 1.0
