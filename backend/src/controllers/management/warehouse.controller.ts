import { Request, Response } from 'express';
import * as warehouseService from '../../services/warehouse.service';

export const getItems = async (req: Request, res: Response) => {
    try {
        const { typeId, search } = req.query;
        const items = await warehouseService.getItems(typeId as string, search as string);
        return res.json({ success: true, data: items });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createItem = async (req: Request, res: Response) => {
    try {
        const item = await warehouseService.createItem(req.body);
        return res.status(201).json({ success: true, data: item });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const item = await warehouseService.updateItem(id, req.body);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        return res.json({ success: true, data: item });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const success = await warehouseService.deleteItem(id);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        return res.json({ success: true, message: 'Item deleted' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getNextCode = async (req: Request, res: Response) => {
    try {
        const { typeId } = req.query;
        if (!typeId) {
            return res.status(400).json({ success: false, message: 'typeId is required' });
        }
        const code = await warehouseService.getNextCode(typeId as string);
        return res.json({ success: true, data: code });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
