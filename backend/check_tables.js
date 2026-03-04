const { Client } = require('pg');
require('dotenv').config();

async function checkTables() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        console.log('Tables in database:');
        res.rows.forEach(row => console.log(`- ${row.table_name}`));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkTables();
