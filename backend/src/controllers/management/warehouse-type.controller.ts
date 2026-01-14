import { Request, Response } from 'express';
import * as warehouseTypeService from '../../services/warehouse-type.service';

export const getAll = async (_req: Request, res: Response) => {
    try {
        const types = await warehouseTypeService.getAll();
        return res.json({ success: true, data: types });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const type = await warehouseTypeService.create(req.body);
        return res.status(201).json({ success: true, data: type });
    } catch (error: any) {
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: 'Mã loại kho đã tồn tại' });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const type = await warehouseTypeService.update(id, req.body);
        if (!type) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy loại kho' });
        }
        return res.json({ success: true, data: type });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const success = await warehouseTypeService.remove(id);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy loại kho' });
        }
        return res.json({ success: true, message: 'Đã xóa loại kho' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
