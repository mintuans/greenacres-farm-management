/**
 * Database Query Result Interface
 */
export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
}

/**
 * Database Interface - Abstraction cho database operations
 * Tuân thủ Dependency Inversion Principle (DIP)
 */
export interface IDatabase {
    /**
     * Execute a SQL query
     * @param sql SQL query string
     * @param params Query parameters
     * @returns Query result with rows and rowCount
     */
    query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;

    /**
     * Execute multiple queries in a transaction
     * @param callback Function that executes queries within transaction
     * @returns Result from the callback
     */
    transaction<T>(callback: (client: any) => Promise<T>): Promise<T>;
}
