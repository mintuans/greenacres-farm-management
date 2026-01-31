import { Request, Response } from 'express';
import pool from '../../config/database';
import { hashPassword, comparePassword } from '../../helpers/hash.helper';
import { generateToken } from '../../helpers/jwt.helper';
import { logActivity } from '../../services/audit-log.service';
import { sendResetPasswordEmail } from '../../services/email.service';
import { z } from 'zod';
import crypto from 'crypto';

const publicRegisterSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    full_name: z.string().min(1, 'Họ tên không được để trống'),
    phone: z.string().optional(),
});

const publicLoginSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(1, 'Mật khẩu không được để trống'),
});

const forgotPasswordSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
});

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token không được để trống'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

/**
 * Đăng ký người dùng công khai
 */
export const register = async (req: Request, res: Response) => {
    try {
        const validatedData = publicRegisterSchema.parse(req.body);

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await pool.query('SELECT * FROM public_users WHERE email = $1', [validatedData.email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await hashPassword(validatedData.password);

        // Lưu vào database
        const result = await pool.query(`
            INSERT INTO public_users (email, password_hash, full_name, phone)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, full_name, phone, avatar_id, created_at
        `, [validatedData.email, hashedPassword, validatedData.full_name, validatedData.phone]);

        const user = result.rows[0];

        // Tự động gán quyền USER cho người dùng mới
        const userRoleResult = await pool.query(`
            SELECT id FROM roles WHERE name = 'USER' LIMIT 1
        `);

        if (userRoleResult.rows.length > 0) {
            const userRoleId = userRoleResult.rows[0].id;
            await pool.query(`
                INSERT INTO user_roles (user_id, role_id, assigned_at)
                VALUES ($1, $2, NOW())
                ON CONFLICT (user_id, role_id) DO NOTHING
            `, [user.id, userRoleId]);
        }

        // Log action (manually set user info as it's not in req.user yet)
        await logActivity(req, 'REGISTER', 'public_users', user.id, null, { email: user.email }, user.id);

        // Tạo token
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: 'user'
        });

        return res.status(201).json({
            success: true,
            data: {
                user,
                token
            }
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ success: false, message: error.errors[0].message });
        }
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Đăng nhập người dùng công khai
 */
export const login = async (req: Request, res: Response) => {
    try {
        const validatedData = publicLoginSchema.parse(req.body);

        // Tìm người dùng
        const result = await pool.query('SELECT * FROM public_users WHERE email = $1', [validatedData.email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await comparePassword(validatedData.password, user.password_hash);

        if (!isPasswordValid) {
            const newAttempts = (user.login_attempts || 0) + 1;

            if (newAttempts >= 5) {
                // Khóa tài khoản nếu sai quá 5 lần
                await pool.query('UPDATE public_users SET login_attempts = $1, is_active = false WHERE id = $2', [newAttempts, user.id]);
                await logActivity(req, 'LOGIN_FAILED_LOCKED', 'public_users', user.id, null, { email: user.email }, user.id);
                return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa do nhập sai quá 5 lần' });
            } else {
                // Tăng số lần nhập sai
                await pool.query('UPDATE public_users SET login_attempts = $1 WHERE id = $2', [newAttempts, user.id]);
                await logActivity(req, 'LOGIN_FAILED', 'public_users', user.id, null, { email: user.email, attempt: newAttempts }, user.id);
                return res.status(401).json({
                    success: false,
                    message: `Mật khẩu không đúng. Bạn còn ${5 - newAttempts} lần thử.`
                });
            }
        }

        // Kiểm tra tài khoản có đang hoạt động không
        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'Tài khoản không hoạt động hoặc đã bị khóa' });
        }

        // Đăng nhập thành công: Cập nhật last_login_at và reset login_attempts
        await pool.query('UPDATE public_users SET last_login_at = CURRENT_TIMESTAMP, login_attempts = 0 WHERE id = $1', [user.id]);

        // Log action
        await logActivity(req, 'LOGIN', 'public_users', user.id, null, { email: user.email }, user.id);

        // Lấy role của user từ DB
        const roleResult = await pool.query(`
            SELECT r.name 
            FROM roles r
            JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = $1
            LIMIT 1
        `, [user.id]);

        const userRole = roleResult.rows[0]?.name || 'user';

        // Tạo token với role thực tế
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: userRole
        });

        return res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    avatar_id: user.avatar_id,
                    role: userRole
                },
                token
            }
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ success: false, message: error.errors[0].message });
        }
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Quên mật khẩu
 */
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const validatedData = forgotPasswordSchema.parse(req.body);

        // Tìm người dùng
        const result = await pool.query('SELECT * FROM public_users WHERE email = $1', [validatedData.email]);
        const user = result.rows[0];

        if (!user) {
            // Để bảo mật, chúng ta vẫn trả về success cho dù email không tồn tại
            // nhưng thực tế có thể thông báo là email đã được gửi nếu tồn tại
            return res.json({
                success: true,
                message: 'Nếu email tồn tại trong hệ thống, hướng dẫn khôi phục mật khẩu sẽ được gửi đến bạn.'
            });
        }

        // Tạo token reset
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 3600000); // 1 giờ sau

        // Lưu vào DB
        await pool.query(`
            UPDATE public_users 
            SET reset_password_token = $1, reset_password_expires = $2 
            WHERE id = $3
        `, [resetToken, resetExpires, user.id]);

        // Gửi email
        try {
            await sendResetPasswordEmail(user.email, resetToken);
        } catch (emailError: any) {
            console.error('Email sending failed:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Không thể gửi email khôi phục mật khẩu. Vui lòng kiểm tra lại cấu hình SMTP trong hệ thống.',
                error: emailError.message
            });
        }

        // Log action
        await logActivity(req, 'FORGOT_PASSWORD_REQUEST', 'public_users', user.id, null, { email: user.email }, user.id);

        return res.json({
            success: true,
            message: 'Hướng dẫn khôi phục mật khẩu đã được gửi đến email của bạn.'
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ success: false, message: error.errors[0].message });
        }
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Đặt lại mật khẩu
 */
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const validatedData = resetPasswordSchema.parse(req.body);

        // Tìm user với token hợp lệ và chưa hết hạn
        const result = await pool.query(`
            SELECT * FROM public_users 
            WHERE reset_password_token = $1 
            AND reset_password_expires > NOW()
            AND is_active = true
        `, [validatedData.token]);

        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Liên kết khôi phục mật khẩu không hợp lệ hoặc đã hết hạn.'
            });
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await hashPassword(validatedData.password);

        // Cập nhật mật khẩu và xóa token
        await pool.query(`
            UPDATE public_users 
            SET password_hash = $1, 
                reset_password_token = NULL, 
                reset_password_expires = NULL,
                login_attempts = 0
            WHERE id = $2
        `, [hashedPassword, user.id]);

        // Log action
        await logActivity(req, 'RESET_PASSWORD_SUCCESS', 'public_users', user.id, null, { email: user.email }, user.id);

        return res.json({
            success: true,
            message: 'Mật khẩu của bạn đã được cập nhật thành công.'
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ success: false, message: error.errors[0].message });
        }
        return res.status(500).json({ success: false, error: error.message });
    }
};

