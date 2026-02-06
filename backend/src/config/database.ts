import { Pool } from 'pg';

// Kết nối PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'quan_ly_nong_trai',
    password: process.env.DB_PASSWORD || '123',
    port: Number(process.env.DB_PORT) || 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    // Cấu hình Pool nghiêm ngặt để tránh leak
    max: 15, // Giảm bớt số lượng kết nối tối đa để DB không bị quá tải
    idleTimeoutMillis: 5000, // Giải phóng kết nối rảnh sau 5 giây (thay vì 30s)
    connectionTimeoutMillis: 5000, // Chờ tối đa 5 giây để lấy kết nối
    query_timeout: 10000, // Tự động ngắt bất kỳ truy vấn nào chạy quá 10 giây
});

// Giám sát trạng thái pool
setInterval(() => {
    if (pool.waitingCount > 0) {
        console.warn(`⚠️ [Database] Pool is full! Waiting: ${pool.waitingCount}, Active: ${pool.totalCount - pool.idleCount}`);
    }
}, 5000);

// Test connection
pool.on('connect', () => {
    // console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL Pool Error:', err.message);
});

export default pool;
