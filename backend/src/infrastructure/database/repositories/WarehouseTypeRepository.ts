import { injectable, inject } from 'inversify';
import { IDatabase } from '../../../core/interfaces/IDatabase';
import { IWarehouseTypeRepository } from '../../../domain/repositories/IWarehouseTypeRepository';
import { WarehouseType } from '../../../domain/entities/WarehouseType';
import { TYPES } from '../../../core/types';

@injectable()
export class WarehouseTypeRepository implements IWarehouseTypeRepository {
    constructor(@inject(TYPES.IDatabase) private db: IDatabase) {}

    async findById(id: string): Promise<WarehouseType | null> {
        const result = await this.db.query<WarehouseType>(
            'SELECT * FROM warehouse_types WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async findAll(): Promise<WarehouseType[]> {
        const result = await this.db.query<WarehouseType>(
            'SELECT * FROM warehouse_types ORDER BY type_name ASC'
        );
        return result.rows;
    }

    async create(data: Partial<WarehouseType>): Promise<WarehouseType> {
        const query = 'INSERT INTO warehouse_types (type_name, description) VALUES ($1, $2) RETURNING *';
        const values = [data.type_name, data.description];
        const result = await this.db.query<WarehouseType>(query, values);
        return result.rows[0];
    }

    async update(id: string, data: Partial<WarehouseType>): Promise<WarehouseType | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.type_name !== undefined) {
            fields.push(`type_name = $${paramIndex++}`);
            values.push(data.type_name);
        }
        if (data.description !== undefined) {
            fields.push(`description = $${paramIndex++}`);
            values.push(data.description);
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const query = `UPDATE warehouse_types SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await this.db.query<WarehouseType>(query, values);
        return result.rows[0] || null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.query('DELETE FROM warehouse_types WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}
