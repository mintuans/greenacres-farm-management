import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { InventoryService } from '../../domain/services/InventoryService';
import { TYPES } from '../../core/types';

@injectable()
export class InventoryController {
    constructor(
        @inject(TYPES.InventoryService) private inventoryService: InventoryService
    ) {}

    getAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const { categoryId } = req.query;
            const items = await this.inventoryService.getAllInventory(categoryId as string);
            res.json({ success: true, data: items });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    getOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const item = await this.inventoryService.getInventory(req.params.id);
            if (!item) {
                res.status(404).json({ success: false, message: 'Inventory not found' });
                return;
            }
            res.json({ success: true, data: item });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    getStats = async (_req: Request, res: Response): Promise<void> => {
        try {
            const stats = await this.inventoryService.getInventoryStats();
            res.json({ success: true, data: stats });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const item = await this.inventoryService.createInventory(req.body);
            res.status(201).json({ success: true, data: item });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const item = await this.inventoryService.updateInventory(req.params.id, req.body);
            res.json({ success: true, data: item });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };

    updateStock = async (req: Request, res: Response): Promise<void> => {
        try {
            const { change } = req.body;
            await this.inventoryService.updateStockQuantity(req.params.id, change);
            res.json({ success: true, message: 'Stock quantity updated' });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.inventoryService.deleteInventory(req.params.id);
            res.json({ success: true, message: 'Inventory deleted successfully' });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };
}
