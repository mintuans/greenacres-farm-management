# 🔧 Giải quyết lỗi npm install - ECONNRESET

## ❌ Lỗi gặp phải:
```
npm error code ECONNRESET
npm error network request to https://registry.npmjs.org/@prisma%2fclient failed
npm error network This is a problem related to network connectivity.
```

## ✅ Giải pháp (Thử theo thứ tự)

### Giải pháp 1: Xóa cache npm và thử lại

```powershell
# Xóa npm cache
npm cache clean --force

# Thử cài lại
npm install
```

### Giải pháp 2: Sử dụng registry khác (Khuyên dùng cho VN)

```powershell
# Sử dụng Taobao mirror (nhanh hơn ở VN)
npm config set registry https://registry.npmmirror.com

# Hoặc sử dụng registry mặc định
npm config set registry https://registry.npmjs.org

# Thử cài lại
npm install
```

### Giải pháp 3: Tăng timeout

```powershell
# Tăng timeout lên 60 giây
npm config set fetch-timeout 60000

# Thử cài lại
npm install
```

### Giải pháp 4: Tắt SSL (Temporary)

```powershell
# Tắt strict SSL (chỉ dùng tạm thời)
npm config set strict-ssl false

# Thử cài lại
npm install

# Sau khi cài xong, bật lại
npm config set strict-ssl true
```

### Giải pháp 5: Sử dụng yarn thay vì npm

```powershell
# Cài yarn (nếu chưa có)
npm install -g yarn

# Sử dụng yarn để cài
yarn install
```

### Giải pháp 6: Cài từng package một

```powershell
# Cài dependencies chính
npm install express cors dotenv bcryptjs jsonwebtoken zod

# Cài Prisma
npm install @prisma/client

# Cài dev dependencies
npm install -D @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/node prisma tsx typescript
```

### Giải pháp 7: Kiểm tra kết nối mạng

```powershell
# Test kết nối đến npm registry
curl https://registry.npmjs.org

# Hoặc
ping registry.npmjs.org
```

### Giải pháp 8: Sử dụng VPN hoặc đổi DNS

```powershell
# Đổi DNS sang Google DNS
# 1. Mở Network Settings
# 2. Change adapter options
# 3. Properties → IPv4 → Use the following DNS:
#    Preferred: 8.8.8.8
#    Alternate: 8.8.4.4
```

### Giải pháp 9: Kiểm tra Firewall/Antivirus

- Tạm thời tắt Firewall/Antivirus
- Thử `npm install` lại
- Nhớ bật lại sau khi cài xong

### Giải pháp 10: Sử dụng proxy (nếu có)

```powershell
# Nếu bạn đang dùng proxy
npm config set proxy http://proxy-server:port
npm config set https-proxy http://proxy-server:port

# Xóa proxy config
npm config delete proxy
npm config delete https-proxy
```

## 🚀 Giải pháp nhanh nhất (Khuyên dùng):

```powershell
# Bước 1: Xóa cache
npm cache clean --force

# Bước 2: Dùng registry Taobao (nhanh ở VN)
npm config set registry https://registry.npmmirror.com

# Bước 3: Tăng timeout
npm config set fetch-timeout 60000

# Bước 4: Thử lại
npm install

# Nếu vẫn lỗi, thử yarn
npm install -g yarn
yarn install
```

## 🔍 Kiểm tra cấu hình npm hiện tại

```powershell
# Xem registry đang dùng
npm config get registry

# Xem tất cả config
npm config list

# Reset về mặc định
npm config delete registry
npm config delete proxy
npm config delete https-proxy
```

## ⚡ Nếu tất cả đều thất bại:

### Cài offline (dùng file đã tải sẵn)

Tôi có thể tạo một file `package.json` đơn giản hơn với ít dependencies hơn, sau đó cài dần dần.

Hoặc bạn có thể:
1. Dùng mạng khác (mobile hotspot)
2. Thử vào thời gian khác (khi mạng ổn định hơn)
3. Sử dụng VPN

## 📝 Lưu ý

- Lỗi `ECONNRESET` thường do:
  - Mạng không ổn định
  - Firewall/Antivirus chặn
  - DNS không phân giải được
  - Proxy settings sai
  - npm registry bị chặn

- Giải pháp tốt nhất cho VN: **Dùng Taobao mirror**

## ✅ Sau khi cài thành công

```powershell
# Kiểm tra packages đã cài
npm list --depth=0

# Chạy tiếp các bước
npm run prisma:generate
npm run prisma:migrate
npm run test:db
```
