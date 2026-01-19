import { injectable, inject } from 'inversify';
import { IDatabase } from '../../../core/interfaces/IDatabase';
import { IPartnerRepository } from '../../../domain/repositories/IPartnerRepository';
import { Partner } from '../../../domain/entities/Partner';
import { TYPES } from '../../../core/types';

/**
 * Partner Repository Implementation
 * Concrete implementation của IPartnerRepository
 * Tuân thủ Single Responsibility Principle - chỉ xử lý data access
 */
@injectable()
export class PartnerRepository implements IPartnerRepository {
    constructor(
        @inject(TYPES.IDatabase) private db: IDatabase
    ) { }

    async findById(id: string): Promise<Partner | null> {
        const result = await this.db.query<Partner>(
            'SELECT * FROM partners WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async findAll(): Promise<Partner[]> {
        const result = await this.db.query<Partner>(
            'SELECT * FROM partners ORDER BY created_at DESC'
        );
        return result.rows;
    }

    async findByType(type: string): Promise<Partner[]> {
        const result = await this.db.query<Partner>(
            'SELECT * FROM partners WHERE type = $1 ORDER BY created_at DESC',
            [type]
        );
        return result.rows;
    }

    async create(data: Partial<Partner>): Promise<Partner> {
        const result = await this.db.query<Partner>(
            `INSERT INTO partners (partner_code, partner_name, type, phone, address)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [data.partner_code, data.partner_name, data.type, data.phone, data.address]
        );
        return result.rows[0];
    }

    async update(id: string, data: Partial<Partner>): Promise<Partner | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        // Build dynamic UPDATE query
        const allowedFields = ['partner_name', 'type', 'phone', 'address'];
        for (const key of allowedFields) {
            if (data[key as keyof Partner] !== undefined) {
                fields.push(`${key} = $${paramIndex++}`);
                values.push(data[key as keyof Partner]);
            }
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        const result = await this.db.query<Partner>(
            `UPDATE partners 
             SET ${fields.join(', ')}
             WHERE id = $${paramIndex}
             RETURNING *`,
            values
        );
        return result.rows[0] || null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.query(
            'DELETE FROM partners WHERE id = $1',
            [id]
        );
        return result.rowCount > 0;
    }

    async getBalance(id: string): Promise<number> {
        const result = await this.db.query<{ current_balance: number }>(
            'SELECT current_balance FROM partners WHERE id = $1',
            [id]
        );
        return result.rows[0]?.current_balance || 0;
    }

    async existsByCode(code: string): Promise<boolean> {
        const result = await this.db.query<{ count: string }>(
            'SELECT COUNT(*) as count FROM partners WHERE partner_code = $1',
            [code]
        );
        return parseInt(result.rows[0].count) > 0;
    }
}
