import { injectable, inject } from 'inversify';
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
            throw new Error(`Inventory with ID '${id}' not found`);
        }
        return this.inventoryRepo.update(id, data);
    }

    async updateStockQuantity(id: string, change: number): Promise<void> {
        if (!id || id.trim() === '') {
            throw new Error('Inventory ID is required');
        }
        const existing = await this.inventoryRepo.findById(id);
        if (!existing) {
            throw new Error(`Inventory with ID '${id}' not found`);
        }
        await this.inventoryRepo.updateStockQuantity(id, change);
    }

    async deleteInventory(id: string): Promise<boolean> {
        if (!id || id.trim() === '') {
            throw new Error('Inventory ID is required');
        }
        const existing = await this.inventoryRepo.findById(id);
        if (!existing) {
            throw new Error(`Inventory with ID '${id}' not found`);
        }
        return this.inventoryRepo.delete(id);
    }
}
