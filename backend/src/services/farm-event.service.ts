import pool from '../config/database';

export interface FarmEvent {
    id: string;
    title: string;
    event_type: string;
    start_time: string;
    end_time?: string;
    is_all_day: boolean;
    description?: string;
    season_id?: string;
    unit_id?: string;
    season_name?: string;
    unit_name?: string;
}

export const getFarmEvents = async (): Promise<FarmEvent[]> => {
    const query = `
        SELECT fe.*, s.season_name, pu.unit_name
        FROM farm_events fe
        LEFT JOIN seasons s ON fe.season_id = s.id
        LEFT JOIN production_units pu ON fe.unit_id = pu.id
        ORDER BY fe.start_time DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

export const getFarmEventById = async (id: string): Promise<FarmEvent | null> => {
    const query = 'SELECT * FROM farm_events WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

export const createFarmEvent = async (data: any): Promise<FarmEvent> => {
    const query = `
        INSERT INTO farm_events (title, event_type, start_time, end_time, is_all_day, description, season_id, unit_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;
    const values = [
        data.title, data.event_type, data.start_time, data.end_time || null,
        data.is_all_day ?? true, data.description, data.season_id || null, data.unit_id || null
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const updateFarmEvent = async (id: string, data: any): Promise<FarmEvent | null> => {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = ['title', 'event_type', 'start_time', 'end_time', 'is_all_day', 'description', 'season_id', 'unit_id'];
    for (const key of allowedFields) {
        if (data[key] !== undefined) {
            fields.push(`${key} = $${paramIndex++}`);
            values.push(data[key]);
        }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
        UPDATE farm_events 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

export const deleteFarmEvent = async (id: string): Promise<boolean> => {
    const query = 'DELETE FROM farm_events WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
};
