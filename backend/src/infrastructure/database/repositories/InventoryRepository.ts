import { injectable, inject } from 'inversify';
import { IDatabase } from '../../../core/interfaces/IDatabase';
import { IInventoryRepository } from '../../../domain/repositories/IInventoryRepository';
import { Inventory } from '../../../domain/entities/Inventory';
import { TYPES } from '../../../core/types';

@injectable()
export class InventoryRepository implements IInventoryRepository {
    constructor(@inject(TYPES.IDatabase) private db: IDatabase) {}

    async findById(id: string): Promise<Inventory | null> {
        const result = await this.db.query<Inventory>(
            'SELECT * FROM inventory WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async findAll(): Promise<Inventory[]> {
        const query = `
            SELECT i.*, c.category_name 
            FROM inventory i
            LEFT JOIN categories c ON i.category_id = c.id
            ORDER BY i.inventory_name ASC
        `;
        const result = await this.db.query<Inventory>(query);
        return result.rows;
    }

    async findByCategory(categoryId: string): Promise<Inventory[]> {
        const query = `
            SELECT i.*, c.category_name 
            FROM inventory i
            LEFT JOIN categories c ON i.category_id = c.id
            WHERE i.category_id = $1
            ORDER BY i.inventory_name ASC
        `;
        const result = await this.db.query<Inventory>(query, [categoryId]);
        return result.rows;
    }

    async getStats(): Promise<any> {
        const query = `
            SELECT 
                COUNT(*) as total_items,
                SUM(CASE WHEN stock_quantity <= min_stock_level THEN 1 ELSE 0 END) as low_stock_items,
                SUM(stock_quantity * last_import_price) as total_value
            FROM inventory
        `;
        const result = await this.db.query(query);
        return result.rows[0];
    }

    async updateStockQuantity(id: string, change: number): Promise<void> {
        await this.db.query(
            'UPDATE inventory SET stock_quantity = stock_quantity + $1 WHERE id = $2',
            [change, id]
        );
    }

    async create(data: Partial<Inventory>): Promise<Inventory> {
        const query = `
            INSERT INTO inventory (
                inventory_code, inventory_name, category_id, 
                unit_of_measure, stock_quantity, min_stock_level, 
                last_import_price, import_date, thumbnail_id, note
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const values = [
            data.inventory_code,
            data.inventory_name,
            data.category_id && data.category_id.trim() !== '' ? data.category_id : null,
            data.unit_of_measure,
            data.stock_quantity || 0,
            data.min_stock_level || 0,
            data.last_import_price || 0,
            data.import_date || new Date().toISOString(),
            data.thumbnail_id || null,
            data.note
        ];
        const result = await this.db.query<Inventory>(query, values);
        return result.rows[0];
    }

    async update(id: string, data: Partial<Inventory>): Promise<Inventory | null> {
        const fields = [
            'inventory_name', 'category_id', 'unit_of_measure',
            'stock_quantity', 'min_stock_level', 'last_import_price', 'import_date', 'thumbnail_id', 'note'
        ];
        const values: any[] = [];
        const setClauses = fields
            .map((field) => {
                if (data[field as keyof Inventory] !== undefined) {
                    let value = data[field as keyof Inventory];
                    if (field === 'category_id' && typeof value === 'string' && value.trim() === '') {
                        value = null;
                    }
                    if (field === 'thumbnail_id' && typeof value === 'string' && value.trim() === '') {
                        value = null;
                    }
                    values.push(value);
                    return `${field} = $${values.length}`;
                }
                return null;
            })
            .filter(Boolean);

        if (setClauses.length === 0) return null;

        values.push(id);
        const query = `
            UPDATE inventory 
            SET ${setClauses.join(', ')} 
            WHERE id = $${values.length} 
            RETURNING *
        `;
        const result = await this.db.query<Inventory>(query, values);
        return result.rows[0];
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.query('DELETE FROM inventory WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}
