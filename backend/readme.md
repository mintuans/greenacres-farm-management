# GreenAcres Farm Management - Backend Server

Backend API server cho hệ thống quản lý trang trại GreenAcres.

## 📚 Hướng dẫn Setup

### 🚀 Bắt đầu nhanh (Khuyên dùng)
👉 **[QUICKSTART.md](./QUICKSTART.md)** - Hướng dẫn 7 bước để bắt đầu

### 📥 Chưa có PostgreSQL?
👉 **[INSTALL_POSTGRESQL.md](./INSTALL_POSTGRESQL.md)** - Hướng dẫn download và cài đặt

### 🔧 Hướng dẫn chi tiết
👉 **[POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)** - Setup chi tiết với troubleshooting

### 📊 Tổng quan kết nối
👉 **[POSTGRESQL_CONNECTION.md](./POSTGRESQL_CONNECTION.md)** - Tóm tắt và checklist

### 🏗️ Cấu trúc Backend
👉 **[BACKEND_STRUCTURE.md](./BACKEND_STRUCTURE.md)** - Chi tiết cấu trúc thư mục

---

## 📋 Yêu cầu hệ thống

- Node.js >= 18.x
- PostgreSQL >= 14.x (Xem [INSTALL_POSTGRESQL.md](./INSTALL_POSTGRESQL.md))
- npm hoặc yarn

## 🚀 Cài đặt nhanh

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình môi trường

Sao chép file `.env` và cập nhật các giá trị:

```bash
# Cập nhật DATABASE_URL với thông tin database của bạn
DATABASE_URL="postgresql://user:password@localhost:5432/greenacres_db"

# Cập nhật JWT_SECRET với một chuỗi bảo mật
JWT_SECRET=your-secret-key-here
```

### 3. Khởi tạo Database

```bash
# Tạo Prisma Client
npm run prisma:generate

# Chạy migrations
npm run prisma:migrate
```

### 4. Chạy server

```bash
# Development mode (với hot reload)
npm run dev

# Production mode
npm run build
npm start
```

## 📁 Cấu trúc thư mục

```
backend/
├── prisma/             # Database schema và migrations
├── src/
│   ├── @types/         # TypeScript type definitions
│   ├── config/         # Cấu hình (DB, Cloud, Mail)
│   ├── controllers/    # Request handlers
│   ├── helpers/        # Utility functions
│   ├── middlewares/    # Express middlewares
│   ├── models/         # Data models (nếu không dùng Prisma)
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── validators/     # Input validation (Zod)
│   └── server.ts       # Entry point
├── .env                # Environment variables
└── package.json        # Dependencies
```

## 🔧 Scripts có sẵn

- `npm run dev` - Chạy server ở development mode
- `npm run build` - Build production
- `npm start` - Chạy production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Chạy database migrations
- `npm run prisma:studio` - Mở Prisma Studio (GUI cho database)

## 📚 API Endpoints

API server sẽ chạy tại `http://localhost:3000`

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Seasons (Mùa vụ)
- `GET /api/seasons` - Lấy danh sách mùa vụ
- `POST /api/seasons` - Tạo mùa vụ mới
- `PUT /api/seasons/:id` - Cập nhật mùa vụ
- `DELETE /api/seasons/:id` - Xóa mùa vụ

### Debts (Công nợ)
- `GET /api/debts` - Lấy danh sách công nợ
- `POST /api/debts` - Tạo công nợ mới
- `PUT /api/debts/:id` - Cập nhật công nợ
- `DELETE /api/debts/:id` - Xóa công nợ

## 🛠️ Công nghệ sử dụng

- **Express.js** - Web framework
- **Prisma** - ORM
- **TypeScript** - Type safety
- **Zod** - Schema validation
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📝 License

ISC
