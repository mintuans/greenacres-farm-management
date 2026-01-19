import { Pool } from 'pg';
import { injectable } from 'inversify';
import { IDatabase, QueryResult } from '../../core/interfaces/IDatabase';

/**
 * PostgreSQL Database Implementation
 * Implements IDatabase interface
 * Tuân thủ Dependency Inversion Principle
 */
@injectable()
export class PostgresDatabase implements IDatabase {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'quan_ly_nong_trai',
            password: process.env.DB_PASSWORD || '123',
            port: Number(process.env.DB_PORT) || 5432,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
        });

        this.pool.on('connect', () => {
            console.log('✅ PostgresDatabase: Connected to database');
        });

        this.pool.on('error', (err) => {
            console.error('❌ PostgresDatabase: Connection error:', err);
        });
    }

    /**
     * Execute a SQL query
     */
    async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
        try {
            const result = await this.pool.query(sql, params);
            return {
                rows: result.rows,
                rowCount: result.rowCount || 0
            };
        } catch (error) {
            console.error('❌ Query error:', error);
            throw error;
        }
    }

    /**
     * Execute queries within a transaction
     */
    async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Transaction error:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Close all database connections
     */
    async close(): Promise<void> {
        await this.pool.end();
        console.log('✅ PostgresDatabase: All connections closed');
    }
}
