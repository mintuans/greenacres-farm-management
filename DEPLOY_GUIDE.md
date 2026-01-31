# Hướng dẫn triển khai GreenAcres lên VPS Ubuntu 24.04

Dưới đây là các bước để cài đặt môi trường và đẩy code lên server `163.223.8.88`.

## 1. Kết nối vào Server
Mở PowerShell/Terminal:
```bash
ssh root@163.223.8.88
# Mật khẩu: mt!123456
```

## 2. Cập nhật hệ thống và cài đặt môi trường cơ bản
Sau khi đăng nhập thành công, chạy các lệnh sau:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget build-essential
```

## 3. Cài đặt Node.js (Phiên bản 20 LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

## 4. Tạo Swap RAM (QUAN TRỌNG - Vì VPS có 2GB RAM)
Lệnh này giúp server không bị treo khi bạn build code:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 5. Cài đặt PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Tạo Database và User (Thay mật khẩu theo ý bạn)
sudo -i -u postgres psql -c "CREATE DATABASE greenacres;"
sudo -i -u postgres psql -c "CREATE USER farm_user WITH PASSWORD 'your_secure_password';"
sudo -i -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE greenacres TO farm_user;"
```

## 6. Triển khai Code
Bạn có thể dùng Git để kéo code về:
```bash
cd /var/www
git clone <URL_CLONE_CỦA_BẠN> greenacres
cd greenacres
```

### Triển khai Backend:
```bash
cd backend
npm install
# Tạo file .env và điền thông tin (Database URL, JWT Secret...)
cp .env.example .env
nano .env 
# Chạy Migration
npx prisma migrate deploy
# Cài đặt PM2 để chạy ngầm
sudo npm install -g pm2
pm2 start dist/server.js --name "greenacres-api"
```

### Triển khai Frontend (Sử dụng Nginx):
```bash
cd ../frontend
npm install
npm run build
# Sau đó cấu hình Nginx để trỏ vào thư mục dist
```

## 7. Cài đặt Nginx và SSL
```bash
sudo apt install -y nginx
# Cấu hình Nginx tại /etc/nginx/sites-available/default
```

---
*Lưu ý: Luôn bảo mật file .env và không chia sẻ mật khẩu root cho người lạ.*
