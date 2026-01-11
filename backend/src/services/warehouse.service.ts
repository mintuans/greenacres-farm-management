import pool from '../config/database';

export interface WarehouseItem {
    id: string;
    item_code: string;
    item_name: string;
    category?: string;
    quantity: number;
    unit?: string;
    price: number;
    location?: string;
    thumbnail_id?: string;
    note?: string;
    created_at?: string;
}

const getTableName = (type: string) => {
    switch (type) {
        case 'household': return 'warehouse_household';
        case 'electronics': return 'warehouse_electronics';
        case 'plants': return 'warehouse_plants';
        default: throw new Error('Invalid warehouse type');
    }
};

export const getItems = async (type: string, search?: string): Promise<WarehouseItem[]> => {
    const tableName = getTableName(type);
    let query = `SELECT * FROM ${tableName} WHERE 1=1`;
    const values: any[] = [];

    if (search) {
        query += ` AND (item_name ILIKE $1 OR item_code ILIKE $1)`;
        values.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC`;
    const result = await pool.query(query, values);
    return result.rows;
};

export const createItem = async (type: string, data: any): Promise<WarehouseItem> => {
    const tableName = getTableName(type);
    const query = `
        INSERT INTO ${tableName} (
            item_code, item_name, category, quantity, unit, price, location, thumbnail_id, note
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `;
    const values = [
        data.item_code,
        data.item_name,
        data.category,
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

export const updateItem = async (type: string, id: string, data: any): Promise<WarehouseItem | null> => {
    const tableName = getTableName(type);
    const fields = [
        'item_name', 'category', 'quantity', 'unit', 'price', 'location', 'thumbnail_id', 'note'
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
        UPDATE ${tableName} 
        SET ${setClauses.join(', ')} 
        WHERE id = $${values.length} 
        RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const deleteItem = async (type: string, id: string): Promise<boolean> => {
    const tableName = getTableName(type);
    const result = await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
};

export const getNextCode = async (type: string): Promise<string> => {
    const tableName = getTableName(type);
    let prefix = 'ITEM';
    switch (type) {
        case 'household': prefix = 'GD'; break;
        case 'electronics': prefix = 'DT'; break;
        case 'plants': prefix = 'HK'; break;
    }

    const query = `
        SELECT item_code 
        FROM ${tableName} 
        WHERE item_code LIKE $1 
        ORDER BY item_code DESC 
        LIMIT 1
    `;
    const result = await pool.query(query, [`${prefix}-%`]);

    if (result.rows.length === 0) {
        return `${prefix}-001`;
    }

    const lastCode = result.rows[0].item_code;
    const lastNum = parseInt(lastCode.split('-')[1]);
    const nextNum = (lastNum + 1).toString().padStart(3, '0');
    return `${prefix}-${nextNum}`;
};

