# 🎉 Hướng dẫn sử dụng tính năng Phiếu lương

## Truy cập trang Phiếu lương

### Cách 1: Qua Menu Sidebar
1. Mở ứng dụng
2. Click vào menu **"Chấm công"** (icon: badge)
3. Click vào **"Phiếu lương"** (icon: payments)

### Cách 2: Qua URL
Truy cập trực tiếp: `http://localhost:3000/#/master-data/payroll`

---

## Giao diện trang Phiếu lương

### 1. Thống kê (Stats Cards)
Hiển thị 4 thẻ thống kê:
- **Tổng phiếu lương**: Tổng số phiếu lương trong hệ thống
- **Chờ xử lý**: Số phiếu lương đang ở trạng thái DRAFT hoặc APPROVED
- **Đã thanh toán**: Số phiếu lương đã trả (PAID)
- **Tổng đã chi**: Tổng số tiền đã chi trả cho lương

### 2. Bảng danh sách Phiếu lương
Hiển thị các cột:
- **Mã phiếu**: Mã phiếu lương (VD: PL-20260117-001)
- **Nhân viên**: Tên nhân viên nhận lương
- **Tổng tiền**: Tổng tiền công
- **Thực nhận**: Số tiền thực nhận (sau thưởng/phạt)
- **Trạng thái**: DRAFT / APPROVED / PAID / CANCELLED
- **Transaction ID**: ID giao dịch (nếu đã trả lương)
- **Thao tác**: Các nút hành động

---

## Quy trình trả lương

### Bước 1: Phiếu lương ở trạng thái DRAFT
- Hiển thị nút **"Duyệt"**
- Click "Duyệt" → Chuyển sang trạng thái APPROVED

### Bước 2: Phiếu lương ở trạng thái APPROVED
- Hiển thị nút **"💰 Trả lương"**
- Click "Trả lương" → Chuyển sang trạng thái PAID
- **✨ Tự động tạo Transaction trong hệ thống tài chính**

### Bước 3: Sau khi trả lương (PAID)
- Cột "Transaction ID" hiển thị ID giao dịch
- Không thể thay đổi trạng thái (chỉ có thể xóa)

---

## Tính năng tự động tạo Transaction

### Khi nào Transaction được tạo?
Khi bạn click nút **"💰 Trả lương"** (chuyển trạng thái từ APPROVED → PAID)

### Transaction được tạo với thông tin:
- **Type**: EXPENSE (Chi tiền)
- **Amount**: Số tiền thực nhận (final_amount)
- **Category**: "Lương nhân viên" (CAT-LUONG)
- **Partner**: Nhân viên nhận lương
- **Note**: "Thanh toán lương - Phiếu lương: [Mã phiếu]"
- **Transaction Date**: Ngày trả lương

### Lợi ích:
✅ Không cần tạo transaction thủ công  
✅ Đảm bảo mọi khoản lương đều được ghi nhận  
✅ Dữ liệu đồng bộ giữa payroll và transactions  
✅ Dễ dàng theo dõi dòng tiền chi lương  

---

## Các trạng thái Phiếu lương

| Trạng thái | Màu sắc | Ý nghĩa | Hành động có thể |
|------------|---------|---------|------------------|
| **DRAFT** | Xám | Nháp, chưa duyệt | Duyệt, Hủy, Xóa |
| **APPROVED** | Xanh dương | Đã duyệt, chờ trả | **Trả lương**, Hủy, Xóa |
| **PAID** | Xanh lá | Đã trả lương | Xóa |
| **CANCELLED** | Đỏ | Đã hủy | Xóa |

---

## Ví dụ thực tế

### Kịch bản: Trả lương cho nhân viên Nguyễn Văn A

1. **Tìm phiếu lương**
   - Mở trang "Phiếu lương"
   - Tìm phiếu lương của "Nguyễn Văn A"
   - Kiểm tra trạng thái: APPROVED

2. **Trả lương**
   - Click nút **"💰 Trả lương"**
   - Hệ thống xử lý (hiển thị "Đang xử lý...")
   - Alert hiển thị: "✅ Đã chuyển sang trạng thái PAID! 🎉 Transaction đã được tạo tự động..."

3. **Kiểm tra kết quả**
   - Trạng thái chuyển sang: **PAID** (màu xanh lá)
   - Cột "Transaction ID" hiển thị: ✓ abc123...
   - Vào trang "Giao dịch" để xem transaction chi tiền lương

---

## Kiểm tra Transaction đã tạo

### Cách 1: Qua UI
1. Vào trang **"Giao dịch"** (Transactions)
2. Lọc theo loại: **EXPENSE** (Chi tiền)
3. Tìm giao dịch có note: "Thanh toán lương - Phiếu lương: PL-XXX"

### Cách 2: Qua Database
```sql
SELECT 
    p.payroll_code,
    p.partner_name,
    p.final_amount,
    p.status,
    t.id as transaction_id,
    t.type,
    t.amount,
    t.note
FROM payrolls p
LEFT JOIN transactions t ON p.transaction_id = t.id
WHERE p.status = 'PAID'
ORDER BY p.payment_date DESC;
```

---

## Lưu ý quan trọng

⚠️ **Không thể hoàn tác**  
Sau khi click "Trả lương", transaction sẽ được tạo ngay lập tức. Nếu muốn hủy, cần:
1. Chuyển payroll sang CANCELLED (transaction sẽ tự động xóa)
2. Hoặc xóa transaction thủ công trong database

⚠️ **Category "Lương nhân viên" phải tồn tại**  
Đảm bảo đã chạy migration `create_salary_category.sql`

⚠️ **Chỉ payroll có status = APPROVED mới có nút "Trả lương"**  
Phải duyệt phiếu lương trước khi trả

---

## Troubleshooting

### Không thấy nút "Trả lương"?
- Kiểm tra trạng thái payroll phải là **APPROVED**
- Nếu là DRAFT, click "Duyệt" trước

### Transaction không được tạo?
- Kiểm tra trigger đã được tạo: `payroll_auto_transaction_trigger`
- Kiểm tra category "Lương nhân viên" (CAT-LUONG) đã tồn tại
- Xem log backend để kiểm tra lỗi

### Không tìm thấy menu "Phiếu lương"?
- Kiểm tra đã mở menu "Chấm công" chưa
- Refresh lại trang
- Kiểm tra file `Sidebar.tsx` đã có menu item chưa

---

**Ngày tạo**: 2026-01-17  
**Phiên bản**: 1.0  
**Hỗ trợ**: Liên hệ admin nếu gặp vấn đề
