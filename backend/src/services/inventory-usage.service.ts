import pool from '../config/database';

export interface InventoryUsage {
    id: string;
    inventory_id: string;
    season_id: string;
    unit_id?: string;
    quantity: number;
    purpose?: string;
    usage_date: Date;
    inventory_name?: string;
    unit_of_measure?: string;
}

export const logUsage = async (data: any): Promise<InventoryUsage> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const query = `
            INSERT INTO inventory_usage (inventory_id, season_id, unit_id, quantity, purpose, usage_date)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            data.inventory_id,
            data.season_id,
            data.unit_id || null,
            data.quantity,
            data.purpose,
            data.usage_date || new Date()
        ];
        const result = await client.query(query, values);

        // Cập nhật tồn kho (giảm đi)
        await client.query(
            'UPDATE inventory SET stock_quantity = stock_quantity - $1 WHERE id = $2',
            [data.quantity, data.inventory_id]
        );

        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const getUsageBySeason = async (seasonId: string): Promise<any[]> => {
    const query = `
        SELECT 
            iu.*, 
            i.inventory_name, 
            i.unit_of_measure,
            c.category_name
        FROM inventory_usage iu
        JOIN inventory i ON iu.inventory_id = i.id
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE iu.season_id = $1
        ORDER BY iu.usage_date DESC
    `;
    const result = await pool.query(query, [seasonId]);
    return result.rows;
};

export const getMedicineUsageStats = async (seasonId: string): Promise<any[]> => {
    // Lấy thống kê sử dụng thuốc (loại trừ phân bón hoặc các thứ khác nếu cần)
    // Giả sử thuốc có category là 'THUOC' hoặc tương tự
    const query = `
        SELECT 
            i.inventory_name,
            SUM(iu.quantity) as total_quantity,
            i.unit_of_measure
        FROM inventory_usage iu
        JOIN inventory i ON iu.inventory_id = i.id
        JOIN categories c ON i.category_id = c.id
        WHERE iu.season_id = $1 AND (c.category_name ILIKE '%thuốc%' OR c.category_code ILIKE '%THUOC%')
        GROUP BY i.inventory_name, i.unit_of_measure
    `;
    const result = await pool.query(query, [seasonId]);
    return result.rows;
};
