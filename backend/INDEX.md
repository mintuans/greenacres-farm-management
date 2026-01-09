# 📖 Backend Documentation Index

Chào mừng bạn đến với GreenAcres Farm Management Backend!

## 🎯 Bạn đang ở đâu?

### ✅ Đã có PostgreSQL và muốn bắt đầu ngay?
👉 **[QUICKSTART.md](./QUICKSTART.md)** - 7 bước để chạy backend

### ❌ Chưa cài PostgreSQL?
👉 **[INSTALL_POSTGRESQL.md](./INSTALL_POSTGRESQL.md)** - Download và cài đặt PostgreSQL

### 🔧 Cần hướng dẫn chi tiết?
👉 **[POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)** - Setup đầy đủ với troubleshooting

### 📊 Muốn xem tổng quan?
👉 **[POSTGRESQL_CONNECTION.md](./POSTGRESQL_CONNECTION.md)** - Tóm tắt và checklist

### 🏗️ Tìm hiểu cấu trúc code?
👉 **[BACKEND_STRUCTURE.md](./BACKEND_STRUCTURE.md)** - Chi tiết cấu trúc backend

### 📚 Tổng quan dự án?
👉 **[readme.md](./readme.md)** - README chính

---

## 📋 Quy trình Setup Đầy đủ

```
1. INSTALL_POSTGRESQL.md
   ↓ (Cài đặt PostgreSQL)
   
2. QUICKSTART.md
   ↓ (Setup backend trong 7 bước)
   
3. Test kết nối
   ↓ (npm run test:db)
   
4. Chạy server
   ↓ (npm run dev)
   
5. ✅ Hoàn thành!
```

---

## 📁 Danh sách Files

### 📘 Documentation
| File | Mô tả | Khi nào dùng |
|------|-------|--------------|
| **README.md** | Tổng quan dự án | Điểm bắt đầu |
| **INDEX.md** | File này | Tìm hướng dẫn phù hợp |
| **QUICKSTART.md** | Hướng dẫn nhanh 7 bước | Đã có PostgreSQL |
| **INSTALL_POSTGRESQL.md** | Cài đặt PostgreSQL | Chưa có PostgreSQL |
| **POSTGRESQL_SETUP.md** | Setup chi tiết | Gặp vấn đề |
| **POSTGRESQL_CONNECTION.md** | Tóm tắt kết nối | Xem checklist |
| **BACKEND_STRUCTURE.md** | Cấu trúc code | Tìm hiểu code |

### ⚙️ Configuration
| File | Mô tả |
|------|-------|
| **package.json** | Dependencies và scripts |
| **tsconfig.json** | TypeScript config |
| **biome.json** | Code formatting |
| **.env** | Environment variables (GIT IGNORE) |
| **.env.example** | Template cho .env |
| **.gitignore** | Git ignore rules |

### 🗄️ Database
| File/Folder | Mô tả |
|-------------|-------|
| **prisma/schema.prisma** | Database schema |
| **test-connection.ts** | Test script |

### 💻 Source Code
| Folder | Mô tả |
|--------|-------|
| **src/@types/** | TypeScript types |
| **src/config/** | Configurations |
| **src/controllers/** | Request handlers |
| **src/helpers/** | Utility functions |
| **src/middlewares/** | Express middlewares |
| **src/models/** | Data models |
| **src/routes/** | API routes |
| **src/services/** | Business logic |
| **src/validators/** | Input validation |
| **src/server.ts** | Main server file |

---

## 🚀 Quick Commands

```powershell
# Test database connection
npm run test:db

# View database with GUI
npm run prisma:studio

# Run development server
npm run dev

# Generate Prisma Client
npm run prisma:generate

# Create/update database schema
npm run prisma:migrate

# Build for production
npm run build
```

---

## 🎯 Các bước cơ bản

### 1️⃣ Cài đặt PostgreSQL
```powershell
# Xem hướng dẫn trong INSTALL_POSTGRESQL.md
# Download từ: https://www.postgresql.org/download/windows/
```

### 2️⃣ Tạo Database
```sql
-- Trong SQL Shell (psql)
CREATE DATABASE greenacres_db;
```

### 3️⃣ Cấu hình .env
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/greenacres_db"
```

### 4️⃣ Install Dependencies
```powershell
npm install
```

### 5️⃣ Setup Database
```powershell
npm run prisma:generate
npm run prisma:migrate
```

### 6️⃣ Test Connection
```powershell
npm run test:db
```

### 7️⃣ Run Server
```powershell
npm run dev
```

---

## ❓ Troubleshooting

### Gặp lỗi khi setup?
👉 Xem **[POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)** - Phần Troubleshooting

### Không kết nối được database?
👉 Chạy `npm run test:db` để xem lỗi chi tiết

### Module not found?
```powershell
rm -r node_modules
npm install
```

### Service PostgreSQL không chạy?
```powershell
Get-Service -Name postgresql*
Start-Service postgresql-x64-16
```

---

## 📞 Cần trợ giúp?

1. Đọc file documentation phù hợp (xem bảng trên)
2. Chạy `npm run test:db` để kiểm tra kết nối
3. Kiểm tra logs trong terminal
4. Xem Troubleshooting trong POSTGRESQL_SETUP.md

---

## ✅ Checklist Setup

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

---

**Chúc bạn code vui vẻ! 🎉**

*Nếu có thắc mắc, hãy bắt đầu với file phù hợp ở trên!*
