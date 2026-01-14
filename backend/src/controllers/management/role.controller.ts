import { Request, Response } from 'express';
import * as roleService from '../../services/role.service';

export const getRoles = async (req: Request, res: Response) => {
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
        const role = await roleService.updateRole(id, req.body);
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
        await roleService.deleteRole(id);
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
