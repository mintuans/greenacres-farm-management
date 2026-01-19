import { injectable, inject } from 'inversify';
import { IDatabase } from '../../../core/interfaces/IDatabase';
import { IWorkShiftRepository } from '../../../domain/repositories/IWorkShiftRepository';
import { WorkShift } from '../../../domain/entities/WorkShift';
import { TYPES } from '../../../core/types';

@injectable()
export class WorkShiftRepository implements IWorkShiftRepository {
    constructor(@inject(TYPES.IDatabase) private db: IDatabase) {}

    async findById(id: string): Promise<WorkShift | null> {
        const result = await this.db.query<WorkShift>(
            'SELECT * FROM work_shifts WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async findAll(): Promise<WorkShift[]> {
        const result = await this.db.query<WorkShift>(
            'SELECT * FROM work_shifts ORDER BY start_time ASC'
        );
        return result.rows;
    }

    async create(data: Partial<WorkShift>): Promise<WorkShift> {
        const query = `
            INSERT INTO work_shifts (shift_name, start_time, end_time, description)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const values = [data.shift_name, data.start_time, data.end_time, data.description];
        const result = await this.db.query<WorkShift>(query, values);
        return result.rows[0];
    }

    async update(id: string, data: Partial<WorkShift>): Promise<WorkShift | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        const allowedFields = ['shift_name', 'start_time', 'end_time', 'description'];
        for (const key of allowedFields) {
            if (data[key as keyof WorkShift] !== undefined) {
                fields.push(`${key} = $${paramIndex++}`);
                values.push(data[key as keyof WorkShift]);
            }
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const query = `UPDATE work_shifts SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await this.db.query<WorkShift>(query, values);
        return result.rows[0] || null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.query('DELETE FROM work_shifts WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}
