import { Request, Response } from 'express';
import * as permissionService from '../../services/permission.service';

export const getPermissions = async (req: Request, res: Response) => {
    try {
        const permissions = await permissionService.getPermissions();
        res.json({
            success: true,
            data: permissions
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const createPermission = async (req: Request, res: Response) => {
    try {
        const permission = await permissionService.createPermission(req.body);
        res.status(201).json({
            success: true,
            data: permission
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updatePermission = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const permission = await permissionService.updatePermission(id, req.body);
        res.json({
            success: true,
            data: permission
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deletePermission = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await permissionService.deletePermission(id);
        res.json({
            success: true,
            message: 'Permission deleted successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
