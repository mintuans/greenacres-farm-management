import { injectable, inject } from 'inversify';
import { IDatabase } from '../../../core/interfaces/IDatabase';
import { IWorkScheduleRepository } from '../../../domain/repositories/IWorkScheduleRepository';
import { WorkSchedule } from '../../../domain/entities/WorkSchedule';
import { TYPES } from '../../../core/types';

@injectable()
export class WorkScheduleRepository implements IWorkScheduleRepository {
    constructor(@inject(TYPES.IDatabase) private db: IDatabase) { }

    async findById(id: string): Promise<WorkSchedule | null> {
        const result = await this.db.query<WorkSchedule>(
            'SELECT * FROM work_schedules WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async findAll(): Promise<WorkSchedule[]> {
        const result = await this.db.query<WorkSchedule>(
            'SELECT * FROM work_schedules ORDER BY created_at DESC'
        );
        return result.rows;
    }

    async findAllWithDetails(): Promise<WorkSchedule[]> {
        const query = `
            SELECT ws.*, p.partner_name, s.shift_name, j.job_name, sn.season_name
            FROM work_schedules ws
            LEFT JOIN partners p ON ws.partner_id = p.id
            LEFT JOIN work_shifts s ON ws.shift_id = s.id
            LEFT JOIN job_types j ON ws.job_type_id = j.id
            LEFT JOIN seasons sn ON ws.season_id = sn.id
            ORDER BY ws.work_date DESC, s.start_time ASC
        `;
        const result = await this.db.query<WorkSchedule>(query);
        return result.rows;
    }

    async findByPartnerId(partnerId: string): Promise<WorkSchedule[]> {
        const result = await this.db.query<WorkSchedule>(
            'SELECT * FROM work_schedules WHERE partner_id = $1 ORDER BY work_date DESC',
            [partnerId]
        );
        return result.rows;
    }

    async findByDateRange(startDate: string, endDate: string): Promise<WorkSchedule[]> {
        const result = await this.db.query<WorkSchedule>(
            'SELECT * FROM work_schedules WHERE work_date BETWEEN $1 AND $2 ORDER BY work_date DESC',
            [startDate, endDate]
        );
        return result.rows;
    }

    async findByStatus(status: string): Promise<WorkSchedule[]> {
        const result = await this.db.query<WorkSchedule>(
            'SELECT * FROM work_schedules WHERE status = $1 ORDER BY work_date DESC',
            [status]
        );
        return result.rows;
    }

    async create(data: Partial<WorkSchedule>): Promise<WorkSchedule> {
        // Chuyển empty string thành null để tránh lỗi UUID trong Postgres
        const seasonId = data.season_id && data.season_id !== '' ? data.season_id : null;

        const query = `
            INSERT INTO work_schedules (partner_id, shift_id, job_type_id, work_date, status, note, season_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [
            data.partner_id,
            data.shift_id,
            data.job_type_id,
            data.work_date,
            data.status,
            data.note,
            seasonId
        ];
        const result = await this.db.query<WorkSchedule>(query, values);
        return result.rows[0];
    }

    async update(id: string, data: Partial<WorkSchedule>): Promise<WorkSchedule | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        const allowedFields = ['partner_id', 'shift_id', 'job_type_id', 'work_date', 'status', 'note', 'season_id'];
        for (const key of allowedFields) {
            if (data[key as keyof WorkSchedule] !== undefined) {
                fields.push(`${key} = $${paramIndex++}`);
                // Chuyển empty string thành null cho season_id
                if (key === 'season_id' && (data[key as keyof WorkSchedule] === '' || data[key as keyof WorkSchedule] === null)) {
                    values.push(null);
                } else {
                    values.push(data[key as keyof WorkSchedule]);
                }
            }
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const query = `
            UPDATE work_schedules 
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        const result = await this.db.query<WorkSchedule>(query, values);
        return result.rows[0] || null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.query(
            'DELETE FROM work_schedules WHERE id = $1',
            [id]
        );
        return result.rowCount > 0;
    }
}
