# Hướng dẫn sử dụng Auto Backup

## Tổng quan

Hệ thống tự động backup database theo lịch đã được tích hợp vào backend. Backup sẽ tự động chạy theo lịch đã cấu hình và tự động xóa các backup cũ.

## Cấu hình

Mở file `backend/.env` và cấu hình các biến sau:

### 1. Bật/Tắt Auto Backup

```env
AUTO_BACKUP_ENABLED=true
```

- `true`: Bật tự động backup
- `false`: Tắt tự động backup

### 2. Lịch Backup (Cron Schedule)

```env
AUTO_BACKUP_SCHEDULE=0 2 * * *
```

**Các ví dụ phổ biến:**

| Cron Expression | Mô tả |
|----------------|-------|
| `0 2 * * *` | Mỗi ngày lúc 2:00 AM (Khuyến nghị) |
| `0 */6 * * *` | Mỗi 6 giờ |
| `0 0 * * 0` | Mỗi Chủ nhật lúc 12:00 AM |
| `0 0 1 * *` | Ngày đầu tiên mỗi tháng |
| `*/30 * * * *` | Mỗi 30 phút |
| `0 0 * * 1-5` | Mỗi ngày từ Thứ 2 đến Thứ 6 lúc 12:00 AM |

**Cấu trúc Cron Expression:**

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Ngày trong tuần (0-7, 0 và 7 là Chủ nhật)
│ │ │ └───── Tháng (1-12)
│ │ └─────── Ngày trong tháng (1-31)
│ └───────── Giờ (0-23)
└─────────── Phút (0-59)
```

### 3. Quản lý Backup Cũ

```env
# Số lượng backup tối đa
AUTO_BACKUP_MAX_FILES=30

# Tuổi tối đa của backup (ngày)
AUTO_BACKUP_MAX_DAYS=30
```

Hệ thống sẽ tự động xóa backup nếu:
- Số lượng backup vượt quá `AUTO_BACKUP_MAX_FILES`
- Backup cũ hơn `AUTO_BACKUP_MAX_DAYS` ngày

## Sử dụng

### 1. Khởi động Server

```powershell
cd backend
npm run dev
```

Bạn sẽ thấy log:

```
✅ Auto backup scheduler initialized
📅 Schedule: 0 2 * * * (Mỗi ngày lúc 2:00 AM)
```

### 2. Kiểm tra Log

Khi backup tự động chạy, bạn sẽ thấy:

```
🔄 [auto-backup] Starting scheduled backup...
📁 Backup path: C:\...\backend\backups\auto_backup_2026-01-17T02-00-00-000Z.sql
✅ [auto-backup] Backup completed successfully: auto_backup_xxx.sql (2.5 MB)
```

### 3. Xem Backup

Các file backup tự động sẽ có prefix `auto_backup_` và được lưu trong:
```
backend/backups/auto_backup_*.sql
```

Bạn có thể xem chúng trong trang **Backup & Restore** của ứng dụng.

## Test Auto Backup

Để test ngay lập tức (không cần đợi đến giờ đã lên lịch):

### Cách 1: Đổi lịch thành mỗi phút

```env
AUTO_BACKUP_SCHEDULE=* * * * *
```

Restart server và đợi 1 phút.

### Cách 2: Sử dụng API thủ công

Vào trang **Backup & Restore** và nhấn "Tạo Backup Mới".

## Tắt Auto Backup

Nếu muốn tắt tự động backup:

```env
AUTO_BACKUP_ENABLED=false
```

Restart server.

## Lưu ý quan trọng

### 1. Dung lượng đĩa

- Mỗi backup có thể chiếm vài MB đến vài GB tùy kích thước database
- Đảm bảo đủ dung lượng đĩa cho số lượng backup
- Cấu hình `AUTO_BACKUP_MAX_FILES` phù hợp

### 2. Hiệu năng

- Backup có thể ảnh hưởng hiệu năng database
- Nên lên lịch vào giờ ít người dùng (2-4 AM)
- Tránh backup quá thường xuyên

### 3. Bảo mật

- File backup chứa toàn bộ dữ liệu
- Không commit backup lên Git (đã có .gitignore)
- Lưu trữ backup quan trọng ở nơi an toàn

### 4. Backup thủ công vs Tự động

- **Backup thủ công**: Prefix `backup_`, tạo qua UI
- **Backup tự động**: Prefix `auto_backup_`, tạo theo lịch
- Cả hai đều có thể restore/download/delete

## Khắc phục sự cố

### Backup không chạy

1. **Kiểm tra log server** - Xem có lỗi không
2. **Kiểm tra .env** - Đảm bảo `AUTO_BACKUP_ENABLED=true`
3. **Kiểm tra cron expression** - Phải hợp lệ
4. **Restart server** - Sau khi thay đổi .env

### Backup thất bại

1. **Kiểm tra PostgreSQL** - Đảm bảo đang chạy
2. **Kiểm tra thông tin kết nối** - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
3. **Kiểm tra quyền ghi** - Thư mục `backend/backups`
4. **Kiểm tra pg_dump** - Đảm bảo đã cài đặt và trong PATH

### Backup cũ không bị xóa

1. **Kiểm tra cấu hình** - `AUTO_BACKUP_MAX_FILES` và `AUTO_BACKUP_MAX_DAYS`
2. **Chỉ xóa auto backup** - Backup thủ công không bị xóa tự động
3. **Kiểm tra log** - Xem có lỗi khi xóa không

## Nâng cao

### Backup nhiều database

Nếu có nhiều database, bạn có thể:

1. Tạo nhiều instance của BackupSchedulerService
2. Mỗi instance với cấu hình riêng
3. Lên lịch khác nhau cho mỗi database

### Backup ra cloud

Bạn có thể mở rộng để upload backup lên cloud:

1. Sau khi backup xong
2. Upload file lên AWS S3, Google Cloud Storage, etc.
3. Xóa file local để tiết kiệm dung lượng

### Thông báo khi backup

Bạn có thể thêm:

1. Gửi email khi backup thành công/thất bại
2. Gửi notification qua Slack, Discord, etc.
3. Log vào database để theo dõi lịch sử

## Hỗ trợ

Nếu gặp vấn đề, hãy:

1. Kiểm tra log của backend server
2. Kiểm tra file `.env`
3. Đảm bảo PostgreSQL đang chạy
4. Kiểm tra quyền truy cập thư mục backups

---

**Chúc bạn sử dụng hiệu quả!** 🚀
