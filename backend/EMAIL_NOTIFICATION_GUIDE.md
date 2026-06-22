# Hướng dẫn Email Notification - Hệ thống Hành chính Điện tử

## Tổng quan

Hệ thống đã được tích hợp tính năng gửi email thông báo tự động cho người dùng trong các trường hợp sau:

### 1. **Dịch vụ công (Applications)**
- ✅ Xác nhận khi nộp hồ sơ mới
- ✅ Thông báo khi có cập nhật trạng thái
- ✅ Thông báo ngày hẹn (appointment date)
- ✅ Thông báo ghi chú từ cơ quan

### 2. **Liên hệ (Contacts)**
- ✅ Thông báo khi admin phản hồi liên hệ

### 3. **Phản ánh (Feedbacks)**
- ✅ Thông báo khi có phản hồi từ cơ quan

## Cấu hình Email

### Bước 1: Cấu hình file `.env`

Thêm các biến môi trường sau vào file `.env`:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

### Bước 2: Tạo App Password cho Gmail

Nếu bạn sử dụng Gmail:

1. Truy cập: https://myaccount.google.com/security
2. Bật xác thực 2 bước (2-Step Verification)
3. Tạo App Password:
   - Vào "App passwords"
   - Chọn "Mail" và "Other (Custom name)"
   - Nhập tên: "Hanh Chinh Dien Tu"
   - Copy mật khẩu 16 ký tự và dán vào `EMAIL_PASSWORD`

### Bước 3: Kiểm tra cấu hình

Backend sẽ tự động verify email configuration khi khởi động. Kiểm tra console log:

```
✅ Email server is ready to send messages
```

Nếu có lỗi:
```
❌ Email server verification failed: [error message]
⚠️  Email notifications will be disabled. Please configure email settings in .env file
```

## Cấu trúc Code

### Email Service (`src/services/email.service.js`)

File này chứa tất cả logic gửi email:

```javascript
// Các hàm chính:
- sendApplicationConfirmation()    // Xác nhận nộp hồ sơ
- sendApplicationStatusEmail()     // Cập nhật trạng thái hồ sơ
- sendContactReplyEmail()          // Phản hồi liên hệ
- sendFeedbackReplyEmail()         // Phản hồi feedback
- verifyEmailConfig()              // Kiểm tra cấu hình
```

### Controllers sử dụng Email Service

#### 1. Application Controller (`src/controllers/application.controller.js`)

```javascript
// Khi tạo hồ sơ mới
exports.create = async (req, res) => {
    // ... tạo hồ sơ ...
    
    if (form_data.email) {
        emailService.sendApplicationConfirmation(form_data.email, {
            application_code,
            service_name,
            form_data
        }).catch(e => console.error('Email failed:', e.message));
    }
};
```

#### 2. File Controller (`src/controllers/file.controller.js`)

```javascript
// Khi cập nhật trạng thái hồ sơ
exports.updateStatus = async (req, res) => {
    // ... cập nhật trạng thái ...
    
    if (application.citizen_email && (note || status || appointment_date)) {
        emailService.sendApplicationStatusEmail(application.citizen_email, {
            citizen_name: application.citizen_name,
            application_code: application.application_code,
            service_name: application.service_name,
            status: status,
            admin_note: note,
            appointment_date: appointment_date
        }).catch(e => console.error('Email failed:', e.message));
    }
};
```

#### 3. Contact Controller (`src/controllers/contact.controller.js`)

```javascript
// Khi admin phản hồi liên hệ
exports.sendReply = async (req, res) => {
    // ... lưu phản hồi ...
    
    if (contact.email) {
        emailService.sendContactReplyEmail(contact.email, {
            name: contact.name,
            subject: contact.subject,
            admin_reply: admin_reply
        }).catch(e => console.error('Email failed:', e.message));
    }
};
```

## Email Templates

### 1. Email xác nhận nộp hồ sơ

**Màu chủ đạo:** Xanh lá (Green) - #10b981

**Nội dung:**
- Icon thành công ✅
- Mã hồ sơ (to, đậm, màu xanh)
- Tên dịch vụ
- Trạng thái: Chờ xử lý
- Link tra cứu hồ sơ

### 2. Email cập nhật trạng thái hồ sơ

**Màu chủ đạo:** Tím (Purple) - #667eea

**Nội dung:**
- Mã hồ sơ
- Tên dịch vụ
- Trạng thái (với badge màu sắc)
- **Ngày hẹn** (nếu có) - hiển thị trong box màu vàng nổi bật
- Ghi chú từ cơ quan (nếu có)
- Link tra cứu hồ sơ

**Màu sắc trạng thái:**
- Chờ xử lý: Vàng (#f59e0b)
- Đang xử lý: Xanh dương (#3b82f6)
- Đã hoàn thành: Xanh lá (#10b981)
- Từ chối: Đỏ (#ef4444)

### 3. Email phản hồi liên hệ

**Màu chủ đạo:** Tím (Purple) - #667eea

**Nội dung:**
- Tên người liên hệ
- Chủ đề liên hệ
- Nội dung phản hồi từ admin (trong box nổi bật)

## Tính năng nổi bật

### 📅 Thông báo ngày hẹn

Khi admin đặt ngày hẹn cho hồ sơ, email sẽ hiển thị:

```html
<div class="appointment-box">
    <h3>📅 Thông báo ngày hẹn</h3>
    <p><strong>Ngày hẹn:</strong> [Ngày giờ]</p>
    <p>Vui lòng đến đúng giờ để nhận kết quả hoặc hoàn tất thủ tục.</p>
</div>
```

Ngày hẹn được format theo định dạng Việt Nam:
```javascript
formatDate('2026-01-30T10:00:00') 
// => "30 tháng 1, 2026 lúc 10:00"
```

### 📝 Ghi chú từ cơ quan

Khi admin thêm ghi chú, email sẽ hiển thị:

```html
<div class="note-box">
    <h3>📝 Ghi chú từ cơ quan:</h3>
    <p>[Nội dung ghi chú]</p>
</div>
```

## Error Handling

Email notification được thiết kế **non-blocking**:

```javascript
.catch(e => console.error('⚠️  Email notification failed (non-critical):', e.message));
```

- ✅ Nếu email gửi thất bại, hệ thống vẫn hoạt động bình thường
- ✅ Lỗi được log để debug
- ✅ Không ảnh hưởng đến trải nghiệm người dùng

## Testing

### Test gửi email thủ công

Bạn có thể test email service bằng cách:

```javascript
// Test trong Node.js console hoặc tạo route test
const emailService = require('./src/services/email.service');

// Test application confirmation
emailService.sendApplicationConfirmation('test@example.com', {
    application_code: 'HS1738045200000',
    service_name: 'Đăng ký khai sinh',
    form_data: {
        fullName: 'Nguyễn Văn A'
    }
});

// Test application status update
emailService.sendApplicationStatusEmail('test@example.com', {
    citizen_name: 'Nguyễn Văn A',
    application_code: 'HS1738045200000',
    service_name: 'Đăng ký khai sinh',
    status: 'processing',
    admin_note: 'Hồ sơ đang được xử lý',
    appointment_date: '2026-01-30T10:00:00'
});
```

## Troubleshooting

### Lỗi thường gặp

#### 1. "Invalid login: 535-5.7.8 Username and Password not accepted"

**Nguyên nhân:** Sai email hoặc password

**Giải pháp:**
- Kiểm tra `EMAIL_USER` và `EMAIL_PASSWORD` trong `.env`
- Đảm bảo đã tạo App Password (không dùng mật khẩu Gmail thường)

#### 2. "Connection timeout"

**Nguyên nhân:** Không kết nối được SMTP server

**Giải pháp:**
- Kiểm tra `EMAIL_HOST` và `EMAIL_PORT`
- Kiểm tra firewall/network
- Thử đổi port: 587 hoặc 465

#### 3. Email không gửi nhưng không báo lỗi

**Nguyên nhân:** Email người nhận không tồn tại trong database

**Giải pháp:**
- Kiểm tra log: "No email provided, skipping email notification"
- Đảm bảo user có email trong database
- Kiểm tra form_data có chứa email

## Best Practices

### 1. Luôn kiểm tra email tồn tại

```javascript
if (citizenEmail) {
    emailService.sendEmail(...);
}
```

### 2. Sử dụng .catch() để handle errors

```javascript
emailService.sendEmail(...)
    .catch(e => console.error('Email failed:', e.message));
```

### 3. Log đầy đủ thông tin

```javascript
console.log('Sending email to:', email);
console.log('✅ Email sent successfully');
```

### 4. Không block main flow

Email luôn được gửi **asynchronously** và không chờ kết quả.

## Mở rộng trong tương lai

### Tính năng có thể thêm:

1. **Email queue** - Sử dụng Bull/Redis để queue emails
2. **Email templates động** - Cho phép admin tùy chỉnh template
3. **Email tracking** - Theo dõi email đã gửi/đã đọc
4. **Multiple email providers** - Hỗ trợ nhiều nhà cung cấp email
5. **Email preferences** - Cho phép user chọn loại email muốn nhận
6. **SMS notification** - Thêm thông báo qua SMS

## Liên hệ hỗ trợ

Nếu có vấn đề về email notification, vui lòng:

1. Kiểm tra log trong console
2. Kiểm tra cấu hình `.env`
3. Test với email cá nhân trước
4. Liên hệ team dev nếu vẫn gặp lỗi

---

**Cập nhật lần cuối:** 27/01/2026
**Phiên bản:** 1.0.0
