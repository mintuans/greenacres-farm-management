import { injectable, inject } from 'inversify';
import { IDatabase } from '../../../core/interfaces/IDatabase';
import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { Transaction } from '../../../domain/entities/Transaction';
import { TYPES } from '../../../core/types';

@injectable()
export class TransactionRepository implements ITransactionRepository {
    constructor(@inject(TYPES.IDatabase) private db: IDatabase) {}

    async findById(id: string): Promise<Transaction | null> {
        const result = await this.db.query<Transaction>(
            'SELECT * FROM transactions WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async findAll(): Promise<Transaction[]> {
        const query = `
            SELECT t.*, p.partner_name
            FROM transactions t
            LEFT JOIN partners p ON t.partner_id = p.id
            ORDER BY t.transaction_date DESC
        `;
        const result = await this.db.query<Transaction>(query);
        return result.rows;
    }

    async findByPartner(partnerId: string): Promise<Transaction[]> {
        const result = await this.db.query<Transaction>(
            'SELECT * FROM transactions WHERE partner_id = $1 ORDER BY transaction_date DESC',
            [partnerId]
        );
        return result.rows;
    }

    async findByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
        const result = await this.db.query<Transaction>(
            'SELECT * FROM transactions WHERE transaction_date BETWEEN $1 AND $2 ORDER BY transaction_date DESC',
            [startDate, endDate]
        );
        return result.rows;
    }

    async findByType(type: string): Promise<Transaction[]> {
        const result = await this.db.query<Transaction>(
            'SELECT * FROM transactions WHERE transaction_type = $1 ORDER BY transaction_date DESC',
            [type]
        );
        return result.rows;
    }

    async getTotalByType(type: string): Promise<number> {
        const result = await this.db.query<{ total: string }>(
            'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE transaction_type = $1',
            [type]
        );
        return parseFloat(result.rows[0].total);
    }

    async create(data: Partial<Transaction>): Promise<Transaction> {
        const query = `
            INSERT INTO transactions (partner_id, transaction_type, amount, description, transaction_date)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [
            data.partner_id,
            data.transaction_type,
            data.amount,
            data.description,
            data.transaction_date
        ];
        const result = await this.db.query<Transaction>(query, values);
        return result.rows[0];
    }

    async update(id: string, data: Partial<Transaction>): Promise<Transaction | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        const allowedFields = ['partner_id', 'transaction_type', 'amount', 'description', 'transaction_date'];
        for (const key of allowedFields) {
            if (data[key as keyof Transaction] !== undefined) {
                fields.push(`${key} = $${paramIndex++}`);
                values.push(data[key as keyof Transaction]);
            }
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const query = `
            UPDATE transactions 
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        const result = await this.db.query<Transaction>(query, values);
        return result.rows[0] || null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.query('DELETE FROM transactions WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}
