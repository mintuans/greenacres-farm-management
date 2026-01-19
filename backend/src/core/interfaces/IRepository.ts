/**
 * Generic Repository Interface
 * Định nghĩa các operations cơ bản cho data access
 * Tuân thủ Interface Segregation Principle (ISP)
 */
export interface IRepository<T> {
    /**
     * Find entity by ID
     * @param id Entity ID
     * @returns Entity or null if not found
     */
    findById(id: string): Promise<T | null>;

    /**
     * Find all entities with optional filters
     * @param filters Optional filter criteria
     * @returns Array of entities
     */
    findAll(filters?: any): Promise<T[]>;

    /**
     * Create new entity
     * @param data Entity data
     * @returns Created entity
     */
    create(data: Partial<T>): Promise<T>;

    /**
     * Update existing entity
     * @param id Entity ID
     * @param data Updated data
     * @returns Updated entity or null if not found
     */
    update(id: string, data: Partial<T>): Promise<T | null>;

    /**
     * Delete entity
     * @param id Entity ID
     * @returns True if deleted, false if not found
     */
    delete(id: string): Promise<boolean>;
}
