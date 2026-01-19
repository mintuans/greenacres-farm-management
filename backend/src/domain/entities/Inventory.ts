/**
 * Inventory Domain Entity
 */
export interface Inventory {
    id: string;
    inventory_code: string;
    inventory_name: string;
    category_id?: string;
    category_name?: string;
    unit_of_measure?: string;
    stock_quantity: number;
    min_stock_level: number;
    last_import_price: number;
    import_date?: string;
    thumbnail_id?: string;
    note?: string;
    created_at?: string;
}

export interface CreateInventoryDTO {
    inventory_code: string;
    inventory_name: string;
    category_id?: string;
    unit_of_measure?: string;
    stock_quantity?: number;
    min_stock_level?: number;
    last_import_price?: number;
    import_date?: string;
    thumbnail_id?: string;
    note?: string;
}

export interface UpdateInventoryDTO {
    inventory_name?: string;
    category_id?: string;
    unit_of_measure?: string;
    stock_quantity?: number;
    min_stock_level?: number;
    last_import_price?: number;
    import_date?: string;
    thumbnail_id?: string;
    note?: string;
}
