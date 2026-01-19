import { IRepository } from '../../core/interfaces/IRepository';
import { Partner } from '../entities/Partner';

/**
 * Partner Repository Interface
 * Extends base repository with Partner-specific operations
 * Tuân thủ Interface Segregation Principle
 */
export interface IPartnerRepository extends IRepository<Partner> {
    /**
     * Find partners by type
     * @param type Partner type (SUPPLIER/BUYER/WORKER)
     * @returns Array of partners matching the type
     */
    findByType(type: string): Promise<Partner[]>;

    /**
     * Get current balance of a partner
     * @param id Partner ID
     * @returns Current balance
     */
    getBalance(id: string): Promise<number>;

    /**
     * Check if partner code already exists
     * @param code Partner code
     * @returns True if exists, false otherwise
     */
    existsByCode(code: string): Promise<boolean>;
}
