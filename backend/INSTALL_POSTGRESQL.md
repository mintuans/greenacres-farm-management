# 📥 Download PostgreSQL cho Windows

## 🎯 Bước 1: Download PostgreSQL

### Link Download Chính thức:
👉 **https://www.postgresql.org/download/windows/**

### Hoặc Download Trực tiếp:
👉 **https://www.enterprisedb.com/downloads/postgres-postgresql-downloads**

### Phiên bản khuyên dùng:
- **PostgreSQL 16.x** (Latest stable version)
- Chọn **Windows x86-64**

## 💾 Bước 2: Cài đặt

### 2.1. Chạy Installer
- Double-click file `.exe` vừa download
- Click **Next**

### 2.2. Chọn Installation Directory
- Giữ mặc định: `C:\Program Files\PostgreSQL\16`
- Click **Next**

### 2.3. Select Components
✅ **Chọn tất cả:**
- PostgreSQL Server
- pgAdmin 4 (GUI tool)
- Stack Builder (Optional)
- Command Line Tools

Click **Next**

### 2.4. Data Directory
- Giữ mặc định: `C:\Program Files\PostgreSQL\16\data`
- Click **Next**

### 2.5. Password
⚠️ **QUAN TRỌNG:**
- Đặt password cho superuser `postgres`
- **GHI NHỚ PASSWORD NÀY!** (Ví dụ: `admin123`)
- Bạn sẽ cần password này để kết nối database

Click **Next**

### 2.6. Port
- Giữ mặc định: **5432**
- Click **Next**

### 2.7. Locale
- Chọn: **Default locale**
- Click **Next**

### 2.8. Pre Installation Summary
- Review lại các settings
- Click **Next**

### 2.9. Install
- Click **Next** để bắt đầu cài đặt
- Đợi quá trình cài đặt hoàn tất (3-5 phút)

### 2.10. Completing Setup
- Bỏ chọn "Stack Builder" (không cần thiết)
- Click **Finish**

## ✅ Bước 3: Kiểm tra cài đặt

### 3.1. Kiểm tra Service
Mở PowerShell và chạy:
```powershell
Get-Service -Name postgresql*
```

Kết quả mong đợi:
```
Status   Name               DisplayName
------   ----               -----------
Running  postgresql-x64-16  PostgreSQL Database Server 16
```

### 3.2. Kiểm tra Command Line
```powershell
psql --version
```

Kết quả mong đợi:
```
psql (PostgreSQL) 16.x
```

**Nếu lỗi "command not found":**
1. Restart PowerShell
2. Hoặc thêm vào PATH:
   - Path: `C:\Program Files\PostgreSQL\16\bin`

## 🎯 Bước 4: Tạo Database

### Cách 1: Sử dụng SQL Shell (Khuyên dùng)

1. Mở **SQL Shell (psql)** từ Start Menu
2. Nhấn **Enter** 4 lần (chấp nhận giá trị mặc định):
   ```
   Server [localhost]:        ← Enter
   Database [postgres]:       ← Enter
   Port [5432]:              ← Enter
   Username [postgres]:       ← Enter
   ```
3. Nhập **password** bạn đã đặt
4. Chạy lệnh:
   ```sql
   CREATE DATABASE greenacres_db;
   ```
5. Kiểm tra:
   ```sql
   \l
   ```
6. Thoát:
   ```sql
   \q
   ```

### Cách 2: Sử dụng pgAdmin 4 (GUI)

1. Mở **pgAdmin 4** từ Start Menu
2. Nhập master password (nếu được hỏi)
3. Expand **Servers** → **PostgreSQL 16**
4. Nhập password
5. Right-click **Databases** → **Create** → **Database**
6. Nhập tên: `greenacres_db`
7. Click **Save**

## 🔧 Bước 5: Cấu hình Backend

### Cập nhật file `.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/greenacres_db"
```

**Thay `YOUR_PASSWORD` bằng password thực tế!**

Ví dụ:
```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/greenacres_db"
```

## 🚀 Bước 6: Tiếp tục với Backend

Sau khi cài đặt xong PostgreSQL:

```powershell
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Tạo tables trong database
npm run prisma:migrate

# Test kết nối
npm run test:db

# Chạy server
npm run dev
```

## 📋 Checklist

- [ ] Download PostgreSQL 16.x
- [ ] Cài đặt với tất cả components
- [ ] Đặt và ghi nhớ password
- [ ] Service PostgreSQL đang chạy
- [ ] `psql --version` hoạt động
- [ ] Database `greenacres_db` đã được tạo
- [ ] File `.env` đã được cấu hình
- [ ] Ready to continue! 🎉

## 🆘 Troubleshooting

### Service không chạy
```powershell
Start-Service postgresql-x64-16
```

### Quên password
- Uninstall và cài lại PostgreSQL
- Hoặc reset password (phức tạp hơn)

### Port 5432 đã được sử dụng
- Chọn port khác khi cài đặt (ví dụ: 5433)
- Nhớ cập nhật trong `.env`

## 📚 Tài liệu

- PostgreSQL Docs: https://www.postgresql.org/docs/
- pgAdmin Docs: https://www.pgadmin.org/docs/

---

**Sau khi hoàn thành, quay lại file `QUICKSTART.md` để tiếp tục!**
