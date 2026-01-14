import { Request, Response } from 'express';
import * as publicUserService from '../../services/public-user.service';

export const getPublicUsers = async (req: Request, res: Response) => {
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
        const user = await publicUserService.updatePublicUser(id, req.body);
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
        await publicUserService.deletePublicUser(id);
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
