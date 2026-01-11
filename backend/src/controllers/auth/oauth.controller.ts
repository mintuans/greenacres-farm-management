import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

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
export const googleCallback = (req: Request, res: Response) => {
    try {
        const user = req.user as any;

        if (!user) {
            return res.redirect(`${FRONTEND_URL}/login?error=authentication_failed`);
        }

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
export const facebookCallback = (req: Request, res: Response) => {
    try {
        const user = req.user as any;

        if (!user) {
            return res.redirect(`${FRONTEND_URL}/login?error=authentication_failed`);
        }

        // Generate JWT token
        const token = generateToken(user);

        // Redirect to frontend with token
        res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&provider=facebook`);
    } catch (error: any) {
        console.error('Facebook callback error:', error);
        res.redirect(`${FRONTEND_URL}/login?error=server_error`);
    }
};
