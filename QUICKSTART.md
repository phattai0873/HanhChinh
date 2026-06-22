# ⚡ CHẠY HỆ THỐNG - HƯỚNG DẪN NHANH

## 📋 Checklist trước khi chạy:
- [x] PostgreSQL đã cài đặt và đang chạy
- [x] Database `hanhchinh` đã tồn tại
- [ ] Đã chạy script tạo bảng
- [ ] Đã tạo tài khoản admin
- [ ] Backend dependencies đã cài
- [ ] Frontend dependencies đã cài

## 🔥 BƯỚC 1: Setup Database

### Cách 1: Dùng psql (Command Line)
```bash
# Chạy từ thư mục gốc e:\hanhchinh
psql -U postgres -d hanhchinh -f backend\src\config\database.sql
```
Nhập mật khẩu postgres khi được yêu cầu.

### Cách 2: Dùng pgAdmin (GUI)
1. Mở pgAdmin
2. Kết nối vào database `hanhchinh`
3. Mở Query Tool
4. Copy nội dung file `backend\src\config\database.sql` và chạy

## 🔥 BƯỚC 2: Tạo tài khoản Admin

```bash
cd backend
node src\scripts\init-db.js
```

Kết quả sẽ hiển thị:
```
✅ Đã tạo tài khoản admin
   Username: admin
   Password: admin123
✅ Đã tạo tài khoản cán bộ mẫu
   Username: canbo1, canbo2
   Password: staff123
✅ Đã tạo tài khoản người dân mẫu
   Username: nguoidan1
   Password: citizen123
```

## 🔥 BƯỚC 3: Chạy Backend

```bash
# Từ thư mục backend
cd backend
npm run dev
```

Kết quả mong đợi:
```
✅ Database connected successfully
🚀 Server is running on port 5000
📍 API: http://localhost:5000/api
```

## 🔥 BƯỚC 4: Chạy Frontend

Mở terminal MỚI (giữ backend chạy):

```bash
# Từ thư mục gốc
cd fontend
npm run dev
```

Kết quả mong đợi:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🎯 BƯỚC 5: Truy cập hệ thống

1. Mở trình duyệt: **http://localhost:5173**
2. Đăng nhập với tài khoản:
   - **Admin**: `admin` / `admin123`
   - **Cán bộ**: `canbo1` / `staff123`
   - **Người dân**: `nguoidan1` / `citizen123`

## ⚠️ XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi 1: Backend không kết nối được database
```
❌ Failed to start server: error: password authentication failed
```
**Giải pháp:**
- Mở file `backend\.env`
- Sửa `DB_PASSWORD=123456` thành mật khẩu postgres của bạn

### Lỗi 2: Frontend báo lỗi CORS
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Giải pháp:**
- Kiểm tra backend đã chạy chưa (http://localhost:5000)
- Kiểm tra file `fontend\.env` có đúng: `VITE_API_URL=http://localhost:5000/api`

### Lỗi 3: Module not found
```
Error: Cannot find module 'axios'
```
**Giải pháp:**
```bash
# Trong thư mục backend
cd backend
npm install

# Trong thư mục frontend
cd fontend
npm install
```

### Lỗi 4: Port đã được sử dụng
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Giải pháp:**
- Tắt ứng dụng đang dùng port 5000
- Hoặc đổi port trong `backend\.env`: `PORT=5001`

## 🧪 KIỂM TRA HỆ THỐNG

### Test Backend API:
```bash
# Kiểm tra health check
curl http://localhost:5000/api/health

# Kết quả mong đợi:
{"status":"OK","message":"Server is running"}
```

### Test Frontend:
- Mở http://localhost:5173
- Trang login phải hiển thị đẹp với gradient tím
- Không có lỗi trong Console (F12)

## 📊 CÁC LỆNH HỮU ÍCH

```bash
# Xem logs backend
cd backend
npm run dev

# Xem logs frontend
cd fontend
npm run dev

# Kết nối database
psql -U postgres -d hanhchinh

# Xem danh sách bảng
\dt

# Xem users
SELECT username, role FROM users;

# Thoát psql
\q
```

## 🎉 HOÀN TẤT!

Nếu tất cả các bước trên thành công, bạn sẽ có:
- ✅ Backend chạy tại http://localhost:5000
- ✅ Frontend chạy tại http://localhost:5173
- ✅ Database với dữ liệu mẫu
- ✅ 3 tài khoản test (admin, cán bộ, người dân)

**Bắt đầu khám phá hệ thống!** 🚀
