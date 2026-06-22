# 🚀 HƯỚNG DẪN SETUP NHANH

## Bước 1: Tạo bảng trong database

Mở PowerShell/CMD và chạy lệnh sau (nhập mật khẩu postgres khi được yêu cầu):

```bash
psql -U postgres -d hanhchinh -f backend\src\config\database.sql
```

Hoặc mở pgAdmin và chạy file `backend\src\config\database.sql`

## Bước 2: Khởi tạo dữ liệu mẫu (tài khoản admin)

```bash
cd backend
node src\scripts\init-db.js
```

## Bước 3: Chạy Backend

```bash
cd backend
npm run dev
```

Backend sẽ chạy tại: http://localhost:5000

## Bước 4: Chạy Frontend

Mở terminal mới:

```bash
cd fontend
npm run dev
```

Frontend sẽ chạy tại: http://localhost:5173

## 🎯 Tài khoản đăng nhập

### Admin:
- Username: `admin`
- Password: `admin123`

### Cán bộ:
- Username: `canbo1` hoặc `canbo2`
- Password: `staff123`

### Người dân:
- Username: `nguoidan1`
- Password: `citizen123`

## ⚠️ Lưu ý

- Đảm bảo PostgreSQL đang chạy
- Kiểm tra thông tin kết nối trong `backend\.env`:
  - DB_HOST=localhost
  - DB_PORT=5432
  - DB_NAME=hanhchinh
  - DB_USER=postgres
  - DB_PASSWORD=123456

## 🐛 Xử lý lỗi

### Nếu backend báo lỗi kết nối database:
1. Kiểm tra PostgreSQL đã chạy chưa
2. Kiểm tra mật khẩu trong file `backend\.env`
3. Kiểm tra database `hanhchinh` đã được tạo chưa

### Nếu frontend báo lỗi CORS:
1. Kiểm tra backend đã chạy chưa
2. Kiểm tra URL trong `fontend\.env`: VITE_API_URL=http://localhost:5000/api

## 📝 Các lệnh hữu ích

```bash
# Kiểm tra PostgreSQL version
psql --version

# Kết nối vào database
psql -U postgres -d hanhchinh

# Xem danh sách bảng
\dt

# Xem dữ liệu bảng users
SELECT * FROM users;

# Thoát psql
\q
```

## 🎉 Hoàn tất!

Sau khi hoàn thành các bước trên:
1. Truy cập http://localhost:5173
2. Đăng nhập với tài khoản admin
3. Khám phá hệ thống!
