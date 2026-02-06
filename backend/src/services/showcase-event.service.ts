import pool from '../config/database';

export interface Guest {
    id: string;
    full_name: string;
    default_title?: string;
    avatar_id?: string;
    phone?: string;
    email?: string;
    user_id?: string;
    created_at: Date;
}

export interface ShowcaseEvent {
    id: string;
    title: string;
    description?: string;
    banner_id?: string;
    event_date: Date;
    location?: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ENDED';
    gallery_ids?: string[];
    created_at: Date;
    updated_at: Date;
}

export interface ShowcaseEventParticipant {
    id: string;
    event_id: string;
    guest_id: string;
    role_at_event?: string;
    color_theme: string;
    is_vip: boolean;
    can_upload_gallery: boolean;
    sort_order: number;
    created_at: Date;
}

export interface EventGreeting {
    id: string;
    event_id: string;
    public_user_id: string;
    greeting_message: string;
    is_sent: boolean;
    created_at: Date;
    updated_at: Date;
}

// --- Guest Services ---
export const getAllGuests = async (): Promise<Guest[]> => {
    const result = await pool.query('SELECT * FROM guests ORDER BY full_name ASC');
    return result.rows;
};

export const createGuest = async (data: Partial<Guest>): Promise<Guest> => {
    const client = await pool.connect();
    try {
        const { full_name, default_title, avatar_id, phone, email, user_id } = data;
        const result = await client.query(
            'INSERT INTO guests (full_name, default_title, avatar_id, phone, email, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [
                full_name,
                default_title || null,
                avatar_id && avatar_id.trim() !== '' ? avatar_id : null,
                phone || null,
                email || null,
                user_id || null
            ]
        );
        return result.rows[0];
    } finally {
        client.release();
    }
};

export const updateGuest = async (id: string, data: Partial<Guest>): Promise<Guest | null> => {
    const client = await pool.connect();
    try {
        const { full_name, default_title, avatar_id, phone, email } = data;
        const result = await client.query(
            `UPDATE guests 
             SET full_name = $1, default_title = $2, avatar_id = $3, phone = $4, email = $5
             WHERE id = $6 RETURNING *`,
            [full_name, default_title, avatar_id, phone, email, id]
        );
        return result.rows[0] || null;
    } finally {
        client.release();
    }
};

export const deleteGuest = async (id: string): Promise<boolean> => {
    const client = await pool.connect();
    try {
        const result = await client.query('DELETE FROM guests WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    } finally {
        client.release();
    }
};

export const getGuestByUserId = async (userId: string): Promise<Guest | null> => {
    // Assuming we might add user_id to guests, or we match by email. 
    // Let's first check if guests has user_id. 
    // If not, we might need to match by email from public_users.
    const result = await pool.query('SELECT * FROM guests WHERE user_id = $1', [userId]);
    return result.rows[0] || null;
};

export const isAlreadyParticipant = async (eventId: string, guestId: string): Promise<boolean> => {
    const result = await pool.query(
        'SELECT 1 FROM showcase_event_participants WHERE event_id = $1 AND guest_id = $2',
        [eventId, guestId]
    );
    return (result.rowCount ?? 0) > 0;
};

// --- Event Services ---
export const getAllShowcaseEvents = async (status?: string): Promise<ShowcaseEvent[]> => {
    let query = 'SELECT * FROM showcase_events';
    const values: any[] = [];

    if (status) {
        query += ' WHERE status = $1';
        values.push(status);
    }

    query += ' ORDER BY event_date DESC';
    const result = await pool.query(query, values);
    return result.rows;
};

export const getShowcaseEventById = async (id: string): Promise<ShowcaseEvent | null> => {
    const result = await pool.query('SELECT * FROM showcase_events WHERE id = $1', [id]);
    return result.rows[0] || null;
};

export const createShowcaseEvent = async (data: Partial<ShowcaseEvent>): Promise<ShowcaseEvent> => {
    const client = await pool.connect();
    try {
        const { title, description, banner_id, event_date, location, status, gallery_ids } = data;
        const result = await client.query(
            `INSERT INTO showcase_events (title, description, banner_id, event_date, location, status, gallery_ids) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title, description, banner_id, event_date, location, status || 'DRAFT', JSON.stringify(gallery_ids || [])]
        );
        return result.rows[0];
    } finally {
        client.release();
    }
};

export const updateShowcaseEvent = async (id: string, data: Partial<ShowcaseEvent>): Promise<ShowcaseEvent | null> => {
    const client = await pool.connect();
    try {
        const { title, description, banner_id, event_date, location, status, gallery_ids } = data;
        const result = await client.query(
            `UPDATE showcase_events 
             SET title = $1, description = $2, banner_id = $3, event_date = $4, location = $5, status = $6, gallery_ids = $7, updated_at = CURRENT_TIMESTAMP
             WHERE id = $8 RETURNING *`,
            [title, description, banner_id, event_date, location, status, JSON.stringify(gallery_ids || []), id]
        );
        return result.rows[0] || null;
    } finally {
        client.release();
    }
};

export const deleteShowcaseEvent = async (id: string): Promise<boolean> => {
    const client = await pool.connect();
    try {
        const result = await client.query('DELETE FROM showcase_events WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    } finally {
        client.release();
    }
};

// --- Participant Services ---
export const getParticipantsByEventId = async (eventId: string) => {
    const query = `
        SELECT sep.*, g.full_name, g.avatar_id, g.default_title
        FROM showcase_event_participants sep
        JOIN guests g ON sep.guest_id = g.id
        WHERE sep.event_id = $1
        ORDER BY sep.sort_order ASC, sep.created_at ASC
    `;
    const result = await pool.query(query, [eventId]);
    return result.rows;
};

export const addParticipantToEvent = async (data: Partial<ShowcaseEventParticipant>): Promise<ShowcaseEventParticipant> => {
    const client = await pool.connect();
    try {
        const { event_id, guest_id, role_at_event, color_theme, is_vip, can_upload_gallery, sort_order } = data;
        const result = await client.query(
            `INSERT INTO showcase_event_participants (event_id, guest_id, role_at_event, color_theme, is_vip, can_upload_gallery, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [event_id, guest_id, role_at_event, color_theme || 'green', is_vip || false, can_upload_gallery || false, sort_order || 0]
        );
        return result.rows[0];
    } finally {
        client.release();
    }
};

export const removeParticipantFromEvent = async (id: string): Promise<boolean> => {
    const client = await pool.connect();
    try {
        const result = await client.query('DELETE FROM showcase_event_participants WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    } finally {
        client.release();
    }
};

// --- Greeting Services ---
export const getGreetingsByEventId = async (eventId: string) => {
    const query = `
        SELECT seg.*, pu.full_name, pu.email, pu.avatar_id
        FROM showcase_event_greetings seg
        JOIN public_users pu ON seg.public_user_id = pu.id
        WHERE seg.event_id = $1
        ORDER BY seg.created_at DESC
    `;
    const result = await pool.query(query, [eventId]);
    return result.rows;
};

export const getGreetingById = async (id: string): Promise<EventGreeting | null> => {
    const result = await pool.query('SELECT * FROM showcase_event_greetings WHERE id = $1', [id]);
    return result.rows[0] || null;
};

export const getGreetingForUser = async (eventId: string, userId: string): Promise<EventGreeting | null> => {
    const result = await pool.query(
        'SELECT * FROM showcase_event_greetings WHERE event_id = $1 AND public_user_id = $2',
        [eventId, userId]
    );
    return result.rows[0] || null;
};

export const createOrUpdateGreeting = async (data: Partial<EventGreeting>): Promise<EventGreeting> => {
    const client = await pool.connect();
    try {
        const { event_id, public_user_id, greeting_message } = data;
        const result = await client.query(
            `INSERT INTO showcase_event_greetings (event_id, public_user_id, greeting_message)
             VALUES ($1, $2, $3)
             ON CONFLICT (event_id, public_user_id) 
             DO UPDATE SET greeting_message = EXCLUDED.greeting_message, updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [event_id, public_user_id, greeting_message]
        );
        return result.rows[0];
    } finally {
        client.release();
    }
};

export const markGreetingAsSent = async (id: string): Promise<boolean> => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'UPDATE showcase_event_greetings SET is_sent = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    } finally {
        client.release();
    }
};

export const deleteGreeting = async (id: string): Promise<boolean> => {
    const client = await pool.connect();
    try {
        const result = await client.query('DELETE FROM showcase_event_greetings WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    } finally {
        client.release();
    }
};

export const updateParticipantPermission = async (id: string, canUpload: boolean): Promise<boolean> => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'UPDATE showcase_event_participants SET can_upload_gallery = $1 WHERE id = $2',
            [canUpload, id]
        );
        return (result.rowCount ?? 0) > 0;
    } finally {
        client.release();
    }
};

export const addGalleryImageToEvent = async (eventId: string, mediaId: string): Promise<boolean> => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `UPDATE showcase_events 
             SET gallery_ids = COALESCE(gallery_ids, '[]'::jsonb) || jsonb_build_array($1::text)
             WHERE id = $2`,
            [mediaId, eventId]
        );
        return (result.rowCount ?? 0) > 0;
    } finally {
        client.release();
    }
};

export const checkUserUploadPermission = async (eventId: string, userId: string): Promise<boolean> => {
    const query = `
        SELECT sep.can_upload_gallery
        FROM showcase_event_participants sep
        JOIN guests g ON sep.guest_id = g.id
        WHERE sep.event_id = $1 AND g.user_id = $2
    `;
    const result = await pool.query(query, [eventId, userId]);
    return result.rows[0]?.can_upload_gallery === true;
};
