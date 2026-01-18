# Hướng dẫn khởi động lại Backend Server

## Vấn đề hiện tại
Route `/api/management/database/backups` đã được thêm vào code nhưng backend server chưa được restart nên route chưa có hiệu lực.

## Giải pháp

### Bước 1: Dừng backend server hiện tại
Nếu backend đang chạy trong terminal:
- Nhấn `Ctrl + C` để dừng server

### Bước 2: Khởi động lại backend
```powershell
cd backend
npm run dev
```

### Bước 3: Kiểm tra log
Sau khi khởi động, bạn sẽ thấy log:
```
🚀 Server is running on port 3000
📍 Environment: development
🔗 API: http://localhost:3000/api
✅ Database connected successfully!
```

### Bước 4: Test lại
1. Mở trình duyệt và vào: `http://localhost:5173/#/settings/database-backup`
2. Nhấn nút "Tạo Backup Mới"
3. Kiểm tra xem có lỗi 404 không

## Lưu ý
- Mỗi khi thay đổi code backend (routes, controllers, services), bạn cần restart server
- Frontend (Vite) tự động reload khi có thay đổi, không cần restart
- Backend (Node.js với tsx) cần restart thủ công hoặc dùng nodemon

## Alternative: Sử dụng nodemon (tự động restart)
Nếu muốn backend tự động restart khi có thay đổi:

1. Cài đặt nodemon:
```powershell
cd backend
npm install -D nodemon
```

2. Thêm script vào `package.json`:
```json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "dev:nodemon": "nodemon --exec tsx src/server.ts"
}
```

3. Chạy với nodemon:
```powershell
npm run dev:nodemon
```
