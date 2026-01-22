# Tính năng hiển thị đặc biệt cho Giống cây trồng (GCT)

## Tổng quan
Đã cập nhật hệ thống để hiển thị thông tin chi tiết về số lượng, đơn vị và đơn giá một cách đặc biệt khi giao dịch thuộc danh mục **"Giống cây trồng"** (category_code = 'GCT').

## Các thay đổi đã thực hiện

### 1. Database Schema
- ✅ Đã thêm 3 cột mới vào bảng `transactions`:
  - `quantity` (DECIMAL 15,2): Số lượng hàng hóa
  - `unit` (VARCHAR 50): Đơn vị tính (kg, tấn, bao, chai, thùng...)
  - `unit_price` (DECIMAL 15,2): Đơn giá mỗi đơn vị

### 2. Backend Updates
- ✅ Cập nhật `Transaction` interface để bao gồm `category_code`
- ✅ Cập nhật SQL query trong `getTransactions()` để JOIN với bảng categories và lấy `category_code`
- ✅ Cập nhật function `get_transactions_by_month()` trong PostgreSQL để trả về `category_code`

### 3. Frontend Updates
- ✅ Cập nhật `Transaction` interface trong frontend API
- ✅ Cập nhật form thêm giao dịch:
  - Thêm trường "Số lượng" với dropdown chọn đơn vị
  - Thêm trường "Đơn giá"
  - **Tự động tính toán** Tổng tiền = Số lượng × Đơn giá
- ✅ Cập nhật modal chi tiết giao dịch:
  - **Hiển thị đặc biệt cho GCT**: Khối màu xanh lá gradient với icon 🌱 (eco)
  - **Hiển thị thông thường**: Khối màu xanh dương cho các danh mục khác

### 4. Giao diện đặc biệt cho GCT
Khi `category_code === 'GCT'`, modal chi tiết sẽ hiển thị:
- 🎨 **Gradient màu emerald** (xanh lá cây) từ emerald-50 → green-50 → teal-50
- 🌱 **Icon eco** trong khối tròn màu emerald-500
- 📊 **3 khối thông tin**:
  1. Số lượng (với đơn vị)
  2. Đơn giá (đ/đơn vị)
  3. Thành tiền (nổi bật với nền emerald-500)
- ✨ **Shadow và border** đặc biệt để làm nổi bật

### 5. Migrations đã chạy
1. `20260122_add_unit_fields_to_transactions.sql` - Thêm 3 cột mới
2. `20260122_update_transaction_function_add_category_code.sql` - Cập nhật function PostgreSQL

## Cách sử dụng

### Thêm giao dịch mới
1. Bấm nút **"Thêm mới"** trên màn hình Giao dịch
2. Chọn danh mục **"Giống cây trồng"**
3. Nhập:
   - Số lượng (ví dụ: 1000)
   - Chọn đơn vị (kg, tấn, bao...)
   - Đơn giá (ví dụ: 22000)
4. Hệ thống sẽ **tự động tính** Tổng tiền = 1000 × 22000 = 22,000,000đ

### Xem chi tiết
1. Bấm vào bất kỳ dòng giao dịch nào trong bảng
2. Nếu là **Giống cây trồng (GCT)**:
   - Sẽ hiển thị khối màu xanh lá đặc biệt
   - Thông tin chi tiết về số lượng, đơn giá rõ ràng
3. Nếu là danh mục khác:
   - Hiển thị khối màu xanh dương thông thường

## Ví dụ thực tế
**Giao dịch mua giống mận:**
- Danh mục: Giống cây trồng (GCT)
- Số lượng: 500 kg
- Đơn giá: 22,000đ/kg
- Thành tiền: 11,000,000đ

→ Khi xem chi tiết, sẽ thấy khối màu xanh lá gradient với icon 🌱 và 3 ô thông tin rõ ràng.

## Lưu ý kỹ thuật
- `category_code` được lấy từ bảng `categories` thông qua JOIN
- Điều kiện kiểm tra: `selectedTransaction.category_code === 'GCT'`
- Các danh mục khác vẫn hiển thị bình thường nếu có quantity/unit_price
