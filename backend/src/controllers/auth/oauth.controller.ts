import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const FRONTEND_URL = process.env.FRONTEND_URL || '';

/**
 * Generate JWT token for user
 */
const generateToken = (user: any) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * Google OAuth callback handler
 */
export const googleCallback = async (req: Request, res: Response) => {
    try {
        const user = req.user as any;

        if (!user) {
            return res.redirect(`${FRONTEND_URL}/login?error=authentication_failed`);
        }

        // Lấy role thực tế từ database
        const roleResult = await pool.query(`
            SELECT r.name 
            FROM roles r
            JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = $1
            LIMIT 1
        `, [user.id]);

        const userRole = roleResult.rows[0]?.name || 'user';
        user.role = userRole; // Gán lại role đúng cho user object

        // Generate JWT token
        const token = generateToken(user);

        // Redirect to frontend with token
        res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&provider=google`);

    } catch (error: any) {
        console.error('Google callback error:', error);
        res.redirect(`${FRONTEND_URL}/login?error=server_error`);
    }
};

/**
 * Facebook OAuth callback handler
 */
export const facebookCallback = async (req: Request, res: Response) => {
    try {
        const user = req.user as any;

        if (!user) {
            return res.redirect(`${FRONTEND_URL}/login?error=authentication_failed`);
        }

        // Lấy role thực tế từ database
        const roleResult = await pool.query(`
            SELECT r.name 
            FROM roles r
            JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = $1
            LIMIT 1
        `, [user.id]);

        const userRole = roleResult.rows[0]?.name || 'user';
        user.role = userRole;

        // Generate JWT token
        const token = generateToken(user);

        // Redirect to frontend with token
        res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&provider=facebook`);
    } catch (error: any) {
        console.error('Facebook callback error:', error);
        res.redirect(`${FRONTEND_URL}/login?error=server_error`);
    }
};
