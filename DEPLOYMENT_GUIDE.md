# Hướng Quản Lý & Vận Hành GreenAcres Farm Management

Dự án đã được triển khai thành công trên VPS: **163.223.8.88**

## 1. Quản lý Backend (Node.js + PM2)
Dịch vụ backend được quản lý bởi PM2 để đảm bảo hoạt động 24/7.
- **Xem trạng thái:** `pm2 list`
- **Xem log lỗi Real-time:** `pm2 logs greenacres-api`
- **Khởi động lại:** `pm2 restart greenacres-api`
- **Lưu trạng thái (để tự khởi động khi reboot VPS):** `pm2 save`

## 2. Quản lý Frontend (Vite + Nginx)
Frontend được build thành các file tĩnh và phục vụ bởi Nginx.
- **Thư mục phục vụ:** `/var/www/greenacres-farm-management/frontend/dist`
- **Cập nhật giao diện:**
  1. `cd /var/www/greenacres-farm-management/frontend`
  2. `npm run build`
- **Kiểm tra Nginx:** `nginx -t`
- **Khởi động lại Nginx:** `systemctl restart nginx`

## 3. Cấu hình Quan trọng
- **Nginx Config:** `/etc/nginx/sites-available/default`
- **Backend .env:** `/var/www/greenacres-farm-management/backend/.env` (Chứa DATABASE_URL)
- **Frontend .env:** `/var/www/greenacres-farm-management/frontend/.env` (Chứa VITE_API_URL)

## 4. Xử lý sự cố thường gặp
- **Lỗi 502/504:** Do backend (PM2) bị sập. Hãy chạy `pm2 restart 0`.
- **Lỗi 500:** Vấn đề phân quyền thư mục hoặc Nginx không tìm thấy file index.html.
- **Lỗi Connection Refused:** Do Nginx bị sập hoặc Firewall (UFW) chưa mở cổng 80.

---
*Tài liệu này được tạo tự động bởi Antigravity để hỗ trợ quản trị hệ thống.*
