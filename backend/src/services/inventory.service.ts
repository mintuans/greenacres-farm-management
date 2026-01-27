import pool from '../config/database';

export interface InventoryItem {
    id: string;
    inventory_code: string;
    inventory_name: string;
    category_id?: string;
    category_name?: string;
    unit_of_measure?: string;
    stock_quantity: number;
    min_stock_level: number;
    last_import_price: number;
    import_date?: string; // Ngày nhập
    thumbnail_id?: string; // Sử dụng ID ảnh từ media_files
    note?: string;
    created_at?: string;
}

// Lấy danh sách vật tư (kèm tên danh mục)
export const getInventory = async (categoryId?: string): Promise<InventoryItem[]> => {
    let query = `
        SELECT 
            i.id, i.inventory_code, i.inventory_name, i.category_id, 
            i.unit_of_measure, i.stock_quantity, i.min_stock_level, 
            i.last_import_price, i.import_date, i.thumbnail_id, i.note, i.created_at,
            c.category_name 
        FROM inventory i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE 1=1
    `;
    const values: any[] = [];

    if (categoryId) {
        query += ` AND i.category_id = $1`;
        values.push(categoryId);
    }

    query += ` ORDER BY i.inventory_name ASC`;
    const result = await pool.query(query, values);
    return result.rows;
};

// Lấy chi tiết vật tư
export const getInventoryItemById = async (id: string): Promise<InventoryItem | null> => {
    const query = `
        SELECT 
            id, inventory_code, inventory_name, category_id, 
            unit_of_measure, stock_quantity, min_stock_level, 
            last_import_price, import_date, thumbnail_id, note, created_at
        FROM inventory 
        WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

// Tạo vật tư mới
export const createInventoryItem = async (data: any): Promise<InventoryItem> => {
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
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Cập nhật vật tư
export const updateInventoryItem = async (id: string, data: any): Promise<InventoryItem | null> => {
    const fields = [
        'inventory_name', 'category_id', 'unit_of_measure',
        'stock_quantity', 'min_stock_level', 'last_import_price', 'import_date', 'thumbnail_id', 'note'
    ];
    const values: any[] = [];
    const setClauses = fields
        .map((field) => {
            if (data[field] !== undefined) {
                let value = data[field];
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
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Xóa vật tư
export const deleteInventoryItem = async (id: string): Promise<boolean> => {
    const result = await pool.query('DELETE FROM inventory WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
};

// Lấy thống kê kho
export const getInventoryStats = async (): Promise<any> => {
    const query = `
        SELECT 
            COUNT(*) as total_items,
            SUM(CASE WHEN stock_quantity <= min_stock_level THEN 1 ELSE 0 END) as low_stock_items,
            SUM(stock_quantity * last_import_price) as total_value
        FROM inventory
    `;
    const result = await pool.query(query);
    return result.rows[0];
};

// Cập nhật số lượng tồn kho
export const updateStockQuantity = async (id: string, change: number): Promise<void> => {
    await pool.query(
        'UPDATE inventory SET stock_quantity = stock_quantity + $1 WHERE id = $2',
        [change, id]
    );
};

// Nhập hàng loạt (Bulk Import)
export const bulkCreateInventoryItems = async (items: any[]): Promise<any> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const results = [];
        for (const item of items) {
            const query = `
                INSERT INTO inventory (
                    inventory_code, inventory_name, category_id, 
                    unit_of_measure, stock_quantity, min_stock_level, 
                    last_import_price, import_date, thumbnail_id, note
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (inventory_code) DO UPDATE SET
                    inventory_name = EXCLUDED.inventory_name,
                    category_id = EXCLUDED.category_id,
                    unit_of_measure = EXCLUDED.unit_of_measure,
                    stock_quantity = inventory.stock_quantity + EXCLUDED.stock_quantity,
                    min_stock_level = EXCLUDED.min_stock_level,
                    last_import_price = EXCLUDED.last_import_price,
                    import_date = EXCLUDED.import_date,
                    note = EXCLUDED.note
                RETURNING *
            `;
            const values = [
                item.inventory_code,
                item.inventory_name,
                item.category_id && item.category_id.trim() !== '' ? item.category_id : null,
                item.unit_of_measure,
                item.stock_quantity || 0,
                item.min_stock_level || 0,
                item.last_import_price || 0,
                item.import_date || new Date().toISOString(),
                item.thumbnail_id || null,
                item.note
            ];
            const res = await client.query(query, values);
            results.push(res.rows[0]);
        }
        await client.query('COMMIT');
        return results;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};
