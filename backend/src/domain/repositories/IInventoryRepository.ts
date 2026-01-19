import { IRepository } from '../../core/interfaces/IRepository';
import { Inventory } from '../entities/Inventory';

export interface IInventoryRepository extends IRepository<Inventory> {
    findByCategory(categoryId: string): Promise<Inventory[]>;
    getStats(): Promise<any>;
    updateStockQuantity(id: string, change: number): Promise<void>;
}
