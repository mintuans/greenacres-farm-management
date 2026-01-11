import { Request, Response } from 'express';
import * as warehouseService from '../../services/warehouse.service';

const getWarehouseType = (req: Request) => {
    const path = req.baseUrl;
    if (path.includes('household')) return 'household';
    if (path.includes('electronics')) return 'electronics';
    if (path.includes('plants')) return 'plants';
    return '';
};

export const getItems = async (req: Request, res: Response) => {
    try {
        const type = getWarehouseType(req);
        const { search } = req.query;
        const items = await warehouseService.getItems(type, search as string);
        return res.json({ success: true, data: items });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createItem = async (req: Request, res: Response) => {
    try {
        const type = getWarehouseType(req);
        const item = await warehouseService.createItem(type, req.body);
        return res.status(201).json({ success: true, data: item });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateItem = async (req: Request, res: Response) => {
    try {
        const type = getWarehouseType(req);
        const { id } = req.params;
        const item = await warehouseService.updateItem(type, id, req.body);
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
        const type = getWarehouseType(req);
        const { id } = req.params;
        const success = await warehouseService.deleteItem(type, id);
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
        const type = getWarehouseType(req);
        const code = await warehouseService.getNextCode(type);
        return res.json({ success: true, data: code });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

