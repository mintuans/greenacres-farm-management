const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');

console.log('🚀 Implementing full SOLID modules based on old code...\n');

// ========== INVENTORY ==========
console.log('📦 Implementing Inventory...');

// Entity
const inventoryEntity = `/**
 * Inventory Domain Entity
 */
export interface Inventory {
    id: string;
    inventory_code: string;
    inventory_name: string;
    category_id?: string;
    category_name?: string;
    unit_of_measure?: string;
    stock_quantity: number;
    min_stock_level: number;
    last_import_price: number;
    import_date?: string;
    thumbnail_id?: string;
    note?: string;
    created_at?: string;
}

export interface CreateInventoryDTO {
    inventory_code: string;
    inventory_name: string;
    category_id?: string;
    unit_of_measure?: string;
    stock_quantity?: number;
    min_stock_level?: number;
    last_import_price?: number;
    import_date?: string;
    thumbnail_id?: string;
    note?: string;
}

export interface UpdateInventoryDTO {
    inventory_name?: string;
    category_id?: string;
    unit_of_measure?: string;
    stock_quantity?: number;
    min_stock_level?: number;
    last_import_price?: number;
    import_date?: string;
    thumbnail_id?: string;
    note?: string;
}
`;

// Repository Interface
const inventoryRepoInterface = `import { IRepository } from '../../core/interfaces/IRepository';
import { Inventory } from '../entities/Inventory';

export interface IInventoryRepository extends IRepository<Inventory> {
    findByCategory(categoryId: string): Promise<Inventory[]>;
    getStats(): Promise<any>;
    updateStockQuantity(id: string, change: number): Promise<void>;
}
`;

// Repository Implementation
const inventoryRepo = `import { injectable, inject } from 'inversify';
import { IDatabase } from '../../../core/interfaces/IDatabase';
import { IInventoryRepository } from '../../../domain/repositories/IInventoryRepository';
import { Inventory } from '../../../domain/entities/Inventory';
import { TYPES } from '../../../core/types';

@injectable()
export class InventoryRepository implements IInventoryRepository {
    constructor(@inject(TYPES.IDatabase) private db: IDatabase) {}

    async findById(id: string): Promise<Inventory | null> {
        const result = await this.db.query<Inventory>(
            'SELECT * FROM inventory WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async findAll(): Promise<Inventory[]> {
        const query = \`
            SELECT i.*, c.category_name 
            FROM inventory i
            LEFT JOIN categories c ON i.category_id = c.id
            ORDER BY i.inventory_name ASC
        \`;
        const result = await this.db.query<Inventory>(query);
        return result.rows;
    }

    async findByCategory(categoryId: string): Promise<Inventory[]> {
        const query = \`
            SELECT i.*, c.category_name 
            FROM inventory i
            LEFT JOIN categories c ON i.category_id = c.id
            WHERE i.category_id = $1
            ORDER BY i.inventory_name ASC
        \`;
        const result = await this.db.query<Inventory>(query, [categoryId]);
        return result.rows;
    }

    async getStats(): Promise<any> {
        const query = \`
            SELECT 
                COUNT(*) as total_items,
                SUM(CASE WHEN stock_quantity <= min_stock_level THEN 1 ELSE 0 END) as low_stock_items,
                SUM(stock_quantity * last_import_price) as total_value
            FROM inventory
        \`;
        const result = await this.db.query(query);
        return result.rows[0];
    }

    async updateStockQuantity(id: string, change: number): Promise<void> {
        await this.db.query(
            'UPDATE inventory SET stock_quantity = stock_quantity + $1 WHERE id = $2',
            [change, id]
        );
    }

    async create(data: Partial<Inventory>): Promise<Inventory> {
        const query = \`
            INSERT INTO inventory (
                inventory_code, inventory_name, category_id, 
                unit_of_measure, stock_quantity, min_stock_level, 
                last_import_price, import_date, thumbnail_id, note
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        \`;
        const values = [
            data.inventory_code,
            data.inventory_name,
            data.category_id && data.category_id.trim() !== '' ? data.category_id : null,
            data.unit_of_measure,
            data.stock_quantity || 0,
            data.min_stock_level || 0,
            data.last_import_price || 0,
            data.import_date || new Date().toISOString(),
            data.thumbnail_id || null,
            data.note
        ];
        const result = await this.db.query<Inventory>(query, values);
        return result.rows[0];
    }

    async update(id: string, data: Partial<Inventory>): Promise<Inventory | null> {
        const fields = [
            'inventory_name', 'category_id', 'unit_of_measure',
            'stock_quantity', 'min_stock_level', 'last_import_price', 'import_date', 'thumbnail_id', 'note'
        ];
        const values: any[] = [];
        const setClauses = fields
            .map((field) => {
                if (data[field as keyof Inventory] !== undefined) {
                    let value = data[field as keyof Inventory];
                    if (field === 'category_id' && typeof value === 'string' && value.trim() === '') {
                        value = null;
                    }
                    if (field === 'thumbnail_id' && typeof value === 'string' && value.trim() === '') {
                        value = null;
                    }
                    values.push(value);
                    return \`\${field} = $\${values.length}\`;
                }
                return null;
            })
            .filter(Boolean);

        if (setClauses.length === 0) return null;

        values.push(id);
        const query = \`
            UPDATE inventory 
            SET \${setClauses.join(', ')} 
            WHERE id = $\${values.length} 
            RETURNING *
        \`;
        const result = await this.db.query<Inventory>(query, values);
        return result.rows[0];
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.query('DELETE FROM inventory WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}
`;

// Service
const inventoryService = `import { injectable, inject } from 'inversify';
import { IInventoryRepository } from '../repositories/IInventoryRepository';
import { Inventory, CreateInventoryDTO, UpdateInventoryDTO } from '../entities/Inventory';
import { TYPES } from '../../core/types';

@injectable()
export class InventoryService {
    constructor(
        @inject(TYPES.IInventoryRepository) private inventoryRepo: IInventoryRepository
    ) {}

    async getInventory(id: string): Promise<Inventory | null> {
        if (!id || id.trim() === '') {
            throw new Error('Inventory ID is required');
        }
        return this.inventoryRepo.findById(id);
    }

    async getAllInventory(categoryId?: string): Promise<Inventory[]> {
        if (categoryId) {
            return this.inventoryRepo.findByCategory(categoryId);
        }
        return this.inventoryRepo.findAll();
    }

    async getInventoryStats(): Promise<any> {
        return this.inventoryRepo.getStats();
    }

    async createInventory(data: CreateInventoryDTO): Promise<Inventory> {
        if (!data.inventory_code || data.inventory_code.trim() === '') {
            throw new Error('Inventory code is required');
        }
        if (!data.inventory_name || data.inventory_name.trim() === '') {
            throw new Error('Inventory name is required');
        }
        return this.inventoryRepo.create(data);
    }

    async updateInventory(id: string, data: UpdateInventoryDTO): Promise<Inventory | null> {
        if (!id || id.trim() === '') {
            throw new Error('Inventory ID is required');
        }
        const existing = await this.inventoryRepo.findById(id);
        if (!existing) {
            throw new Error(\`Inventory with ID '\${id}' not found\`);
        }
        return this.inventoryRepo.update(id, data);
    }

    async updateStockQuantity(id: string, change: number): Promise<void> {
        if (!id || id.trim() === '') {
            throw new Error('Inventory ID is required');
        }
        const existing = await this.inventoryRepo.findById(id);
        if (!existing) {
            throw new Error(\`Inventory with ID '\${id}' not found\`);
        }
        await this.inventoryRepo.updateStockQuantity(id, change);
    }

    async deleteInventory(id: string): Promise<boolean> {
        if (!id || id.trim() === '') {
            throw new Error('Inventory ID is required');
        }
        const existing = await this.inventoryRepo.findById(id);
        if (!existing) {
            throw new Error(\`Inventory with ID '\${id}' not found\`);
        }
        return this.inventoryRepo.delete(id);
    }
}
`;

// Controller
const inventoryController = `import { Request, Response } from 'express';
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
`;

// Write files
fs.writeFileSync(path.join(baseDir, 'src/domain/entities/Inventory.ts'), inventoryEntity);
fs.writeFileSync(path.join(baseDir, 'src/domain/repositories/IInventoryRepository.ts'), inventoryRepoInterface);
fs.writeFileSync(path.join(baseDir, 'src/infrastructure/database/repositories/InventoryRepository.ts'), inventoryRepo);
fs.writeFileSync(path.join(baseDir, 'src/domain/services/InventoryService.ts'), inventoryService);
fs.writeFileSync(path.join(baseDir, 'src/presentation/controllers/InventoryController.ts'), inventoryController);

console.log('  ✅ Inventory.ts');
console.log('  ✅ IInventoryRepository.ts');
console.log('  ✅ InventoryRepository.ts');
console.log('  ✅ InventoryService.ts');
console.log('  ✅ InventoryController.ts');
console.log('');

console.log('🎉 Inventory module implemented successfully!');
console.log('\n📝 Next: Run this script for other modules or implement manually');
