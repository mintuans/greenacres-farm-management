# 🔄 Giải pháp thay thế - Sử dụng Yarn

Nếu `npm install` vẫn gặp lỗi ECONNRESET, bạn có thể sử dụng **Yarn** thay thế.

## 📦 Cài đặt Yarn

### Cách 1: Cài qua npm (nếu npm vẫn hoạt động một phần)
```powershell
npm install -g yarn
```

### Cách 2: Cài qua Chocolatey
```powershell
# Cài Chocolatey (nếu chưa có)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Cài Yarn
choco install yarn
```

### Cách 3: Download trực tiếp
1. Truy cập: https://classic.yarnpkg.com/en/docs/install#windows-stable
2. Download installer
3. Chạy file .msi

## 🚀 Sử dụng Yarn

```powershell
# Di chuyển vào thư mục backend
cd backend

# Cài dependencies
yarn install

# Hoặc
yarn
```

## ⚙️ Cấu hình Yarn (nếu cần)

```powershell
# Sử dụng Taobao registry
yarn config set registry https://registry.npmmirror.com

# Tăng timeout
yarn config set network-timeout 60000
```

## 📝 Các lệnh tương đương

| npm | yarn |
|-----|------|
| `npm install` | `yarn` hoặc `yarn install` |
| `npm install [package]` | `yarn add [package]` |
| `npm install -D [package]` | `yarn add -D [package]` |
| `npm run [script]` | `yarn [script]` |
| `npm uninstall [package]` | `yarn remove [package]` |

## 🎯 Sau khi cài xong

```powershell
# Kiểm tra packages
yarn list --depth=0

# Chạy scripts (giống npm)
yarn prisma:generate
yarn prisma:migrate
yarn test:db
yarn dev
```

## 💡 Ưu điểm của Yarn

- Nhanh hơn npm
- Ổn định hơn với mạng không tốt
- Có offline cache
- Deterministic (luôn cài cùng version)

## 🔄 Chuyển đổi giữa npm và yarn

### Từ npm sang yarn:
```powershell
# Xóa node_modules và package-lock.json
rm -r node_modules
rm package-lock.json

# Cài bằng yarn
yarn install
```

### Từ yarn về npm:
```powershell
# Xóa node_modules và yarn.lock
rm -r node_modules
rm yarn.lock

# Cài bằng npm
npm install
```

## ⚠️ Lưu ý

- Không nên mix npm và yarn trong cùng một project
- Chọn một trong hai và stick với nó
- Nếu dùng yarn, commit `yarn.lock` thay vì `package-lock.json`

## 🆘 Nếu yarn cũng lỗi

Thử các giải pháp sau:

### 1. Kiểm tra mạng
```powershell
# Test kết nối
ping registry.npmmirror.com
curl https://registry.npmmirror.com
```

### 2. Đổi DNS
- Đổi sang Google DNS: 8.8.8.8 và 8.8.4.4
- Hoặc Cloudflare DNS: 1.1.1.1 và 1.0.0.1

### 3. Tắt Firewall/Antivirus tạm thời
- Tắt Windows Defender Firewall
- Tắt Antivirus
- Thử cài lại
- Nhớ bật lại sau khi xong

### 4. Dùng mobile hotspot
- Kết nối máy tính với hotspot điện thoại
- Thử cài lại

### 5. Cài từng package
```powershell
yarn add express cors dotenv bcryptjs jsonwebtoken zod
yarn add @prisma/client
yarn add -D @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/node prisma tsx typescript
```

## ✅ Checklist

- [ ] Đã thử `npm cache clean --force`
- [ ] Đã đổi npm registry sang Taobao
- [ ] Đã tăng timeout
- [ ] Đã thử npm install lại
- [ ] Đã cài Yarn
- [ ] Đã thử `yarn install`
- [ ] Đã kiểm tra mạng
- [ ] Đã thử đổi DNS
- [ ] Đã thử tắt Firewall
- [ ] Đã thử mobile hotspot

---

**Nếu tất cả đều thất bại, có thể là vấn đề từ ISP hoặc mạng của bạn. Hãy thử vào thời gian khác hoặc dùng mạng khác!**
