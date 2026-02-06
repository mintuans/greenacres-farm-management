import pool from '../config/database';

export interface Transaction {
    id: string;
    partner_id?: string;
    season_id?: string;
    category_id?: string;
    amount: number;
    paid_amount: number;
    type: 'INCOME' | 'EXPENSE';
    transaction_date: Date;
    note?: string;
    is_inventory_affected: boolean;
    quantity?: number;
    unit?: string;
    unit_price?: number;
    partner_name?: string;
    category_name?: string;
    category_code?: string;
    season_name?: string;
}

export const getTransactions = async (month?: number, year?: number, seasonId?: string): Promise<Transaction[]> => {
    let query = `
        SELECT 
            t.id, t.partner_id, t.season_id, t.category_id, t.amount, t.paid_amount, 
            t.type, t.transaction_date, t.note, t.is_inventory_affected,
            t.quantity, t.unit, t.unit_price,
            p.partner_name, c.category_name, c.category_code, s.season_name
        FROM transactions t
        LEFT JOIN partners p ON t.partner_id = p.id
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN seasons s ON t.season_id = s.id
        WHERE 1=1
    `;
    const values: any[] = [];
    let paramIndex = 1;

    if (month) {
        query += ` AND EXTRACT(MONTH FROM t.transaction_date) = $${paramIndex++}`;
        values.push(month);
    }

    if (year) {
        query += ` AND EXTRACT(YEAR FROM t.transaction_date) = $${paramIndex++}`;
        values.push(year);
    }

    if (seasonId) {
        query += ` AND t.season_id = $${paramIndex++}`;
        values.push(seasonId);
    }

    query += ` ORDER BY t.transaction_date DESC`;
    const result = await pool.query(query, values);
    return result.rows;
};

export const getTransactionById = async (id: string): Promise<Transaction | null> => {
    const query = `
        SELECT 
            id, partner_id, season_id, category_id, amount, paid_amount, 
            type, transaction_date, note, is_inventory_affected,
            quantity, unit, unit_price
        FROM transactions 
        WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

export const createTransaction = async (data: any): Promise<Transaction> => {
    const client = await pool.connect();
    try {
        const query = `
            INSERT INTO transactions (
                partner_id, season_id, category_id, amount, paid_amount, 
                type, transaction_date, note, is_inventory_affected,
                quantity, unit, unit_price
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;
        const values = [
            data.partner_id || null,
            data.season_id || null,
            data.category_id || null,
            data.amount,
            data.paid_amount || 0,
            data.type,
            data.transaction_date || new Date(),
            data.note || null,
            data.is_inventory_affected || false,
            data.quantity || null,
            data.unit || null,
            data.unit_price || null
        ];
        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

export const updateTransaction = async (id: string, data: any): Promise<Transaction | null> => {
    const client = await pool.connect();
    try {
        const query = `
            UPDATE transactions
            SET 
                partner_id = $1,
                season_id = $2,
                category_id = $3,
                amount = $4,
                paid_amount = $5,
                type = $6,
                transaction_date = $7,
                note = $8,
                is_inventory_affected = $9,
                quantity = $10,
                unit = $11,
                unit_price = $12,
                updated_at = NOW()
            WHERE id = $13
            RETURNING *
        `;
        const values = [
            data.partner_id || null,
            data.season_id || null,
            data.category_id || null,
            data.amount,
            data.paid_amount || 0,
            data.type,
            data.transaction_date || new Date(),
            data.note || null,
            data.is_inventory_affected || false,
            data.quantity || null,
            data.unit || null,
            data.unit_price || null,
            id
        ];
        const result = await client.query(query, values);
        return result.rows[0] || null;
    } finally {
        client.release();
    }
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
    const query = 'DELETE FROM transactions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
};
