import { injectable, inject } from 'inversify';
import { IDatabase } from '../../../core/interfaces/IDatabase';
import { IJobTypeRepository } from '../../../domain/repositories/IJobTypeRepository';
import { JobType } from '../../../domain/entities/JobType';
import { TYPES } from '../../../core/types';

@injectable()
export class JobTypeRepository implements IJobTypeRepository {
    constructor(@inject(TYPES.IDatabase) private db: IDatabase) {}

    async findById(id: string): Promise<JobType | null> {
        const result = await this.db.query<JobType>(
            'SELECT * FROM job_types WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async findAll(): Promise<JobType[]> {
        const result = await this.db.query<JobType>(
            'SELECT * FROM job_types ORDER BY job_name ASC'
        );
        return result.rows;
    }

    async create(data: Partial<JobType>): Promise<JobType> {
        const query = 'INSERT INTO job_types (job_name, description) VALUES ($1, $2) RETURNING *';
        const values = [data.job_name, data.description];
        const result = await this.db.query<JobType>(query, values);
        return result.rows[0];
    }

    async update(id: string, data: Partial<JobType>): Promise<JobType | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.job_name !== undefined) {
            fields.push(`job_name = $${paramIndex++}`);
            values.push(data.job_name);
        }
        if (data.description !== undefined) {
            fields.push(`description = $${paramIndex++}`);
            values.push(data.description);
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const query = `UPDATE job_types SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await this.db.query<JobType>(query, values);
        return result.rows[0] || null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.query('DELETE FROM job_types WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}
