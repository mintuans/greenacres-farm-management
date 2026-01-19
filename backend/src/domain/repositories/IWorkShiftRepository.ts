import { IRepository } from '../../core/interfaces/IRepository';
import { WorkShift } from '../entities/WorkShift';

/**
 * WorkShift Repository Interface
 * Manages work shift data access operations
 */
export interface IWorkShiftRepository extends IRepository<WorkShift> {
    // Inherits all CRUD operations from IRepository
}
