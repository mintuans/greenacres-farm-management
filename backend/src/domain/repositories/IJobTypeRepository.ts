import { IRepository } from '../../core/interfaces/IRepository';
import { JobType } from '../entities/JobType';

/**
 * JobType Repository Interface
 * Manages job type data access operations
 */
export interface IJobTypeRepository extends IRepository<JobType> {
    // Inherits all CRUD operations from IRepository
}
