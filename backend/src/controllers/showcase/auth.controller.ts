import { Request, Response } from 'express';
import pool from '../../config/database';
import { hashPassword, comparePassword } from '../../helpers/hash.helper';
import { generateToken } from '../../helpers/jwt.helper';
import { logActivity } from '../../services/audit-log.service';
import { z } from 'zod';

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
            RETURNING id, email, full_name, phone, created_at
        `, [validatedData.email, hashedPassword, validatedData.full_name, validatedData.phone]);

        const user = result.rows[0];

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

        // Tạo token
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: 'user'
        });

        return res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: 'user'
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
