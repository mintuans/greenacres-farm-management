# 📋 Tóm tắt - Kết nối PostgreSQL với Backend

## ✅ Các file đã tạo

1. **QUICKSTART.md** - Hướng dẫn nhanh 7 bước
2. **POSTGRESQL_SETUP.md** - Hướng dẫn chi tiết với troubleshooting
3. **test-connection.ts** - Script test kết nối database
4. **.env.example** - Template cấu hình môi trường

## 🎯 Các bước cần làm

### 1. Cài đặt PostgreSQL
- Download từ: https://www.postgresql.org/download/windows/
- Ghi nhớ password của user `postgres`
- Port mặc định: `5432`

### 2. Tạo Database
```sql
-- Trong SQL Shell (psql)
CREATE DATABASE greenacres_db;
```

### 3. Cấu hình Backend
```env
# File: backend/.env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/greenacres_db"
```

### 4. Cài đặt và khởi tạo
```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
```

### 5. Test kết nối
```powershell
npm run test:db
```

### 6. Chạy server
```powershell
npm run dev
```

## 📝 Các lệnh quan trọng

| Lệnh | Mô tả |
|------|-------|
| `npm run test:db` | Test kết nối PostgreSQL |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Tạo/cập nhật database schema |
| `npm run prisma:studio` | Mở GUI quản lý database |
| `npm run dev` | Chạy server development mode |
| `npm run build` | Build production |

## 🔍 Kiểm tra kết nối thành công

### Test Script
```powershell
npm run test:db
```

**Kết quả mong đợi:**
```
✅ Successfully connected to PostgreSQL!
📊 PostgreSQL version: PostgreSQL 16.x
📈 Database Statistics:
   Users: 0
   Seasons: 0
   Debts: 0
✨ Database is ready to use!
```

### Test API
```powershell
# Server đang chạy
curl http://localhost:3000/health

# Hoặc mở browser
http://localhost:3000/api
```

### Prisma Studio
```powershell
npm run prisma:studio
# Mở: http://localhost:5555
```

## 📊 Database Schema

### User Table
- `id` - UUID (Primary Key)
- `email` - String (Unique)
- `password` - String (Hashed)
- `name` - String (Optional)
- `role` - String (default: "user")
- `createdAt` - DateTime
- `updatedAt` - DateTime

### Season Table (Mùa vụ)
- `id` - UUID (Primary Key)
- `name` - String
- `startDate` - DateTime
- `endDate` - DateTime (Optional)
- `description` - String (Optional)
- `status` - String (active/completed/cancelled)
- `userId` - String (Foreign Key)
- `createdAt` - DateTime
- `updatedAt` - DateTime

### Debt Table (Công nợ)
- `id` - UUID (Primary Key)
- `creditor` - String (Người cho vay)
- `amount` - Float
- `description` - String (Optional)
- `dueDate` - DateTime (Optional)
- `status` - String (pending/paid/overdue)
- `userId` - String (Foreign Key)
- `createdAt` - DateTime
- `updatedAt` - DateTime

## 🛠️ Troubleshooting nhanh

### ❌ "Can't reach database server"
```powershell
# Kiểm tra service
Get-Service -Name postgresql*

# Start service
Start-Service postgresql-x64-16
```

### ❌ "Authentication failed"
- Kiểm tra password trong `.env`
- Đảm bảo không có khoảng trắng thừa

### ❌ "Database does not exist"
```sql
-- Tạo database
psql -U postgres
CREATE DATABASE greenacres_db;
\q
```

### ❌ "Module not found"
```powershell
rm -r node_modules
npm install
```

## 📚 Tài liệu tham khảo

- **QUICKSTART.md** - Bắt đầu nhanh trong 7 bước
- **POSTGRESQL_SETUP.md** - Hướng dẫn chi tiết
- **readme.md** - Tổng quan về backend
- **.env.example** - Template cấu hình

## 🎯 Checklist

- [ ] PostgreSQL đã được cài đặt
- [ ] Service PostgreSQL đang chạy
- [ ] Database `greenacres_db` đã được tạo
- [ ] File `.env` đã được cấu hình
- [ ] `npm install` thành công
- [ ] `npm run prisma:generate` thành công
- [ ] `npm run prisma:migrate` thành công
- [ ] `npm run test:db` thành công ✅
- [ ] `npm run dev` server chạy được
- [ ] API endpoints hoạt động

## 🚀 Bước tiếp theo

Sau khi kết nối thành công:

1. **Tạo user đầu tiên:**
   ```bash
   POST http://localhost:3000/api/auth/register
   {
     "email": "admin@example.com",
     "password": "admin123",
     "name": "Admin"
   }
   ```

2. **Test login:**
   ```bash
   POST http://localhost:3000/api/auth/login
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   ```

3. **Tạo controllers và routes cho Season và Debt**

4. **Kết nối frontend với backend API**

## 💡 Tips

- Sử dụng **Prisma Studio** để xem và edit data dễ dàng
- Sử dụng **Postman** hoặc **Thunder Client** để test API
- Backup database thường xuyên
- Đọc Prisma docs: https://www.prisma.io/docs

---

**Chúc bạn code vui vẻ! 🎉**
