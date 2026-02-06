import { Pool } from 'pg';

// Kết nối PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'quan_ly_nong_trai',
    password: process.env.DB_PASSWORD || '123',
    port: Number(process.env.DB_PORT) || 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    // Cấu hình Pool để tránh leak và nghẽn
    max: 20, // Số lượng kết nối tối đa trong pool
    idleTimeoutMillis: 30000, // Đóng các kết nối rảnh sau 30 giây
    connectionTimeoutMillis: 2000, // Trả về lỗi nếu không thể kết nối sau 2 giây
});

// Test connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err);
});

export default pool;
