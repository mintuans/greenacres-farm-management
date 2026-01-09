# Hướng dẫn cài đặt và kết nối PostgreSQL

## 📥 Bước 1: Cài đặt PostgreSQL

### Tùy chọn 1: Cài đặt PostgreSQL trực tiếp (Khuyến nghị)

1. **Download PostgreSQL:**
   - Truy cập: https://www.postgresql.org/download/windows/
   - Hoặc trực tiếp: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Chọn phiên bản mới nhất (PostgreSQL 16.x)

2. **Cài đặt:**
   - Chạy file installer đã tải
   - Chọn các components:
     - ✅ PostgreSQL Server
     - ✅ pgAdmin 4 (GUI tool)
     - ✅ Command Line Tools
   - Đặt password cho user `postgres` (GHI NHỚ PASSWORD NÀY!)
   - Port mặc định: `5432`
   - Locale: `Default locale`

3. **Kiểm tra cài đặt:**
   ```powershell
   # Thêm PostgreSQL vào PATH (nếu chưa có)
   # Thường ở: C:\Program Files\PostgreSQL\16\bin
   
   # Kiểm tra version
   psql --version
   ```

### Tùy chọn 2: Sử dụng Docker (Nếu đã có Docker)

```powershell
# Pull PostgreSQL image
docker pull postgres:16

# Chạy PostgreSQL container
docker run --name greenacres-postgres `
  -e POSTGRES_PASSWORD=your_password `
  -e POSTGRES_DB=greenacres_db `
  -p 5432:5432 `
  -d postgres:16

# Kiểm tra container đang chạy
docker ps
```

## 🔧 Bước 2: Tạo Database

### Cách 1: Sử dụng pgAdmin 4 (GUI)

1. Mở **pgAdmin 4**
2. Kết nối đến server (localhost)
3. Nhập password bạn đã đặt
4. Right-click **Databases** → **Create** → **Database**
5. Nhập tên: `greenacres_db`
6. Click **Save**

### Cách 2: Sử dụng Command Line

```powershell
# Kết nối với PostgreSQL
psql -U postgres

# Tạo database (trong psql prompt)
CREATE DATABASE greenacres_db;

# Kiểm tra database đã tạo
\l

# Thoát
\q
```

### Cách 3: Sử dụng SQL Shell

1. Mở **SQL Shell (psql)** từ Start Menu
2. Nhấn Enter cho các giá trị mặc định:
   - Server: `localhost`
   - Database: `postgres`
   - Port: `5432`
   - Username: `postgres`
3. Nhập password
4. Chạy lệnh:
   ```sql
   CREATE DATABASE greenacres_db;
   ```

## ⚙️ Bước 3: Cấu hình Backend

### 1. Cập nhật file `.env`

Mở file `backend/.env` và cập nhật `DATABASE_URL`:

```env
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/greenacres_db"

# Ví dụ cụ thể:
# DATABASE_URL="postgresql://postgres:admin123@localhost:5432/greenacres_db"
```

**Lưu ý:** Thay `your_password` bằng password bạn đã đặt khi cài PostgreSQL

### 2. Các tham số trong DATABASE_URL

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

- **USER**: `postgres` (default user)
- **PASSWORD**: Password bạn đã đặt
- **HOST**: `localhost` (hoặc `127.0.0.1`)
- **PORT**: `5432` (default port)
- **DATABASE**: `greenacres_db`

### Ví dụ các connection strings:

```env
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/greenacres_db"

# Docker PostgreSQL
DATABASE_URL="postgresql://postgres:docker123@localhost:5432/greenacres_db"

# Remote PostgreSQL (ví dụ: Render, Supabase)
DATABASE_URL="postgresql://user:pass@host.region.provider.com:5432/dbname"
```

## 🚀 Bước 4: Khởi tạo Database với Prisma

```powershell
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies (nếu chưa cài)
npm install

# Generate Prisma Client
npm run prisma:generate

# Tạo và chạy migrations (tạo tables trong database)
npm run prisma:migrate

# Khi được hỏi tên migration, nhập: "init"
```

## ✅ Bước 5: Kiểm tra kết nối

### 1. Sử dụng Prisma Studio (GUI)

```powershell
npm run prisma:studio
```

Prisma Studio sẽ mở tại: `http://localhost:5555`

### 2. Kiểm tra trong code

Tạo file test để kiểm tra kết nối:

```typescript
// backend/test-connection.ts
import prisma from './src/config/database';

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL successfully!');
    
    // Đếm số users
    const userCount = await prisma.user.count();
    console.log(`📊 Current users: ${userCount}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

testConnection();
```

Chạy test:
```powershell
npx tsx test-connection.ts
```

## 🔍 Troubleshooting

### Lỗi: "Can't reach database server"

**Nguyên nhân:** PostgreSQL chưa chạy hoặc sai thông tin kết nối

**Giải pháp:**
```powershell
# Kiểm tra PostgreSQL service đang chạy
Get-Service -Name postgresql*

# Nếu không chạy, start service
Start-Service postgresql-x64-16  # Tên service có thể khác
```

### Lỗi: "Authentication failed"

**Nguyên nhân:** Sai password hoặc user không tồn tại

**Giải pháp:**
- Kiểm tra lại password trong `.env`
- Đảm bảo user `postgres` tồn tại
- Reset password nếu cần:
  ```powershell
  psql -U postgres
  ALTER USER postgres PASSWORD 'new_password';
  ```

### Lỗi: "Database does not exist"

**Nguyên nhân:** Chưa tạo database `greenacres_db`

**Giải pháp:**
```powershell
psql -U postgres
CREATE DATABASE greenacres_db;
\q
```

### Lỗi: "Port 5432 already in use"

**Nguyên nhân:** Có service khác đang dùng port 5432

**Giải pháp:**
- Đổi port trong PostgreSQL config
- Hoặc stop service đang dùng port đó

## 📊 Các công cụ hữu ích

### 1. pgAdmin 4
- GUI tool mạnh mẽ để quản lý PostgreSQL
- Đã được cài cùng PostgreSQL

### 2. Prisma Studio
```powershell
npm run prisma:studio
```
- GUI để xem và edit data
- Rất tiện cho development

### 3. DBeaver (Optional)
- Download: https://dbeaver.io/
- Universal database tool
- Hỗ trợ nhiều loại database

## 🎯 Checklist hoàn thành

- [ ] PostgreSQL đã được cài đặt
- [ ] Service PostgreSQL đang chạy
- [ ] Database `greenacres_db` đã được tạo
- [ ] File `.env` đã được cấu hình đúng
- [ ] `npm install` đã chạy thành công
- [ ] `npm run prisma:generate` đã chạy thành công
- [ ] `npm run prisma:migrate` đã chạy thành công
- [ ] Prisma Studio có thể mở được
- [ ] Backend server có thể kết nối database

## 📝 Lưu ý quan trọng

1. **Bảo mật:**
   - KHÔNG commit file `.env` lên Git
   - Sử dụng password mạnh cho production
   - Thay đổi `JWT_SECRET` trong production

2. **Development:**
   - Sử dụng Prisma Studio để xem data
   - Chạy migrations mỗi khi thay đổi schema
   - Backup database thường xuyên

3. **Production:**
   - Sử dụng connection pooling
   - Enable SSL connection
   - Sử dụng managed database service (Supabase, Render, AWS RDS)

## 🆘 Cần trợ giúp?

Nếu gặp vấn đề, cung cấp thông tin:
1. Error message đầy đủ
2. PostgreSQL version: `psql --version`
3. Node version: `node --version`
4. Nội dung file `.env` (ẩn password)
