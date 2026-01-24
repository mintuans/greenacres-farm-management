import pool from '../config/database';

export interface Partner {
    id: string;
    partner_code: string;
    partner_name: string;
    type: 'SUPPLIER' | 'BUYER' | 'WORKER' | 'FAMILY';
    phone?: string;
    address?: string;
    current_balance: number;
    created_at: Date;
}

export interface CreatePartnerInput {
    partner_code: string;
    partner_name: string;
    type: 'SUPPLIER' | 'BUYER' | 'WORKER' | 'FAMILY';
    phone?: string;
    address?: string;
}

export interface UpdatePartnerInput {
    partner_name?: string;
    type?: 'SUPPLIER' | 'BUYER' | 'WORKER' | 'FAMILY';
    phone?: string;
    address?: string;
}

// Tạo đối tác mới
export const createPartner = async (data: CreatePartnerInput): Promise<Partner> => {
    const query = `
        INSERT INTO partners (partner_code, partner_name, type, phone, address)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const values = [data.partner_code, data.partner_name, data.type, data.phone, data.address];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Lấy danh sách đối tác
export const getPartners = async (type?: string): Promise<Partner[]> => {
    let query = 'SELECT id, partner_code, partner_name, type, phone, address, current_balance, created_at FROM partners';
    const values: any[] = [];

    if (type) {
        query += ' WHERE type = $1';
        values.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
};

// Lấy đối tác theo ID
export const getPartnerById = async (id: string): Promise<Partner | null> => {
    const query = 'SELECT id, partner_code, partner_name, type, phone, address, current_balance, created_at FROM partners WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

// Cập nhật đối tác
export const updatePartner = async (id: string, data: UpdatePartnerInput): Promise<Partner | null> => {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.partner_name !== undefined) {
        fields.push(`partner_name = $${paramIndex++}`);
        values.push(data.partner_name);
    }
    if (data.type !== undefined) {
        fields.push(`type = $${paramIndex++}`);
        values.push(data.type);
    }
    if (data.phone !== undefined) {
        fields.push(`phone = $${paramIndex++}`);
        values.push(data.phone);
    }
    if (data.address !== undefined) {
        fields.push(`address = $${paramIndex++}`);
        values.push(data.address);
    }

    if (fields.length === 0) {
        return getPartnerById(id);
    }

    values.push(id);
    const query = `
        UPDATE partners 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

// Xóa đối tác
export const deletePartner = async (id: string): Promise<boolean> => {
    const query = 'DELETE FROM partners WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
};

// Lấy số dư hiện tại
export const getPartnerBalance = async (id: string): Promise<number> => {
    const query = 'SELECT current_balance FROM partners WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0]?.current_balance || 0;
};

// Tự động sinh mã partner tiếp theo
export const getNextPartnerCode = async (type: string): Promise<string> => {
    let prefix = '';
    switch (type) {
        case 'WORKER': prefix = 'NV'; break;
        case 'SUPPLIER': prefix = 'NCC'; break;
        case 'BUYER': prefix = 'NM'; break;
        case 'FAMILY': prefix = 'GD'; break;
        default: prefix = 'PN';
    }

    const query = `
        SELECT partner_code 
        FROM partners 
        WHERE type = $1 AND partner_code LIKE $2
        ORDER BY partner_code DESC 
        LIMIT 1
    `;
    const result = await pool.query(query, [type, `${prefix}%`]);

    if (result.rows.length === 0) {
        return `${prefix}001`;
    }

    const lastCode = result.rows[0].partner_code;
    const numberPart = lastCode.substring(prefix.length);
    const nextNumber = parseInt(numberPart) + 1;
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
};
