import { Request, Response } from 'express';
import * as inventoryService from '../../services/inventory.service';

export const getInventory = async (req: Request, res: Response) => {
    try {
        const { category_id } = req.query;
        const items = await inventoryService.getInventory(category_id as string);
        res.json({ success: true, data: items });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createItem = async (req: Request, res: Response) => {
    try {
        const item = await inventoryService.createInventoryItem(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const item = await inventoryService.updateInventoryItem(id, req.body);
        if (!item) {
            res.status(404).json({ success: false, message: 'Item not found' });
            return;
        }
        res.json({ success: true, data: item });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const success = await inventoryService.deleteInventoryItem(id);
        if (!success) {
            res.status(404).json({ success: false, message: 'Item not found' });
            return;
        }
        res.json({ success: true, message: 'Item deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStats = async (_req: Request, res: Response) => {
    try {
        const stats = await inventoryService.getInventoryStats();
        res.json({ success: true, data: stats });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
