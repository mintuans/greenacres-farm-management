import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false // Helps with some self-signed certificate issues
    }
});

// Verify connection configuration only if credentials are provided
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter.verify(function (error, _success) {
        if (error) {
            console.error('SMTP Connection Error:', error);
        } else {
            console.log('SMTP Server is ready to take our messages');
        }
    });
} else {
    console.log('⚠️ SMTP credentials not found. Email service will be disabled.');
}

/**
 * Gửi email reset mật khẩu
 */
export const sendResetPasswordEmail = async (email: string, token: string) => {
    const resetUrl = `${process.env.FRONTEND_URL}/#/reset-password?token=${token}`;

    const mailOptions = {
        from: `"GreenAcres Farm" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Khôi phục mật khẩu - GreenAcres Farm',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2e7d32; text-align: center;">GreenAcres Farm</h2>
                <p>Xin chào,</p>
                <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn tại GreenAcres Farm. Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu của bạn:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đặt lại mật khẩu</a>
                </div>
                <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này. Liên kết này sẽ hết hạn sau 1 giờ.</p>
                <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="font-size: 12px; color: #757575; text-align: center;">Đây là email tự động, vui lòng không trả lời.</p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
};
