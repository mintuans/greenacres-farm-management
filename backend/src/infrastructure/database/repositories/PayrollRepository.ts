import { injectable, inject } from 'inversify';
import { IDatabase } from '../../../core/interfaces/IDatabase';
import { IPayrollRepository } from '../../../domain/repositories/IPayrollRepository';
import { Payroll } from '../../../domain/entities/Payroll';
import { TYPES } from '../../../core/types';

@injectable()
export class PayrollRepository implements IPayrollRepository {
    constructor(@inject(TYPES.IDatabase) private db: IDatabase) {}

    async findById(id: string): Promise<Payroll | null> {
        const query = `
            SELECT p.*, pt.partner_name
            FROM payrolls p
            JOIN partners pt ON p.partner_id = pt.id
            WHERE p.id = $1
        `;
        const result = await this.db.query<Payroll>(query, [id]);
        return result.rows[0] || null;
    }

    async findAll(): Promise<Payroll[]> {
        const query = `
            SELECT p.*, pt.partner_name
            FROM payrolls p
            JOIN partners pt ON p.partner_id = pt.id
            ORDER BY p.created_at DESC
        `;
        const result = await this.db.query<Payroll>(query);
        return result.rows;
    }

    async findByPartner(partnerId: string): Promise<Payroll[]> {
        const query = `
            SELECT p.*, pt.partner_name
            FROM payrolls p
            JOIN partners pt ON p.partner_id = pt.id
            WHERE p.partner_id = $1
            ORDER BY p.created_at DESC
        `;
        const result = await this.db.query<Payroll>(query, [partnerId]);
        return result.rows;
    }

    async findBySeason(seasonId: string): Promise<Payroll[]> {
        const query = `
            SELECT DISTINCT p.*, pt.partner_name
            FROM payrolls p
            JOIN partners pt ON p.partner_id = pt.id
            JOIN daily_work_logs dl ON p.id = dl.payroll_id
            WHERE dl.season_id = $1
            ORDER BY p.created_at DESC
        `;
        const result = await this.db.query<Payroll>(query, [seasonId]);
        return result.rows;
    }

    async updateStatus(id: string, status: string, paymentDate?: string): Promise<Payroll | null> {
        const query = `
            UPDATE payrolls 
            SET status = $1, 
                payment_date = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 
            RETURNING *
        `;
        const values = [status, paymentDate || new Date().toISOString(), id];
        const result = await this.db.query<Payroll>(query, values);
        return result.rows[0];
    }

    async getStats(): Promise<any> {
        const query = `
            SELECT 
                COUNT(*) as total_payrolls,
                COUNT(CASE WHEN status = 'DRAFT' THEN 1 END) as draft_count,
                COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paid_count,
                COALESCE(SUM(CASE WHEN status = 'PAID' THEN final_amount ELSE 0 END), 0) as total_paid_amount,
                COALESCE(SUM(CASE WHEN status IN ('DRAFT', 'APPROVED') THEN final_amount ELSE 0 END), 0) as pending_amount
            FROM payrolls
        `;
        const result = await this.db.query(query);
        return result.rows[0];
    }

    async create(data: Partial<Payroll>): Promise<Payroll> {
        const query = `
            INSERT INTO payrolls (
                payroll_code, partner_id, total_amount, bonus, 
                deductions, final_amount, status, payment_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [
            data.payroll_code,
            data.partner_id,
            data.total_amount || 0,
            data.bonus || 0,
            data.deductions || 0,
            data.final_amount,
            data.status || 'DRAFT',
            data.payment_date || null
        ];
        const result = await this.db.query<Payroll>(query, values);
        return result.rows[0];
    }

    async update(id: string, data: Partial<Payroll>): Promise<Payroll | null> {
        const fields = ['total_amount', 'bonus', 'deductions', 'final_amount', 'status', 'payment_date'];
        const values: any[] = [];
        const setClauses = fields
            .map((field) => {
                if (data[field as keyof Payroll] !== undefined) {
                    values.push(data[field as keyof Payroll]);
                    return `${field} = $${values.length}`;
                }
                return null;
            })
            .filter(Boolean);

        if (setClauses.length === 0) return null;

        values.push(id);
        const query = `
            UPDATE payrolls 
            SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${values.length} 
            RETURNING *
        `;
        const result = await this.db.query<Payroll>(query, values);
        return result.rows[0];
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.query('DELETE FROM payrolls WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}
