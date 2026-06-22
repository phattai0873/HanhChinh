# Hành Chính Backend

Backend API cho ứng dụng Hành Chính

## Yêu cầu

- Node.js >= 14
- MongoDB >= 4.4
- npm hoặc yarn

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd backend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` và cấu hình:
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hanhchinh
NODE_ENV=development
JWT_SECRET=your_secret_key_here
```

## Chạy ứng dụng

### Development mode (với hot reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

## Cấu trúc thư mục

```
src/
├── config/          # Database configuration
├── controllers/     # Route handlers
├── routes/          # API routes
├── middlewares/     # Custom middlewares
├── app.js          # Express app setup
└── server.js       # Server entry point
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files` - Get all files
- `DELETE /api/files/:id` - Delete file

### Feedback
- `POST /api/feedback` - Create feedback
- `GET /api/feedback` - Get all feedback
- `PUT /api/feedback/:id` - Update feedback
- `DELETE /api/feedback/:id` - Delete feedback

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

## License

ISC
