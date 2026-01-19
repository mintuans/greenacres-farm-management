import { injectable, inject } from 'inversify';
import { IPartnerRepository } from '../repositories/IPartnerRepository';
import { Partner, CreatePartnerDTO, UpdatePartnerDTO } from '../entities/Partner';
import { TYPES } from '../../core/types';

/**
 * Partner Service
 * Business logic layer cho Partner management
 * Tuân thủ Single Responsibility Principle - chỉ xử lý business logic
 */
@injectable()
export class PartnerService {
    constructor(
        @inject(TYPES.IPartnerRepository) private partnerRepo: IPartnerRepository
    ) { }

    /**
     * Get partner by ID
     */
    async getPartner(id: string): Promise<Partner | null> {
        if (!id || id.trim() === '') {
            throw new Error('Partner ID is required');
        }
        return this.partnerRepo.findById(id);
    }

    /**
     * Get all partners with optional type filter
     */
    async getAllPartners(type?: string): Promise<Partner[]> {
        if (type) {
            // Validate type
            const validTypes = ['SUPPLIER', 'BUYER', 'WORKER'];
            if (!validTypes.includes(type.toUpperCase())) {
                throw new Error(`Invalid partner type. Must be one of: ${validTypes.join(', ')}`);
            }
            return this.partnerRepo.findByType(type.toUpperCase());
        }
        return this.partnerRepo.findAll();
    }

    /**
     * Create new partner
     */
    async createPartner(data: CreatePartnerDTO): Promise<Partner> {
        // Business validation
        this.validatePartnerData(data);

        // Check duplicate code
        const exists = await this.partnerRepo.existsByCode(data.partner_code);
        if (exists) {
            throw new Error(`Partner code '${data.partner_code}' already exists`);
        }

        return this.partnerRepo.create(data);
    }

    /**
     * Update partner
     */
    async updatePartner(id: string, data: UpdatePartnerDTO): Promise<Partner | null> {
        if (!id || id.trim() === '') {
            throw new Error('Partner ID is required');
        }

        // Check if partner exists
        const existing = await this.partnerRepo.findById(id);
        if (!existing) {
            throw new Error(`Partner with ID '${id}' not found`);
        }

        // Validate update data
        if (data.partner_name !== undefined && data.partner_name.trim() === '') {
            throw new Error('Partner name cannot be empty');
        }

        if (data.type !== undefined) {
            const validTypes = ['SUPPLIER', 'BUYER', 'WORKER'];
            if (!validTypes.includes(data.type)) {
                throw new Error(`Invalid partner type. Must be one of: ${validTypes.join(', ')}`);
            }
        }

        return this.partnerRepo.update(id, data);
    }

    /**
     * Delete partner
     */
    async deletePartner(id: string): Promise<boolean> {
        if (!id || id.trim() === '') {
            throw new Error('Partner ID is required');
        }

        // Check if partner exists
        const existing = await this.partnerRepo.findById(id);
        if (!existing) {
            throw new Error(`Partner with ID '${id}' not found`);
        }

        // Business rule: Check if partner has transactions
        // TODO: Add check for related transactions before delete

        return this.partnerRepo.delete(id);
    }

    /**
     * Get partner balance
     */
    async getPartnerBalance(id: string): Promise<number> {
        if (!id || id.trim() === '') {
            throw new Error('Partner ID is required');
        }

        const partner = await this.partnerRepo.findById(id);
        if (!partner) {
            throw new Error(`Partner with ID '${id}' not found`);
        }

        return this.partnerRepo.getBalance(id);
    }

    /**
     * Validate partner data
     */
    private validatePartnerData(data: CreatePartnerDTO): void {
        if (!data.partner_code || data.partner_code.trim() === '') {
            throw new Error('Partner code is required');
        }

        if (!data.partner_name || data.partner_name.trim() === '') {
            throw new Error('Partner name is required');
        }

        if (!data.type) {
            throw new Error('Partner type is required');
        }

        const validTypes = ['SUPPLIER', 'BUYER', 'WORKER'];
        if (!validTypes.includes(data.type)) {
            throw new Error(`Invalid partner type. Must be one of: ${validTypes.join(', ')}`);
        }

        // Validate phone format if provided
        if (data.phone && data.phone.trim() !== '') {
            const phoneRegex = /^[0-9+\-\s()]+$/;
            if (!phoneRegex.test(data.phone)) {
                throw new Error('Invalid phone number format');
            }
        }
    }
}
