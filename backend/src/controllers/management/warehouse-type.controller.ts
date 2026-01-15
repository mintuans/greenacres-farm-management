import { Request, Response } from 'express';
import * as warehouseTypeService from '../../services/warehouse-type.service';
import { logActivity } from '../../services/audit-log.service';

export const getAll = async (_req: Request, res: Response): Promise<any> => {
    try {
        const types = await warehouseTypeService.getAll();
        return res.json({ success: true, data: types });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const create = async (req: Request, res: Response): Promise<any> => {
    try {
        const type = await warehouseTypeService.create(req.body);

        await logActivity(req, 'CREATE_WAREHOUSE_TYPE', 'warehouse_types', type.id, null, req.body);

        return res.status(201).json({ success: true, data: type });
    } catch (error: any) {
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: 'Mã loại kho đã tồn tại' });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const update = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldType = await warehouseTypeService.getById(id);
        const type = await warehouseTypeService.update(id, req.body);
        if (!type) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy loại kho' });
        }

        await logActivity(req, 'UPDATE_WAREHOUSE_TYPE', 'warehouse_types', id, oldType, req.body);

        return res.json({ success: true, data: type });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const remove = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldType = await warehouseTypeService.getById(id);
        const success = await warehouseTypeService.remove(id);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy loại kho' });
        }

        await logActivity(req, 'DELETE_WAREHOUSE_TYPE', 'warehouse_types', id, oldType, null);

        return res.json({ success: true, message: 'Đã xóa loại kho' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
