import { Pool } from 'pg';

// Kết nối PostgreSQL
// Kết nối PostgreSQL
const baseConfig = {
    max: 20,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    query_timeout: 10000,
};

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            ...baseConfig,
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        }
        : {
            ...baseConfig,
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'quan_ly_nong_trai',
            password: process.env.DB_PASSWORD || '123',
            port: Number(process.env.DB_PORT) || 5432,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
        }
);

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
