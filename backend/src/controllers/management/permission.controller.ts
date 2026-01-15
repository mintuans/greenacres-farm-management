import { Request, Response } from 'express';
import * as permissionService from '../../services/permission.service';
import { logActivity } from '../../services/audit-log.service';

export const getPermissions = async (_req: Request, res: Response) => {
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

        await logActivity(req, 'CREATE_PERMISSION', 'permissions', permission.id, null, req.body);

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
        const oldPerm = await permissionService.getPermissionById(id);
        const permission = await permissionService.updatePermission(id, req.body);

        await logActivity(req, 'UPDATE_PERMISSION', 'permissions', id, oldPerm, req.body);

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
        const oldPerm = await permissionService.getPermissionById(id);
        await permissionService.deletePermission(id);

        await logActivity(req, 'DELETE_PERMISSION', 'permissions', id, oldPerm, null);

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

export const getDatabaseTables = async (_req: Request, res: Response) => {
    try {
        const tables = await permissionService.getDatabaseTables();
        res.json({
            success: true,
            data: tables
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
