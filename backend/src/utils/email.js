const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Email template wrapper
const getEmailTemplate = (content) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #0d9488; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f3f4f6; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; padding: 12px 24px; background: #0d9488; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🏛️ UBND Phường/Xã</h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Hệ thống quản lý hành chính</p>
                </div>
                <div class="content">
                    ${content}
                </div>
                <div class="footer">
                    <p>📧 Email này được gửi tự động từ hệ thống. Vui lòng không trả lời email này.</p>
                    <p>© 2024 UBND Phường/Xã. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

// Send email function
async function sendEmail(to, subject, htmlContent) {
    try {
        // Skip if no email config
        if (!process.env.EMAIL_USER) {
            console.log('⚠️ Email not configured, skipping send to:', to);
            return null;
        }

        const mailOptions = {
            from: `"UBND Phường/Xã" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: getEmailTemplate(htmlContent)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId, 'to:', to);
        return info;
    } catch (error) {
        console.error('❌ Email send error:', error.message);
        // Don't throw error, just log it
        return null;
    }
}

module.exports = { sendEmail };
