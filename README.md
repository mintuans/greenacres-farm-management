# 🏡 Vườn Nhà Mình - Farm Management

Hệ thống quản lý nông trại toàn diện với giao diện hiện đại.

## 📁 Cấu trúc dự án

Dự án được tổ chức thành 2 phần độc lập:

```
greenacres-farm-management/
├── frontend/              # Ứng dụng Frontend (React + TypeScript)
│   ├── src/              # Mã nguồn chính
│   │   ├── @types/      # Định nghĩa các kiểu dữ liệu
│   │   ├── api/         # Các hàm gọi API tới Backend
│   │   ├── assets/      # Tài nguyên tĩnh
│   │   ├── components/  # Các thành phần giao diện
│   │   ├── contexts/    # React Contexts (Auth, Cart, etc.)
│   │   ├── hooks/       # Custom Hooks
│   │   ├── pages/       # Các trang chính
│   │   ├── routes/      # Cấu hình điều hướng
│   │   ├── templates/   # Layouts
│   │   ├── themes/      # Cấu hình theme
│   │   ├── utils/       # Hàm tiện ích
│   │   └── validators/  # Validation
│   ├── package.json     # Dependencies của Frontend
│   ├── vite.config.ts   # Cấu hình Vite
│   └── README.md        # Hướng dẫn Frontend
│
├── backend/              # Ứng dụng Backend (Node.js + Express)
│   ├── src/             # Mã nguồn Backend
│   │   ├── config/      # Cấu hình database, JWT, etc.
│   │   ├── controllers/ # Controllers xử lý request
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── middleware/  # Middleware functions
│   ├── package.json     # Dependencies của Backend
│   └── README.md        # Hướng dẫn Backend
│
└── README.md            # File này - Tổng quan dự án
```

## 🚀 Cài đặt và chạy

### Frontend

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build
```

Frontend sẽ chạy tại: `http://localhost:5173`

### Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
yarn install

# Chạy development server
yarn dev

# Build production
yarn build
```

Backend API sẽ chạy tại: `http://localhost:3000`

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling
- **Material Symbols** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web Framework
- **TypeScript** - Type Safety
- **PostgreSQL** - Database
- **JWT** - Authentication

## 📝 Quy tắc code

- Sử dụng TypeScript cho tất cả các file
- Import alias `@/` trỏ đến thư mục gốc dự án
- Components phải có type definitions rõ ràng
- Tách logic phức tạp vào custom hooks
- API calls phải được tổ chức trong thư mục `src/api/`

## 🎨 Thiết kế

- Màu chủ đạo: `#13ec49` (Green)
- Font chữ: Inter
- Icons: Material Symbols Outlined

## 📖 Tài liệu chi tiết

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
