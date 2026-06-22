# 📧 Email Notification System

## ✨ Tính năng đã triển khai

### 1. 📝 Dịch vụ công (Applications)
- ✅ **Email xác nhận** khi người dùng nộp hồ sơ mới
- ✅ **Email thông báo** khi admin cập nhật trạng thái
- ✅ **Thông báo ngày hẹn** (appointment date) - Hiển thị nổi bật trong email
- ✅ **Ghi chú từ cơ quan** - Hiển thị khi admin thêm ghi chú

### 2. 💬 Liên hệ (Contacts)
- ✅ **Email phản hồi** khi admin trả lời liên hệ của người dùng

### 3. 📢 Phản ánh (Feedbacks)
- ✅ **Email thông báo** khi admin phản hồi phản ánh

## 🎨 Thiết kế Email

### Template đẹp mắt với:
- 🎨 Gradient header (Purple/Green)
- 🏷️ Badge trạng thái có màu sắc
- 📅 Box ngày hẹn nổi bật (màu vàng)
- 📝 Box ghi chú từ cơ quan
- 🔗 Button link tra cứu hồ sơ
- 📱 Responsive design

### Màu sắc trạng thái:
- 🟡 **Chờ xử lý** - Vàng (#f59e0b)
- 🔵 **Đang xử lý** - Xanh dương (#3b82f6)
- 🟢 **Đã hoàn thành** - Xanh lá (#10b981)
- 🔴 **Từ chối** - Đỏ (#ef4444)

## ⚙️ Cấu hình nhanh

### 1. Tạo file `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
```

### 2. Tạo App Password (Gmail):

1. Truy cập: https://myaccount.google.com/security
2. Bật "2-Step Verification"
3. Tạo "App passwords" → Mail → Other
4. Copy password vào `EMAIL_PASSWORD`

### 3. Khởi động lại server:

```bash
npm start
```

Kiểm tra console log:
```
✅ Email server is ready to send messages
```

## 📂 Cấu trúc Code

```
backend/
├── src/
│   ├── services/
│   │   └── email.service.js          # ⭐ Email service chính
│   └── controllers/
│       ├── application.controller.js  # Gửi email xác nhận nộp hồ sơ
│       ├── file.controller.js         # Gửi email cập nhật trạng thái
│       ├── contact.controller.js      # Gửi email phản hồi liên hệ
│       └── feedback.controller.js     # Gửi email phản hồi feedback
└── EMAIL_NOTIFICATION_GUIDE.md        # 📖 Hướng dẫn chi tiết
```

## 🚀 Sử dụng

### Ví dụ gửi email trong controller:

```javascript
const emailService = require('../services/email.service');

// Gửi email xác nhận nộp hồ sơ
emailService.sendApplicationConfirmation(email, {
    application_code: 'HS1738045200000',
    service_name: 'Đăng ký khai sinh',
    form_data: { fullName: 'Nguyễn Văn A' }
});

// Gửi email cập nhật trạng thái (có ngày hẹn)
emailService.sendApplicationStatusEmail(email, {
    citizen_name: 'Nguyễn Văn A',
    application_code: 'HS1738045200000',
    service_name: 'Đăng ký khai sinh',
    status: 'processing',
    admin_note: 'Hồ sơ đang được xử lý',
    appointment_date: '2026-01-30T10:00:00'  // ⭐ Ngày hẹn
});

// Gửi email phản hồi liên hệ
emailService.sendContactReplyEmail(email, {
    name: 'Nguyễn Văn A',
    subject: 'Hỏi về thủ tục',
    admin_reply: 'Cảm ơn bạn đã liên hệ...'
});
```

## 🎯 Điểm nổi bật

### ⭐ Tính năng ngày hẹn (Appointment Date)

Khi admin đặt ngày hẹn, email sẽ hiển thị:

```
📅 Thông báo ngày hẹn
Ngày hẹn: 30 tháng 1, 2026 lúc 10:00
Vui lòng đến đúng giờ để nhận kết quả hoặc hoàn tất thủ tục.
```

### 🛡️ Error Handling

- Email gửi **không chặn** luồng chính
- Lỗi được log nhưng không làm crash server
- Hệ thống vẫn hoạt động nếu email service down

### 📧 Email Templates

Tất cả template được tập trung trong `email.service.js`:
- `getApplicationConfirmationTemplate()` - Xác nhận nộp hồ sơ
- `getApplicationStatusEmailTemplate()` - Cập nhật trạng thái
- `getContactReplyEmailTemplate()` - Phản hồi liên hệ
- `getFeedbackReplyEmailTemplate()` - Phản hồi feedback

## 🐛 Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| Invalid login | Sai email/password | Kiểm tra `.env`, dùng App Password |
| Connection timeout | Không kết nối SMTP | Kiểm tra host/port, firewall |
| Email không gửi | Không có email người nhận | Kiểm tra database có email |

## 📖 Tài liệu chi tiết

Xem file `EMAIL_NOTIFICATION_GUIDE.md` để biết:
- Hướng dẫn cấu hình chi tiết
- Cấu trúc code đầy đủ
- Testing và debugging
- Best practices
- Mở rộng tính năng

## 🎉 Demo

### Email xác nhận nộp hồ sơ:
![Email Confirmation](https://via.placeholder.com/600x400/10b981/ffffff?text=Email+Xac+Nhan)

### Email cập nhật trạng thái (có ngày hẹn):
![Email Status Update](https://via.placeholder.com/600x400/667eea/ffffff?text=Email+Cap+Nhat)

### Email phản hồi liên hệ:
![Email Contact Reply](https://via.placeholder.com/600x400/667eea/ffffff?text=Email+Phan+Hoi)

---

**Phát triển bởi:** Hệ thống Hành chính Điện tử  
**Ngày cập nhật:** 27/01/2026  
**Version:** 1.0.0
