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
    thumbnail_id?: string; // Sử dụng ID ảnh từ media_files
    note?: string;
    created_at?: string;
}

// Lấy danh sách vật tư (kèm tên danh mục)
export const getInventory = async (categoryId?: string): Promise<InventoryItem[]> => {
    let query = `
        SELECT i.*, c.category_name 
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

// Tạo vật tư mới
export const createInventoryItem = async (data: any): Promise<InventoryItem> => {
    const query = `
        INSERT INTO inventory (
            inventory_code, inventory_name, category_id, 
            unit_of_measure, stock_quantity, min_stock_level, 
            last_import_price, thumbnail_id, note
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
        'stock_quantity', 'min_stock_level', 'last_import_price', 'thumbnail_id', 'note'
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
