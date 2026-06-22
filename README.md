# 🏛️ Hệ thống Quản lý Hành chính Điện tử Cấp Phường/Xã

Hệ thống quản lý hành chính điện tử hiện đại, giúp người dân tiếp cận dịch vụ công dễ dàng, nhanh chóng và minh bạch.

## 📋 Tính năng chính

### Dành cho Người dân:
- ✅ **Nộp hồ sơ trực tuyến**: Nộp hồ sơ 24/7, không cần đến trực tiếp
- ✅ **Tra cứu hồ sơ**: Theo dõi tiến độ xử lý hồ sơ realtime
- ✅ **Phản ánh kiến nghị**: Gửi phản ánh, kiến nghị đến chính quyền
- ✅ **Xem phản hồi công khai**: Xem các phản ánh đã được giải quyết

### Dành cho Cán bộ:
- 📊 **Dashboard thống kê**: Thống kê tổng quan hệ thống
- 📁 **Quản lý hồ sơ**: Tiếp nhận, phân công, xử lý hồ sơ
- 💬 **Xử lý phản ánh**: Tiếp nhận và xử lý phản ánh của người dân
- 📄 **Quản lý văn bản**: Quản lý văn bản đến/đi
- 👥 **Quản lý người dùng**: Quản lý tài khoản và phân quyền

## 🛠️ Công nghệ sử dụng

### Backend:
- **Node.js** + **Express.js**: Framework backend
- **PostgreSQL**: Cơ sở dữ liệu quan hệ
- **JWT**: Xác thực và phân quyền
- **bcryptjs**: Mã hóa mật khẩu

### Frontend:
- **React 19**: Thư viện UI
- **React Router**: Điều hướng
- **Axios**: HTTP client
- **Vite**: Build tool

## 📦 Cài đặt

### 1. Yêu cầu hệ thống:
- Node.js >= 16.x
- PostgreSQL >= 12.x
- npm hoặc yarn

### 2. Cài đặt PostgreSQL:
1. Tải và cài đặt PostgreSQL từ: https://www.postgresql.org/download/
2. Tạo database mới:
```sql
CREATE DATABASE hanhchinh;
```

### 3. Cài đặt Backend:

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Cấu hình database trong file .env
# Đã có sẵn file .env với cấu hình mặc định

# Chạy script tạo database
# Mở PostgreSQL và chạy file: backend/src/config/database.sql
psql -U postgres -d hanhchinh -f src/config/database.sql

# Khởi động server
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

### 4. Cài đặt Frontend:

```bash
# Di chuyển vào thư mục frontend
cd fontend

# Cài đặt dependencies
npm install

# Khởi động development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## 🚀 Chạy hệ thống

### Chạy Backend:
```bash
cd backend
npm run dev
```

### Chạy Frontend:
```bash
cd fontend
npm run dev
```

## 👤 Tài khoản mặc định

Sau khi chạy script database, hệ thống sẽ có tài khoản admin mặc định:

**Tài khoản Admin:**
- Username: `admin`
- Password: `admin123`

**Lưu ý:** Nên đổi mật khẩu sau lần đăng nhập đầu tiên!

## 📁 Cấu trúc thư mục

```
hanhchinh/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Cấu hình database
│   │   ├── controllers/    # Controllers
│   │   ├── middlewares/    # Middlewares
│   │   ├── routes/         # API routes
│   │   ├── app.js          # Express app
│   │   └── server.js       # Server entry point
│   ├── .env                # Environment variables
│   └── package.json
│
├── fontend/                # Frontend React
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   ├── hooks/          # Custom hooks
│   │   ├── routes/         # Route configuration
│   │   ├── App.jsx         # Main App component
│   │   └── main.jsx        # Entry point
│   ├── .env                # Environment variables
│   └── package.json
│
└── README.md
```

## 🔧 Cấu hình

### Backend (.env):
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hanhchinh
DB_USER=postgres
DB_PASSWORD=123456
JWT_SECRET=ubnd_phuong_secret
```

### Frontend (.env):
```env
VITE_API_URL=http://localhost:5000/api
```

## 📊 Database Schema

Hệ thống sử dụng các bảng chính:
- `users`: Quản lý người dùng
- `files`: Quản lý hồ sơ
- `file_types`: Loại hồ sơ
- `feedbacks`: Phản ánh kiến nghị
- `incoming_documents`: Văn bản đến
- `outgoing_documents`: Văn bản đi
- `processing_history`: Lịch sử xử lý
- `notifications`: Thông báo

Chi tiết schema xem file: `backend/src/config/database.sql`

## 🔐 Phân quyền

Hệ thống có 4 loại người dùng:
1. **citizen**: Người dân
2. **staff**: Cán bộ xử lý
3. **leader**: Lãnh đạo
4. **admin**: Quản trị viên

## 🐛 Xử lý lỗi

### Lỗi kết nối database:
- Kiểm tra PostgreSQL đã chạy chưa
- Kiểm tra thông tin kết nối trong file `.env`
- Kiểm tra database đã được tạo chưa

### Lỗi CORS:
- Kiểm tra backend đã bật CORS
- Kiểm tra URL API trong frontend `.env`

### Lỗi 401 Unauthorized:
- Kiểm tra token đã hết hạn chưa
- Đăng xuất và đăng nhập lại

## 📝 API Documentation

### Authentication:
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/change-password` - Đổi mật khẩu

### Files:
- `GET /api/files` - Lấy danh sách hồ sơ
- `GET /api/files/:id` - Lấy chi tiết hồ sơ
- `POST /api/files` - Tạo hồ sơ mới
- `PUT /api/files/:id/status` - Cập nhật trạng thái
- `PUT /api/files/:id/assign` - Phân công xử lý

### Feedbacks:
- `GET /api/feedbacks` - Lấy danh sách phản ánh
- `GET /api/feedbacks/public` - Lấy phản ánh công khai
- `GET /api/feedbacks/:id` - Lấy chi tiết phản ánh
- `POST /api/feedbacks` - Tạo phản ánh mới
- `PUT /api/feedbacks/:id/status` - Cập nhật trạng thái

### Dashboard:
- `GET /api/dashboard/stats` - Thống kê tổng quan
- `GET /api/dashboard/stats-by-time` - Thống kê theo thời gian
- `GET /api/dashboard/recent-activities` - Hoạt động gần đây
- `GET /api/dashboard/pending-tasks` - Công việc cần xử lý

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.

## 📄 License

MIT License

## 📞 Liên hệ

- Email: support@phuong.gov.vn
- Website: https://phuong.gov.vn

---

**Phát triển bởi Đội ngũ CNTT - UBND Phường/Xã**
