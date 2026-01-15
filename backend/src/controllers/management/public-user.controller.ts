import { Request, Response } from 'express';
import * as publicUserService from '../../services/public-user.service';
import { logActivity } from '../../services/audit-log.service';

export const getPublicUsers = async (_req: Request, res: Response) => {
    try {
        const users = await publicUserService.getPublicUsers();
        res.json({
            success: true,
            data: users
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const createPublicUser = async (req: Request, res: Response) => {
    try {
        const user = await publicUserService.createPublicUser(req.body);

        await logActivity(req, 'CREATE_USER', 'public_users', user.id, null, { email: req.body.email, full_name: req.body.full_name });

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updatePublicUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const oldUser = await publicUserService.getPublicUserById(id);
        const user = await publicUserService.updatePublicUser(id, req.body);

        await logActivity(req, 'UPDATE_USER', 'public_users', id, oldUser, req.body);

        res.json({
            success: true,
            data: user
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deletePublicUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const oldUser = await publicUserService.getPublicUserById(id);
        await publicUserService.deletePublicUser(id);

        await logActivity(req, 'DELETE_USER', 'public_users', id, oldUser, null);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getUserRoles = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const roles = await publicUserService.getUserRoles(id);
        res.json({
            success: true,
            data: roles
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const assignRoleToUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { roleId } = req.body;
        await publicUserService.assignRoleToUser(id, roleId);

        await logActivity(req, 'ASSIGN_ROLE', 'user_roles', id, null, { roleId });

        res.json({
            success: true,
            message: 'Role assigned successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const removeRoleFromUser = async (req: Request, res: Response) => {
    try {
        const { id, roleId } = req.params;
        await publicUserService.removeRoleFromUser(id, roleId);

        await logActivity(req, 'REMOVE_ROLE', 'user_roles', id, { roleId }, null);

        res.json({
            success: true,
            message: 'Role removed successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
