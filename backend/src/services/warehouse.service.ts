import pool from '../config/database';

export interface WarehouseItem {
    id: string;
    warehouse_type_id: string;
    item_code: string;
    sku?: string;
    item_name: string;
    quantity: number;
    unit?: string;
    price: number;
    location?: string;
    thumbnail_id?: string;
    note?: string;
    created_at?: string;
    updated_at?: string;
    warehouse_name?: string; // Joined from warehouse_types
}

export const getItems = async (typeId?: string, search?: string): Promise<WarehouseItem[]> => {
    let query = `
        SELECT wi.*, wt.warehouse_name 
        FROM warehouse_items wi
        JOIN warehouse_types wt ON wi.warehouse_type_id = wt.id
        WHERE 1=1
    `;
    const values: any[] = [];

    if (typeId) {
        values.push(typeId);
        query += ` AND wi.warehouse_type_id = $${values.length}`;
    }

    if (search) {
        values.push(`%${search}%`);
        query += ` AND (wi.item_name ILIKE $${values.length} OR wi.item_code ILIKE $${values.length} OR wi.sku ILIKE $${values.length})`;
    }

    query += ` ORDER BY wi.created_at DESC`;
    const result = await pool.query(query, values);
    return result.rows;
};

export const createItem = async (data: any): Promise<WarehouseItem> => {
    const query = `
        INSERT INTO warehouse_items (
            warehouse_type_id, item_code, sku, item_name, quantity, unit, price, location, thumbnail_id, note
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
    `;
    const values = [
        data.warehouse_type_id,
        data.item_code,
        data.sku,
        data.item_name,
        data.quantity || 0,
        data.unit,
        data.price || 0,
        data.location,
        data.thumbnail_id || null,
        data.note
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const updateItem = async (id: string, data: any): Promise<WarehouseItem | null> => {
    const fields = [
        'warehouse_type_id', 'sku', 'item_name', 'quantity', 'unit', 'price', 'location', 'thumbnail_id', 'note'
    ];
    const values: any[] = [];
    const setClauses = fields
        .map((field) => {
            if (data[field] !== undefined) {
                values.push(data[field] === '' ? null : data[field]);
                return `${field} = $${values.length}`;
            }
            return null;
        })
        .filter(Boolean);

    if (setClauses.length === 0) return null;

    values.push(id);
    const query = `
        UPDATE warehouse_items 
        SET ${setClauses.join(', ')} 
        WHERE id = $${values.length} 
        RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const deleteItem = async (id: string): Promise<boolean> => {
    const result = await pool.query(`DELETE FROM warehouse_items WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
};

export const getNextCode = async (typeId: string): Promise<string> => {
    // Get prefix from warehouse_types.warehouse_code (e.g., 'KHO-GIA-DUNG' -> 'GD')
    const typeResult = await pool.query('SELECT warehouse_code FROM warehouse_types WHERE id = $1', [typeId]);
    if (typeResult.rows.length === 0) throw new Error('Invalid warehouse type');

    const warehouseCode = typeResult.rows[0].warehouse_code;
    const parts = warehouseCode.split('-');
    const prefix = parts.length > 1 ? parts.map((p: string) => p[0]).join('') : warehouseCode.substring(0, 2).toUpperCase();

    const query = `
        SELECT item_code 
        FROM warehouse_items 
        WHERE warehouse_type_id = $1
        ORDER BY item_code DESC 
        LIMIT 1
    `;
    const result = await pool.query(query, [typeId]);

    if (result.rows.length === 0) {
        return `${prefix}-001`;
    }

    const lastCode = result.rows[0].item_code;
    const codeParts = lastCode.split('-');
    const lastNum = parseInt(codeParts[codeParts.length - 1]);
    const nextNum = (isNaN(lastNum) ? 1 : lastNum + 1).toString().padStart(3, '0');
    return `${prefix}-${nextNum}`;
};
