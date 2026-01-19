import { injectable, inject } from 'inversify';
import { IDatabase } from '../../../core/interfaces/IDatabase';
import { ISeasonRepository } from '../../../domain/repositories/ISeasonRepository';
import { Season } from '../../../domain/entities/Season';
import { TYPES } from '../../../core/types';

@injectable()
export class SeasonRepository implements ISeasonRepository {
    constructor(@inject(TYPES.IDatabase) private db: IDatabase) { }

    async findById(id: string): Promise<Season | null> {
        const query = `
            SELECT s.*, pu.unit_name
            FROM seasons s
            LEFT JOIN production_units pu ON s.unit_id = pu.id
            WHERE s.id = $1
        `;
        const result = await this.db.query<Season>(query, [id]);
        return result.rows[0] || null;
    }

    async findAll(): Promise<Season[]> {
        const query = `
            SELECT s.*, pu.unit_name
            FROM seasons s
            LEFT JOIN production_units pu ON s.unit_id = pu.id
            ORDER BY s.start_date DESC
        `;
        const result = await this.db.query<Season>(query);
        return result.rows;
    }

    async findByStatus(status: string): Promise<Season[]> {
        const result = await this.db.query<Season>(
            'SELECT * FROM seasons WHERE status = $1 ORDER BY start_date DESC',
            [status]
        );
        return result.rows;
    }

    async findActive(): Promise<Season | null> {
        const result = await this.db.query<Season>(
            'SELECT * FROM seasons WHERE status = $1 ORDER BY start_date DESC LIMIT 1',
            ['ACTIVE']
        );
        return result.rows[0] || null;
    }

    async create(data: Partial<Season>): Promise<Season> {
        const query = `
            INSERT INTO seasons (season_name, start_date, end_date, status, description)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [
            data.season_name,
            data.start_date,
            data.end_date,
            data.status,
            data.description
        ];
        const result = await this.db.query<Season>(query, values);
        return result.rows[0];
    }

    async update(id: string, data: Partial<Season>): Promise<Season | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        const allowedFields = ['season_name', 'start_date', 'end_date', 'status', 'description'];
        for (const key of allowedFields) {
            if (data[key as keyof Season] !== undefined) {
                fields.push(`${key} = $${paramIndex++}`);
                values.push(data[key as keyof Season]);
            }
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const query = `
            UPDATE seasons 
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        const result = await this.db.query<Season>(query, values);
        return result.rows[0] || null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.query('DELETE FROM seasons WHERE id = $1', [id]);
        return result.rowCount > 0;
    }

    async getStats(): Promise<any> {
        const query = `
            SELECT 
                status,
                COUNT(*) as count,
                SUM(expected_revenue) as total_expected_revenue
            FROM seasons
            GROUP BY status
        `;
        const result = await this.db.query(query);
        return result.rows;
    }

    async getNextCode(): Promise<string> {
        const query = `
            SELECT season_code 
            FROM seasons 
            WHERE season_code LIKE 'MUAVU%' 
            ORDER BY season_code DESC 
            LIMIT 1
        `;
        const result = await this.db.query(query);

        if (result.rows.length === 0) {
            return 'MUAVU01';
        }

        const lastCode = result.rows[0].season_code;
        const lastNumber = parseInt(lastCode.replace('MUAVU', ''), 10);
        const nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;

        return `MUAVU${nextNumber.toString().padStart(2, '0')}`;
    }

    async closeSeason(id: string): Promise<Season | null> {
        const query = `
            UPDATE seasons 
            SET status = 'CLOSED', end_date = CURRENT_DATE
            WHERE id = $1
            RETURNING *
        `;
        const result = await this.db.query<Season>(query, [id]);
        return result.rows[0] || null;
    }
}
