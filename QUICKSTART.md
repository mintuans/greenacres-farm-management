# 🚀 Quick Start Guide

## Cấu trúc dự án mới

Dự án đã được tổ chức lại thành 2 phần độc lập:

```
greenacres-farm-management/
├── frontend/    # Ứng dụng React (Port 5173)
└── backend/     # API Server (Port 3000)
```

## Chạy dự án

### Cách 1: Chạy từng phần riêng biệt

**Terminal 1 - Backend:**
```bash
cd backend
yarn install    # Chỉ cần chạy lần đầu
yarn dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install     # Chỉ cần chạy lần đầu
npm run dev
```

### Cách 2: Chạy cả hai cùng lúc (từ thư mục gốc)

**Windows PowerShell:**
```powershell
# Chạy backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; yarn dev"

# Chạy frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

## URL truy cập

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## Lưu ý quan trọng

1. **Backend phải chạy trước** để Frontend có thể kết nối API
2. **PostgreSQL** phải được cài đặt và chạy cho Backend
3. Kiểm tra file `.env` trong thư mục `backend` để cấu hình database
4. File `.env.local` trong thư mục `frontend` để cấu hình API URL

## Cấu trúc thư mục

### Frontend (`/frontend`)
- `src/` - Mã nguồn React
- `public/` - Static assets
- `package.json` - Dependencies của Frontend

### Backend (`/backend`)
- `src/` - Mã nguồn Node.js/Express
- `package.json` - Dependencies của Backend
- `.env` - Cấu hình database và JWT

## Troubleshooting

### Backend không chạy được
- Kiểm tra PostgreSQL đã chạy chưa
- Kiểm tra file `.env` trong thư mục `backend`
- Chạy `yarn install` lại

### Frontend không kết nối được API
- Kiểm tra Backend đã chạy chưa
- Kiểm tra URL API trong file `.env.local` của Frontend
- Mở DevTools (F12) để xem lỗi trong Console

### Port bị chiếm
- Frontend: Vite sẽ tự động chọn port khác (5174, 5175...)
- Backend: Thay đổi PORT trong file `.env`

## Tài liệu chi tiết

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [Main README](./README.md)
