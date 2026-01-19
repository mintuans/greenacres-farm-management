import { IRepository } from '../../core/interfaces/IRepository';
import { WarehouseType } from '../entities/WarehouseType';

/**
 * WarehouseType Repository Interface
 * Manages warehouse type data access operations
 */
export interface IWarehouseTypeRepository extends IRepository<WarehouseType> {
    // Inherits all CRUD operations from IRepository
}
