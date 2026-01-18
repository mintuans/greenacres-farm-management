# Database Backup & Restore

Thư mục này chứa các file backup của cơ sở dữ liệu.

## Cấu trúc file backup

Các file backup được tạo tự động với định dạng tên:
```
backup_YYYY-MM-DDTHH-mm-ss-sssZ.sql
```

Ví dụ: `backup_2026-01-17T01-30-00-000Z.sql`

## Lưu ý quan trọng

⚠️ **CẢNH BÁO**: 
- File backup chứa toàn bộ dữ liệu của cơ sở dữ liệu
- Không chia sẻ file backup với người không có quyền
- Lưu trữ file backup ở nơi an toàn
- Kiểm tra kỹ trước khi restore

## Yêu cầu hệ thống

Để sử dụng chức năng backup/restore, hệ thống cần có:
- PostgreSQL client tools (pg_dump, psql)
- Quyền truy cập vào database

## Cách sử dụng

### Tạo backup
1. Vào trang "Cài đặt hệ thống" > "Backup & Restore"
2. Nhấn nút "Tạo Backup Mới"
3. File backup sẽ được tạo và lưu trong thư mục này

### Restore database
1. Vào trang "Cài đặt hệ thống" > "Backup & Restore"
2. Chọn file backup muốn restore
3. Nhấn nút "Restore"
4. Xác nhận thao tác

### Download backup
1. Vào trang "Cài đặt hệ thống" > "Backup & Restore"
2. Nhấn nút "Download" ở file backup muốn tải

### Xóa backup
1. Vào trang "Cài đặt hệ thống" > "Backup & Restore"
2. Nhấn nút "Xóa" ở file backup muốn xóa
3. Xác nhận thao tác

## Bảo mật

- Tất cả API endpoints đều yêu cầu authentication
- Chỉ người dùng đã đăng nhập mới có thể thực hiện backup/restore
- File backup được lưu trữ trên server, không public

## Khắc phục sự cố

### Lỗi "pg_dump not found"
- Cài đặt PostgreSQL client tools
- Thêm đường dẫn PostgreSQL bin vào PATH

### Lỗi "Permission denied"
- Kiểm tra quyền truy cập thư mục backups
- Đảm bảo user có quyền ghi vào thư mục

### Lỗi kết nối database
- Kiểm tra biến môi trường DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- Đảm bảo database đang chạy
