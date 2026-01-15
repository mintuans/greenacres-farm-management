import { Request, Response } from 'express';
import * as productionUnitService from '../../services/production-unit.service';
import { logActivity } from '../../services/audit-log.service';

// Tạo đơn vị sản xuất mới
export const createProductionUnit = async (req: Request, res: Response): Promise<any> => {
    try {
        const unit = await productionUnitService.createProductionUnit(req.body);

        await logActivity(req, 'CREATE_PRODUCTION_UNIT', 'production_units', unit.id, null, req.body);

        return res.status(201).json({
            success: true,
            data: unit,
            message: 'Production unit created successfully'
        });
    } catch (error: any) {
        console.error('Create production unit error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create production unit'
        });
    }
};

// Lấy danh sách đơn vị sản xuất
export const getProductionUnits = async (req: Request, res: Response): Promise<any> => {
    try {
        const { type } = req.query;
        const units = await productionUnitService.getProductionUnits(type as string);
        return res.json({
            success: true,
            data: units
        });
    } catch (error: any) {
        console.error('Get production units error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get production units'
        });
    }
};

// Lấy đơn vị sản xuất theo ID
export const getProductionUnitById = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const unit = await productionUnitService.getProductionUnitById(id);

        if (!unit) {
            return res.status(404).json({
                success: false,
                message: 'Production unit not found'
            });
        }

        return res.json({
            success: true,
            data: unit
        });
    } catch (error: any) {
        console.error('Get production unit error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get production unit'
        });
    }
};

// Cập nhật đơn vị sản xuất
export const updateProductionUnit = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldUnit = await productionUnitService.getProductionUnitById(id);
        const unit = await productionUnitService.updateProductionUnit(id, req.body);

        if (!unit) {
            return res.status(404).json({
                success: false,
                message: 'Production unit not found'
            });
        }

        await logActivity(req, 'UPDATE_PRODUCTION_UNIT', 'production_units', id, oldUnit, req.body);

        return res.json({
            success: true,
            data: unit,
            message: 'Production unit updated successfully'
        });
    } catch (error: any) {
        console.error('Update production unit error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update production unit'
        });
    }
};

// Xóa đơn vị sản xuất
export const deleteProductionUnit = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldUnit = await productionUnitService.getProductionUnitById(id);
        const deleted = await productionUnitService.deleteProductionUnit(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Production unit not found'
            });
        }

        await logActivity(req, 'DELETE_PRODUCTION_UNIT', 'production_units', id, oldUnit, null);

        return res.json({
            success: true,
            message: 'Production unit deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete production unit error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete production unit'
        });
    }
};

// Lấy thống kê
export const getProductionUnitStats = async (_req: Request, res: Response): Promise<any> => {
    try {
        const stats = await productionUnitService.getProductionUnitStats();
        return res.json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        console.error('Get stats error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get stats'
        });
    }
};
