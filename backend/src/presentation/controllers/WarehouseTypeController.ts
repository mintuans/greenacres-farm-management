import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { WarehouseTypeService } from '../../domain/services/WarehouseTypeService';
import { TYPES } from '../../core/types';

@injectable()
export class WarehouseTypeController {
    constructor(
        @inject(TYPES.WarehouseTypeService) private warehouseTypeService: WarehouseTypeService
    ) {}

    getAll = async (_req: Request, res: Response): Promise<void> => {
        try {
            const types = await this.warehouseTypeService.getAllWarehouseTypes();
            res.json({ success: true, data: types });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    getOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const type = await this.warehouseTypeService.getWarehouseType(req.params.id);
            if (!type) {
                res.status(404).json({ success: false, message: 'Warehouse type not found' });
                return;
            }
            res.json({ success: true, data: type });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const type = await this.warehouseTypeService.createWarehouseType(req.body);
            res.status(201).json({ success: true, data: type });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const type = await this.warehouseTypeService.updateWarehouseType(req.params.id, req.body);
            res.json({ success: true, data: type });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.warehouseTypeService.deleteWarehouseType(req.params.id);
            res.json({ success: true, message: 'Warehouse type deleted successfully' });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };
}
