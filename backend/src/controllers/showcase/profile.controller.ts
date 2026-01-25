import { Request, Response } from 'express';
import * as publicUserService from '../../services/public-user.service';
import { logActivity } from '../../services/audit-log.service';

/**
 * Lấy thông tin cá nhân của người dùng hiện tại
 */
export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
        }

        const user = await publicUserService.getPublicUserById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
        }

        return res.json({
            success: true,
            data: user
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Cập nhật thông tin cá nhân
 */
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
        }

        const oldUser = await publicUserService.getPublicUserById(userId);

        // Chỉ cho phép cập nhật một số trường nhất định
        const updateData = {
            full_name: req.body.full_name,
            phone: req.body.phone,
            avatar_id: req.body.avatar_id,
            bio: req.body.bio,
            address: req.body.address
        };

        const updatedUser = await publicUserService.updatePublicUser(userId, updateData);

        await logActivity(req, 'UPDATE_PROFILE', 'public_users', userId, oldUser, updateData, userId);

        return res.json({
            success: true,
            data: updatedUser
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
