import { Pool } from 'pg';

// Kết nối PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'quan_ly_nong_trai',
    password: process.env.DB_PASSWORD || '123',
    port: Number(process.env.DB_PORT) || 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    // Cấu hình Pool để chịu tải khi chuyển màn hình (burst)
    max: 20, // Tăng lên 20 kết nối
    idleTimeoutMillis: 10000, // Giữ kết nối rảnh trong 10 giây để tái sử dụng nhanh
    connectionTimeoutMillis: 10000, // Chờ lâu hơn một chút thay vì báo lỗi ngay (10 giây)
    query_timeout: 10000, // Ngắt truy vấn treo sau 10 giây
});

// Giám sát trạng thái pool và tự động reset nếu nghẽn quá lâu
let congestionCount = 0;
setInterval(() => {
    const waiting = pool.waitingCount;
    const active = pool.totalCount - pool.idleCount;
    if (waiting > 0) {
        congestionCount++;
        console.warn(`⚠️ [Database] Congestion: Waiting=${waiting}, Active=${active}`);

        // Nếu nghẽn liên tục trong 30 giây, có thể do lỗi hệ thống, cần log chi tiết
        if (congestionCount > 6) {
            console.error('🔥 [Database] Severe congestion detected. Check for hanging triggers!');
        }
    } else {
        congestionCount = 0;
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
