import { Request, Response } from 'express';
import * as inventoryService from '../../services/inventory.service';
import { logActivity } from '../../services/audit-log.service';

export const getInventory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { category_id } = req.query;
        const items = await inventoryService.getInventory(category_id as string);
        return res.json({ success: true, data: items });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createItem = async (req: Request, res: Response): Promise<any> => {
    try {
        const item = await inventoryService.createInventoryItem(req.body);

        await logActivity(req, 'CREATE_INVENTORY_ITEM', 'inventory', item.id, null, req.body);

        return res.status(201).json({ success: true, data: item });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateItem = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldItem = await inventoryService.getInventoryItemById(id);
        const item = await inventoryService.updateInventoryItem(id, req.body);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        await logActivity(req, 'UPDATE_INVENTORY_ITEM', 'inventory', id, oldItem, req.body);

        return res.json({ success: true, data: item });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteItem = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldItem = await inventoryService.getInventoryItemById(id);
        const success = await inventoryService.deleteInventoryItem(id);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        await logActivity(req, 'DELETE_INVENTORY_ITEM', 'inventory', id, oldItem, null);

        return res.json({ success: true, message: 'Item deleted' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getStats = async (_req: Request, res: Response): Promise<any> => {
    try {
        const stats = await inventoryService.getInventoryStats();
        return res.json({ success: true, data: stats });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
