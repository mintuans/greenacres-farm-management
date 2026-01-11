# OAuth Setup Guide

Hướng dẫn cấu hình Google và Facebook OAuth cho GreenAcres Farm Management System.

## 📋 Tổng quan

Hệ thống đã được tích hợp đầy đủ OAuth 2.0 cho:
- ✅ Google Login
- ✅ Facebook Login

## 🔧 Bước 1: Cấu hình Google OAuth

### 1.1. Tạo Google OAuth Credentials

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Vào **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Chọn **Application type**: Web application
6. Điền thông tin:
   - **Name**: GreenAcres Farm App
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/google/callback` (development)
     - `https://api.yourdomain.com/api/auth/google/callback` (production)
7. Click **Create** và lưu lại:
   - **Client ID**
   - **Client Secret**

### 1.2. Cấu hình trong `.env`

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

## 🔧 Bước 2: Cấu hình Facebook OAuth

### 2.1. Tạo Facebook App

1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Chọn **Consumer** > **Next**
4. Điền thông tin:
   - **App Name**: GreenAcres Farm
   - **App Contact Email**: your-email@example.com
5. Click **Create App**

### 2.2. Cấu hình Facebook Login

1. Trong dashboard app, vào **Add Product**
2. Chọn **Facebook Login** > **Set Up**
3. Chọn **Web**
4. Điền **Site URL**: `http://localhost:5173`
5. Vào **Facebook Login** > **Settings**
6. Thêm **Valid OAuth Redirect URIs**:
   - `http://localhost:3000/api/auth/facebook/callback` (development)
   - `https://api.yourdomain.com/api/auth/facebook/callback` (production)
7. Save changes

### 2.3. Lấy App Credentials

1. Vào **Settings** > **Basic**
2. Lưu lại:
   - **App ID**
   - **App Secret** (click Show để xem)

### 2.4. Cấu hình trong `.env`

```env
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback
```

## 🔧 Bước 3: Cập nhật Database Schema

Thêm các cột cho OAuth vào bảng `users`:

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Tạo index cho tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_facebook_id ON users(facebook_id);
```

## 🔧 Bước 4: Cấu hình Frontend

Tạo file `.env` trong thư mục `frontend`:

```env
VITE_API_URL=http://localhost:3000
```

## 🚀 Bước 5: Chạy ứng dụng

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm run dev
```

## 🧪 Kiểm tra OAuth Flow

### Google Login Flow:
1. Click nút "Google" trên trang login
2. Redirect đến `http://localhost:3000/api/auth/google`
3. Google hiển thị màn hình đồng ý
4. Sau khi đồng ý, redirect về `http://localhost:3000/api/auth/google/callback`
5. Backend tạo/cập nhật user và tạo JWT token
6. Redirect về frontend `http://localhost:5173/#/auth/callback?token=xxx&provider=google`
7. Frontend lưu token và fetch user info
8. Redirect đến dashboard

### Facebook Login Flow:
Tương tự như Google, chỉ khác endpoint là `/api/auth/facebook`

## 🔒 Bảo mật

### Production Checklist:
- [ ] Thay đổi `JWT_SECRET` thành giá trị ngẫu nhiên mạnh
- [ ] Cập nhật `FRONTEND_URL` thành domain thật
- [ ] Thêm HTTPS cho tất cả các URL
- [ ] Giới hạn CORS origins
- [ ] Bật rate limiting cho OAuth endpoints
- [ ] Thêm logging cho OAuth events
- [ ] Backup OAuth credentials an toàn

## 📝 Troubleshooting

### Lỗi "redirect_uri_mismatch"
- Kiểm tra lại redirect URI trong Google/Facebook console
- Đảm bảo URL khớp chính xác (bao gồm cả protocol http/https)

### Lỗi "No email found"
- Google: Đảm bảo scope bao gồm 'email'
- Facebook: Yêu cầu permission 'email' trong scope

### Lỗi "Cannot find module 'passport'"
```bash
cd backend
npm install passport passport-google-oauth20 passport-facebook
npm install --save-dev @types/passport @types/passport-google-oauth20 @types/passport-facebook
```

## 📚 Tài liệu tham khảo

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Passport.js Documentation](http://www.passportjs.org/)

## ✅ Checklist hoàn thành

- [x] Backend OAuth routes
- [x] Passport strategies (Google + Facebook)
- [x] Database schema updated
- [x] Frontend OAuth handlers
- [x] AuthCallback page
- [x] Environment variables configured
- [ ] Google OAuth credentials (cần người dùng tự setup)
- [ ] Facebook OAuth credentials (cần người dùng tự setup)
- [ ] Testing trên production

---

**Lưu ý**: Để OAuth hoạt động, bạn PHẢI có Google Client ID/Secret và Facebook App ID/Secret. Hãy làm theo hướng dẫn trên để lấy credentials.
