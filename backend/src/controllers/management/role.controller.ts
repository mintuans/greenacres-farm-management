import { Request, Response } from 'express';
import * as roleService from '../../services/role.service';
import { logActivity } from '../../services/audit-log.service';

export const getRoles = async (_req: Request, res: Response) => {
    try {
        const roles = await roleService.getRoles();
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

export const createRole = async (req: Request, res: Response) => {
    try {
        const role = await roleService.createRole(req.body);

        await logActivity(req, 'CREATE_ROLE', 'roles', role.id, null, req.body);

        res.status(201).json({
            success: true,
            data: role
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const oldRole = await roleService.getRoleById(id);
        const role = await roleService.updateRole(id, req.body);

        await logActivity(req, 'UPDATE_ROLE', 'roles', id, oldRole, req.body);

        res.json({
            success: true,
            data: role
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const oldRole = await roleService.getRoleById(id);
        await roleService.deleteRole(id);

        await logActivity(req, 'DELETE_ROLE', 'roles', id, oldRole, null);

        res.json({
            success: true,
            message: 'Role deleted successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getRolePermissions = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const permissions = await roleService.getRolePermissions(id);
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

export const assignPermission = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { permissionId } = req.body;
        await roleService.assignPermissionToRole(id, permissionId);

        await logActivity(req, 'ASSIGN_PERMISSION', 'role_permissions', id, null, { permissionId });

        res.json({
            success: true,
            message: 'Permission assigned successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const removePermission = async (req: Request, res: Response) => {
    try {
        const { id, permissionId } = req.params;
        await roleService.removePermissionFromRole(id, permissionId);

        await logActivity(req, 'REMOVE_PERMISSION', 'role_permissions', id, { permissionId }, null);

        res.json({
            success: true,
            message: 'Permission removed successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
