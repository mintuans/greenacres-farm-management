import { injectable, inject } from 'inversify';
import { IWarehouseTypeRepository } from '../repositories/IWarehouseTypeRepository';
import { WarehouseType, CreateWarehouseTypeDTO, UpdateWarehouseTypeDTO } from '../entities/WarehouseType';
import { TYPES } from '../../core/types';

@injectable()
export class WarehouseTypeService {
    constructor(
        @inject(TYPES.IWarehouseTypeRepository) private warehouseTypeRepo: IWarehouseTypeRepository
    ) {}

    async getWarehouseType(id: string): Promise<WarehouseType | null> {
        if (!id || id.trim() === '') {
            throw new Error('WarehouseType ID is required');
        }
        return this.warehouseTypeRepo.findById(id);
    }

    async getAllWarehouseTypes(): Promise<WarehouseType[]> {
        return this.warehouseTypeRepo.findAll();
    }

    async createWarehouseType(data: CreateWarehouseTypeDTO): Promise<WarehouseType> {
        if (!data.type_name || data.type_name.trim() === '') {
            throw new Error('Type name is required');
        }
        return this.warehouseTypeRepo.create(data);
    }

    async updateWarehouseType(id: string, data: UpdateWarehouseTypeDTO): Promise<WarehouseType | null> {
        if (!id || id.trim() === '') {
            throw new Error('WarehouseType ID is required');
        }
        const existing = await this.warehouseTypeRepo.findById(id);
        if (!existing) {
            throw new Error(`WarehouseType with ID '${id}' not found`);
        }
        return this.warehouseTypeRepo.update(id, data);
    }

    async deleteWarehouseType(id: string): Promise<boolean> {
        if (!id || id.trim() === '') {
            throw new Error('WarehouseType ID is required');
        }
        const existing = await this.warehouseTypeRepo.findById(id);
        if (!existing) {
            throw new Error(`WarehouseType with ID '${id}' not found`);
        }
        return this.warehouseTypeRepo.delete(id);
    }
}
