import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
            };
        }
    }
}

/**
 * Middleware xác thực JWT Token
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): any => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để tiếp tục',
            });
        }

        const token = authHeader.substring(7);
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }

        const decoded = jwt.verify(token, secret) as {
            id: string;
            email: string;
            role: string;
        };

        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Phiên làm việc hết hạn hoặc không hợp lệ',
        });
    }
};

/**
 * Middleware kiểm tra quyền hạn (Permissions)
 * @param permissionCode Mã quyền (VD: 'season.create', 'product.delete')
 */
export const checkPermission = (permissionCode: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập',
            });
        }

        try {
            // 1. KIỂM TRA NHANH: Nếu là Admin hoặc Super Admin thì cho qua luôn
            const adminQuery = `
                SELECT COUNT(*) 
                FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = $1 AND (r.name = 'SUPER_ADMIN')
            `;
            const adminResult = await pool.query(adminQuery, [req.user.id]);
            if (parseInt(adminResult.rows[0].count) > 0) {
                return next();
            }

            // 2. Kiểm tra quyền lẻ (Permissions)
            const query = `
                SELECT COUNT(*) 
                FROM user_roles ur
                JOIN role_permissions rp ON ur.role_id = rp.role_id
                JOIN permissions p ON rp.permission_id = p.id
                WHERE ur.user_id = $1 AND p.code = $2
            `;

            const result = await pool.query(query, [req.user.id, permissionCode]);
            const hasPermission = parseInt(result.rows[0].count) > 0;

            if (hasPermission) {
                return next();
            }

            return res.status(403).json({
                success: false,
                message: `Bạn không có quyền thực hiện hành động này (${permissionCode})`,
            });
        } catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi kiểm tra quyền hạn',
            });
        }
    };
};

/**
 * Middleware kiểm tra vai trò (Role-based) - Giữ lại cho các trường hợp đơn giản
 */
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
            });
        }

        return next();
    };
};
