import pool from './config/database';

const testConnection = async () => {
    try {
        console.log('🔄 Testing database connection...');

        const result = await pool.query('SELECT NOW()');
        console.log('✅ Database connected successfully!');
        console.log('📅 Server time:', result.rows[0].now);

        // Test if tables exist
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        console.log('\n📊 Tables in database:');
        if (tables.rows.length === 0) {
            console.log('⚠️  No tables found! Please run database schema first.');
            console.log('   Run: psql -U postgres -d greenacres_db -f document/database_showcase.sql');
        } else {
            tables.rows.forEach(row => {
                console.log(`   - ${row.table_name}`);
            });
        }

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Database connection failed!');
        console.error('Error:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Make sure PostgreSQL is running');
        console.error('   2. Check DATABASE_URL in .env file');
        console.error('   3. Create database: createdb -U postgres greenacres_db');
        process.exit(1);
    }
};

testConnection();
