# 🚀 Quick Start - Kết nối PostgreSQL

## Bước 1️⃣: Cài đặt PostgreSQL

### Download và cài đặt:
1. Truy cập: https://www.postgresql.org/download/windows/
2. Download PostgreSQL 16.x
3. Chạy installer
4. **QUAN TRỌNG:** Ghi nhớ password bạn đặt cho user `postgres`
5. Giữ port mặc định: `5432`

### Kiểm tra cài đặt:
```powershell
# Mở PowerShell và chạy:
psql --version

# Nếu thấy version number => Thành công!
# Nếu lỗi "command not found" => Thêm PostgreSQL vào PATH
```

## Bước 2️⃣: Tạo Database

### Cách nhanh nhất - Sử dụng SQL Shell:

1. Mở **SQL Shell (psql)** từ Start Menu
2. Nhấn **Enter** 4 lần (để chấp nhận giá trị mặc định)
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

## Bước 3️⃣: Cấu hình Backend

### Mở file `backend/.env` và cập nhật:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/greenacres_db"
```

**Thay `YOUR_PASSWORD` bằng password thực tế của bạn!**

Ví dụ:
```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/greenacres_db"
```

## Bước 4️⃣: Cài đặt Dependencies

```powershell
# Di chuyển vào thư mục backend
cd backend

# Cài đặt packages
npm install
```

## Bước 5️⃣: Khởi tạo Database

```powershell
# Generate Prisma Client
npm run prisma:generate

# Tạo tables trong database
npm run prisma:migrate

# Khi được hỏi tên migration, nhập: init
```

## Bước 6️⃣: Test Kết nối

```powershell
# Chạy test script
npm run test:db
```

**Kết quả mong đợi:**
```
🔄 Testing PostgreSQL connection...

✅ Successfully connected to PostgreSQL!
📊 PostgreSQL version: PostgreSQL 16.x
📈 Database Statistics:
   Users: 0
   Seasons: 0
   Debts: 0

✨ Database is ready to use!
```

## Bước 7️⃣: Chạy Server

```powershell
# Development mode
npm run dev
```

Server sẽ chạy tại: `http://localhost:3000`

## 🎉 Hoàn thành!

Bây giờ bạn có thể:

1. **Test API:**
   - Mở browser: `http://localhost:3000/health`
   - Hoặc: `http://localhost:3000/api`

2. **Xem Database:**
   ```powershell
   npm run prisma:studio
   ```
   Mở: `http://localhost:5555`

3. **Tạo user đầu tiên:**
   ```bash
   # Sử dụng Postman hoặc curl
   POST http://localhost:3000/api/auth/register
   Body: {
     "email": "admin@example.com",
     "password": "admin123",
     "name": "Admin"
   }
   ```

## ⚠️ Troubleshooting

### ❌ Lỗi: "Can't reach database server"

**Giải pháp:**
```powershell
# Kiểm tra PostgreSQL service
Get-Service -Name postgresql*

# Nếu không chạy, start service
Start-Service postgresql-x64-16
```

### ❌ Lỗi: "Authentication failed"

**Giải pháp:**
- Kiểm tra lại password trong file `.env`
- Đảm bảo không có khoảng trắng thừa

### ❌ Lỗi: "Database does not exist"

**Giải pháp:**
- Quay lại Bước 2 và tạo database

### ❌ Lỗi: "Module not found"

**Giải pháp:**
```powershell
# Xóa node_modules và cài lại
rm -r node_modules
npm install
```

## 📚 Các lệnh hữu ích

```powershell
# Test database connection
npm run test:db

# Xem database với GUI
npm run prisma:studio

# Tạo migration mới (sau khi sửa schema)
npm run prisma:migrate

# Reset database (XÓA TẤT CẢ DATA!)
npx prisma migrate reset

# Chạy server development
npm run dev

# Build production
npm run build
npm start
```

## 🆘 Cần trợ giúp?

Nếu vẫn gặp lỗi, xem file `POSTGRESQL_SETUP.md` để có hướng dẫn chi tiết hơn!
