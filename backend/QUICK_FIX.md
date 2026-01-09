# 🚨 QUICK FIX - Lỗi npm install ECONNRESET

## ⚡ Giải pháp nhanh (Copy & Paste)

### Bước 1: Xóa cache và cấu hình lại npm
```powershell
npm cache clean --force
npm config set registry https://registry.npmmirror.com
npm config set fetch-timeout 60000
npm install
```

### Bước 2: Nếu vẫn lỗi, dùng Yarn
```powershell
# Cài Yarn
npm install -g yarn

# Hoặc nếu npm không hoạt động, download từ:
# https://classic.yarnpkg.com/en/docs/install#windows-stable

# Cài dependencies bằng Yarn
yarn install
```

### Bước 3: Nếu cả hai đều lỗi
```powershell
# Đổi DNS sang Google DNS (8.8.8.8 và 8.8.4.4)
# Hoặc dùng mobile hotspot
# Hoặc tắt Firewall/Antivirus tạm thời
```

## 📚 Tài liệu chi tiết

- **FIX_NPM_ERROR.md** - 10 giải pháp chi tiết
- **USE_YARN_INSTEAD.md** - Hướng dẫn dùng Yarn

## ✅ Sau khi cài thành công

```powershell
npm run prisma:generate
npm run prisma:migrate
npm run test:db
npm run dev
```

---

**Đang chạy `npm install`? Hãy kiên nhẫn, có thể mất 5-10 phút!**
