# Hướng dẫn cài đặt Backup & Restore

## Yêu cầu hệ thống

Để sử dụng chức năng Backup & Restore, bạn cần cài đặt PostgreSQL client tools.

### Windows

1. **Tải PostgreSQL**
   - Truy cập: https://www.postgresql.org/download/windows/
   - Tải bản installer phù hợp với hệ thống của bạn

2. **Cài đặt**
   - Chạy file installer
   - Trong quá trình cài đặt, đảm bảo chọn "Command Line Tools"
   - Ghi nhớ đường dẫn cài đặt (thường là `C:\Program Files\PostgreSQL\<version>\bin`)

3. **Thêm vào PATH**
   - Mở "System Properties" > "Environment Variables"
   - Trong "System variables", tìm và chọn "Path"
   - Nhấn "Edit" và thêm đường dẫn: `C:\Program Files\PostgreSQL\<version>\bin`
   - Nhấn "OK" để lưu

4. **Kiểm tra cài đặt**
   ```powershell
   pg_dump --version
   psql --version
   ```

### Linux (Ubuntu/Debian)

```bash
# Cài đặt PostgreSQL client
sudo apt-get update
sudo apt-get install postgresql-client

# Kiểm tra cài đặt
pg_dump --version
psql --version
```

### macOS

```bash
# Sử dụng Homebrew
brew install postgresql

# Kiểm tra cài đặt
pg_dump --version
psql --version
```

## Cấu hình biến môi trường

Đảm bảo file `.env` của backend có các biến sau:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greenacres
DB_USER=postgres
DB_PASSWORD=your_password_here
```

## Quyền truy cập

### Windows
Đảm bảo thư mục `backend/backups` có quyền ghi:
```powershell
# Kiểm tra quyền
icacls backend\backups

# Nếu cần, cấp quyền ghi
icacls backend\backups /grant Users:F
```

### Linux/macOS
```bash
# Cấp quyền ghi cho thư mục backups
chmod 755 backend/backups

# Nếu cần, thay đổi owner
sudo chown -R $USER:$USER backend/backups
```

## Sử dụng

### Tạo Backup

1. Đăng nhập vào hệ thống
2. Vào menu "Cài đặt hệ thống" > "Backup & Restore"
3. Nhấn nút "Tạo Backup Mới"
4. Đợi quá trình backup hoàn tất
5. File backup sẽ xuất hiện trong danh sách

### Restore Database

⚠️ **CẢNH BÁO**: Restore sẽ ghi đè toàn bộ dữ liệu hiện tại!

1. Đăng nhập vào hệ thống
2. Vào menu "Cài đặt hệ thống" > "Backup & Restore"
3. Chọn file backup muốn restore
4. Nhấn nút "Restore" (biểu tượng restore)
5. Xác nhận thao tác
6. Đợi quá trình restore hoàn tất

### Download Backup

1. Vào menu "Cài đặt hệ thống" > "Backup & Restore"
2. Nhấn nút "Download" (biểu tượng download) ở file muốn tải
3. File sẽ được tải về máy của bạn

### Xóa Backup

1. Vào menu "Cài đặt hệ thống" > "Backup & Restore"
2. Nhấn nút "Xóa" (biểu tượng thùng rác) ở file muốn xóa
3. Xác nhận thao tác

## Khắc phục sự cố

### Lỗi: "pg_dump: command not found"

**Nguyên nhân**: PostgreSQL client tools chưa được cài đặt hoặc chưa có trong PATH

**Giải pháp**:
1. Cài đặt PostgreSQL client tools (xem phần "Yêu cầu hệ thống")
2. Thêm đường dẫn PostgreSQL bin vào PATH
3. Khởi động lại terminal/command prompt
4. Khởi động lại server backend

### Lỗi: "EACCES: permission denied"

**Nguyên nhân**: Không có quyền ghi vào thư mục backups

**Giải pháp**:
```bash
# Linux/macOS
chmod 755 backend/backups

# Windows (PowerShell as Administrator)
icacls backend\backups /grant Users:F
```

### Lỗi: "Connection refused"

**Nguyên nhân**: Không thể kết nối đến database

**Giải pháp**:
1. Kiểm tra database đang chạy
2. Kiểm tra các biến môi trường trong `.env`:
   - DB_HOST
   - DB_PORT
   - DB_NAME
   - DB_USER
   - DB_PASSWORD

### Lỗi: "Authentication failed"

**Nguyên nhân**: Thông tin đăng nhập database không đúng

**Giải pháp**:
1. Kiểm tra DB_USER và DB_PASSWORD trong file `.env`
2. Đảm bảo user có quyền truy cập database
3. Kiểm tra file `pg_hba.conf` của PostgreSQL

## Lưu ý bảo mật

1. **Không commit file backup lên Git**
   - File `.gitignore` đã được cấu hình để bỏ qua file `.sql`

2. **Bảo vệ file backup**
   - Lưu trữ file backup ở nơi an toàn
   - Không chia sẻ file backup với người không có quyền
   - Mã hóa file backup nếu cần thiết

3. **Backup định kỳ**
   - Tạo backup trước khi thực hiện thay đổi lớn
   - Tạo backup định kỳ (hàng ngày/tuần)
   - Lưu trữ backup ở nhiều nơi khác nhau

4. **Kiểm tra backup**
   - Định kỳ kiểm tra tính toàn vẹn của file backup
   - Thử restore trên môi trường test

## Tự động hóa Backup (Nâng cao)

### Windows Task Scheduler

1. Tạo file `backup.bat`:
```batch
@echo off
cd /d C:\path\to\greenacres-farm-management\backend
set PGPASSWORD=your_password
pg_dump -h localhost -p 5432 -U postgres -d greenacres -F p -f "backups\backup_%date:~-4,4%-%date:~-7,2%-%date:~-10,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%.sql"
```

2. Tạo Scheduled Task để chạy file này định kỳ

### Linux Cron Job

```bash
# Mở crontab
crontab -e

# Thêm dòng sau để backup mỗi ngày lúc 2:00 AM
0 2 * * * PGPASSWORD=your_password pg_dump -h localhost -p 5432 -U postgres -d greenacres -F p -f /path/to/backups/backup_$(date +\%Y-\%m-\%d_\%H-\%M-\%S).sql
```

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra log của backend server
2. Kiểm tra console của browser (F12)
3. Liên hệ với quản trị viên hệ thống
