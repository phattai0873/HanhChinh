const nodemailer = require('nodemailer');
require('dotenv').config();


// Cấu hình email transporter
// Bạn có thể thay đổi cấu hình này theo email service của bạn
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
});

console.log('📧 Email Service Initialized. Frontend URL:', process.env.FRONTEND_URL || 'http://localhost:5173 (fallback)');


// Template email cho feedback reply
const getFeedbackReplyEmailTemplate = (feedbackData) => {
    const { citizen_name, title, admin_note, status, feedback_code } = feedbackData;

    const statusText = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang xử lý',
        'resolved': 'Đã giải quyết',
        'new': 'Mới tiếp nhận'
    };

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
                .status-resolved { background: #10b981; color: white; }
                .status-processing { background: #3b82f6; color: white; }
                .status-pending { background: #f59e0b; color: white; }
                .admin-reply { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏛️ Hệ thống Hành chính Điện tử</h1>
                    <p>Phường/Xã Cao Lãnh</p>
                </div>
                <div class="content">
                    <h2>Xin chào ${citizen_name},</h2>
                    <p>Chúng tôi đã cập nhật phản ánh của bạn:</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p><strong>Mã phản ánh:</strong> ${feedback_code}</p>
                        <p><strong>Tiêu đề:</strong> ${title}</p>
                        <p><strong>Trạng thái:</strong> 
                            <span class="status-badge status-${status}">${statusText[status] || status}</span>
                        </p>
                    </div>

                    ${admin_note ? `
                    <div class="admin-reply">
                        <h3 style="color: #667eea; margin-top: 0;">📝 Phản hồi từ cơ quan:</h3>
                        <p>${admin_note}</p>
                    </div>
                    ` : ''}

                    <p>Bạn có thể xem chi tiết phản ánh tại hệ thống của chúng tôi.</p>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track" class="button">
                            Xem chi tiết phản ánh
                        </a>
                    </div>

                    <div class="footer">
                        <p>Đây là email tự động, vui lòng không trả lời email này.</p>
                        <p>Nếu có thắc mắc, vui lòng liên hệ: <strong>(028) 1234 5678</strong></p>
                        <p>Email: contact@caolanhcity.gov.vn</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

// Gửi email thông báo phản hồi feedback
exports.sendFeedbackReplyEmail = async (citizenEmail, feedbackData) => {
    try {
        if (!citizenEmail) {
            console.log('No email provided, skipping email notification');
            return { success: false, message: 'No email provided' };
        }

        const mailOptions = {
            from: `"Hệ thống Hành chính Điện tử" <${process.env.EMAIL_USER || 'noreply@caolanhcity.gov.vn'}>`,
            to: citizenEmail,
            subject: `[${feedbackData.feedback_code}] Cập nhật phản ánh: ${feedbackData.title}`,
            html: getFeedbackReplyEmailTemplate(feedbackData)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);

        return {
            success: true,
            messageId: info.messageId,
            message: 'Email sent successfully'
        };
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
        return {
            success: false,
            error: error.message,
            message: 'Failed to send email'
        };
    }
};

// Template email cho application status update
const getApplicationStatusEmailTemplate = (applicationData) => {
    const { citizen_name, application_code, service_name, status, admin_note, appointment_date } = applicationData;

    const statusText = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang xử lý',
        'completed': 'Đã hoàn thành',
        'rejected': 'Từ chối'
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
                .status-completed { background: #10b981; color: white; }
                .status-processing { background: #3b82f6; color: white; }
                .status-pending { background: #f59e0b; color: white; }
                .status-rejected { background: #ef4444; color: white; }
                .info-box { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; }
                .note-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
                .appointment-box { background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 5px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏛️ Hệ thống Hành chính Điện tử</h1>
                    <p>Phường/Xã Cao Lãnh</p>
                </div>
                <div class="content">
                    <h2>Xin chào ${citizen_name || 'Quý khách'},</h2>
                    <p>Hồ sơ của bạn đã được cập nhật:</p>
                    
                    <div class="info-box">
                        <p><strong>Mã hồ sơ:</strong> ${application_code}</p>
                        <p><strong>Dịch vụ:</strong> ${service_name}</p>
                        <p><strong>Trạng thái:</strong> 
                            <span class="status-badge status-${status}">${statusText[status] || status}</span>
                        </p>
                    </div>

                    ${appointment_date ? `
                    <div class="appointment-box">
                        <h3 style="color: #d97706; margin-top: 0;">📅 Thông báo ngày hẹn</h3>
                        <p><strong>Ngày hẹn:</strong> ${formatDate(appointment_date)}</p>
                        <p>Vui lòng đến đúng giờ để nhận kết quả hoặc hoàn tất thủ tục.</p>
                    </div>
                    ` : ''}

                    ${admin_note ? `
                    <div class="note-box">
                        <h3 style="color: #667eea; margin-top: 0;">📝 Ghi chú từ cơ quan:</h3>
                        <p>${admin_note}</p>
                    </div>
                    ` : ''}

                    <p>Bạn có thể tra cứu chi tiết hồ sơ tại hệ thống của chúng tôi.</p>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track" class="button">
                            Tra cứu hồ sơ
                        </a>
                    </div>

                    <div class="footer">
                        <p>Đây là email tự động, vui lòng không trả lời email này.</p>
                        <p>Nếu có thắc mắc, vui lòng liên hệ: <strong>(028) 1234 5678</strong></p>
                        <p>Email: contact@caolanhcity.gov.vn</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

// Template email cho contact reply
const getContactReplyEmailTemplate = (contactData) => {
    const { name, subject, admin_reply } = contactData;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .reply-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏛️ Hệ thống Hành chính Điện tử</h1>
                    <p>Phường/Xã Cao Lãnh</p>
                </div>
                <div class="content">
                    <h2>Xin chào ${name},</h2>
                    <p>Cảm ơn bạn đã liên hệ với chúng tôi về: <strong>${subject}</strong></p>
                    
                    <div class="reply-box">
                        <h3 style="color: #667eea; margin-top: 0;">📝 Phản hồi từ cơ quan:</h3>
                        <p>${admin_reply}</p>
                    </div>

                    <p>Nếu bạn có thêm câu hỏi, vui lòng liên hệ lại với chúng tôi.</p>

                    <div class="footer">
                        <p>Đây là email tự động, vui lòng không trả lời email này.</p>
                        <p>Liên hệ: <strong>(028) 1234 5678</strong> | Email: contact@caolanhcity.gov.vn</p>
                    </div>
                </div>
            </div>  
        </body>
        </html>
    `;
};

// Template email cho application confirmation (khi nộp hồ sơ)
const getApplicationConfirmationTemplate = (applicationData) => {
    const { application_code, service_name, form_data } = applicationData;
    const citizen_name = form_data.fullName || form_data.hoTen || form_data.name || 'Quý khách';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; }
                .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏛️ Hệ thống Hành chính Điện tử</h1>
                    <p>Phường/Xã Cao Lãnh</p>
                </div>
                <div class="content">
                    <div class="success-icon">✅</div>
                    <h2 style="text-align: center; color: #10b981;">Nộp hồ sơ thành công!</h2>
                    
                    <p>Xin chào ${citizen_name},</p>
                    <p>Chúng tôi đã nhận được hồ sơ của bạn:</p>
                    
                    <div class="info-box">
                        <p><strong>Mã hồ sơ:</strong> <span style="color: #10b981; font-size: 18px; font-weight: bold;">${application_code}</span></p>
                        <p><strong>Dịch vụ:</strong> ${service_name}</p>
                        <p><strong>Trạng thái:</strong> <span style="color: #f59e0b;">Chờ xử lý</span></p>
                    </div>

                    <p>Vui lòng lưu lại mã hồ sơ để tra cứu kết quả xử lý.</p>
                    <p>Chúng tôi sẽ thông báo cho bạn khi có cập nhật về hồ sơ.</p>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track" class="button">
                            Tra cứu hồ sơ
                        </a>
                    </div>

                    <div class="footer">
                        <p>Đây là email tự động, vui lòng không trả lời email này.</p>
                        <p>Nếu có thắc mắc, vui lòng liên hệ: <strong>(028) 1234 5678</strong></p>
                        <p>Email: contact@caolanhcity.gov.vn</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

// Template email cho feedback confirmation (khi gửi phản ánh)
const getFeedbackConfirmationTemplate = (feedbackData) => {
    const { feedback_code, title, citizen_name } = feedbackData;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; }
                .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏛️ Hệ thống Hành chính Điện tử</h1>
                    <p>Phường/Xã Cao Lãnh</p>
                </div>
                <div class="content">
                    <div class="success-icon">📝</div>
                    <h2 style="text-align: center; color: #3b82f6;">Đã tiếp nhận phản ánh!</h2>
                    
                    <p>Xin chào ${citizen_name},</p>
                    <p>Chúng tôi đã tiếp nhận phản ánh/kiến nghị của bạn:</p>
                    
                    <div class="info-box">
                        <p><strong>Mã phản ánh:</strong> <span style="color: #3b82f6; font-size: 18px; font-weight: bold;">${feedback_code}</span></p>
                        <p><strong>Tiêu đề:</strong> ${title}</p>
                        <p><strong>Trạng thái:</strong> <span style="color: #f59e0b;">Mới tiếp nhận</span></p>
                    </div>
 
                    <p>Chúng tôi sẽ xem xét và phản hồi ý kiến của bạn trong thời gian sớm nhất.</p>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track" class="button">
                            Theo dõi phản ánh
                        </a>
                    </div>
 
                    <div class="footer">
                        <p>Đây là email tự động, vui lòng không trả lời email này.</p>
                        <p>Nếu có thắc mắc, vui lòng liên hệ: <strong>(028) 1234 5678</strong></p>
                        <p>Email: contact@caolanhcity.gov.vn</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};


// Gửi email xác nhận nộp hồ sơ
exports.sendApplicationConfirmation = async (citizenEmail, applicationData) => {
    try {
        if (!citizenEmail) {
            console.log('No email provided, skipping email notification');
            return { success: false, message: 'No email provided' };
        }

        const mailOptions = {
            from: `"Hệ thống Hành chính Điện tử" <${process.env.EMAIL_USER || 'noreply@caolanhcity.gov.vn'}>`,
            to: citizenEmail,
            subject: `[${applicationData.application_code}] Xác nhận nộp hồ sơ: ${applicationData.service_name}`,
            html: getApplicationConfirmationTemplate(applicationData)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Application confirmation email sent:', info.messageId);

        return {
            success: true,
            messageId: info.messageId,
            message: 'Email sent successfully'
        };
    } catch (error) {
        console.error('❌ Failed to send application confirmation email:', error.message);
        return {
            success: false,
            error: error.message,
            message: 'Failed to send email'
        };
    }
};

// Gửi email thông báo cập nhật hồ sơ
exports.sendApplicationStatusEmail = async (citizenEmail, applicationData) => {
    try {
        if (!citizenEmail) {
            console.log('No email provided, skipping email notification');
            return { success: false, message: 'No email provided' };
        }

        const mailOptions = {
            from: `"Hệ thống Hành chính Điện tử" <${process.env.EMAIL_USER || 'noreply@caolanhcity.gov.vn'}>`,
            to: citizenEmail,
            subject: `[${applicationData.application_code}] Cập nhật hồ sơ: ${applicationData.service_name}`,
            html: getApplicationStatusEmailTemplate(applicationData)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Application status email sent:', info.messageId);

        return {
            success: true,
            messageId: info.messageId,
            message: 'Email sent successfully'
        };
    } catch (error) {
        console.error('❌ Failed to send application status email:', error.message);
        return {
            success: false,
            error: error.message,
            message: 'Failed to send email'
        };
    }
};

// Gửi email phản hồi liên hệ
exports.sendContactReplyEmail = async (citizenEmail, contactData) => {
    try {
        if (!citizenEmail) {
            console.log('No email provided, skipping email notification');
            return { success: false, message: 'No email provided' };
        }

        const mailOptions = {
            from: `"Hệ thống Hành chính Điện tử" <${process.env.EMAIL_USER || 'noreply@caolanhcity.gov.vn'}>`,
            to: citizenEmail,
            subject: `Phản hồi: ${contactData.subject}`,
            html: getContactReplyEmailTemplate(contactData)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Contact reply email sent:', info.messageId);

        return {
            success: true,
            messageId: info.messageId,
            message: 'Email sent successfully'
        };
    } catch (error) {
        console.error('❌ Failed to send contact reply email:', error.message);
        return {
            success: false,
            error: error.message,
            message: 'Failed to send email'
        };
    }
};

// Gửi email xác nhận tiếp nhận phản ánh
exports.sendFeedbackConfirmation = async (citizenEmail, feedbackData) => {
    try {
        if (!citizenEmail) {
            console.log('No email provided, skipping email notification');
            return { success: false, message: 'No email provided' };
        }

        const mailOptions = {
            from: `"Hệ thống Hành chính Điện tử" <${process.env.EMAIL_USER || 'noreply@caolanhcity.gov.vn'}>`,
            to: citizenEmail,
            subject: `[${feedbackData.feedback_code}] Tiếp nhận phản ánh: ${feedbackData.title}`,
            html: getFeedbackConfirmationTemplate(feedbackData)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Feedback confirmation email sent:', info.messageId);

        return {
            success: true,
            messageId: info.messageId,
            message: 'Email sent successfully'
        };
    } catch (error) {
        console.error('❌ Failed to send feedback confirmation email:', error.message);
        return {
            success: false,
            error: error.message,
            message: 'Failed to send email'
        };
    }
};

// Verify email configuration
exports.verifyEmailConfig = async () => {
    try {
        await transporter.verify();
        console.log('✅ Email server is ready to send messages');
        return true;
    } catch (error) {
        console.error('❌ Email server verification failed:', error.message);
        console.log('⚠️  Email notifications will be disabled. Please configure email settings in .env file');
        return false;
    }
};

module.exports = exports;
