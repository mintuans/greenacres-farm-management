import api from '../services/api';


export interface InventoryItem {
    id: string;
    inventory_code: string;
    inventory_name: string;
    category_id?: string;
    category_name?: string;
    unit_of_measure?: string;
    stock_quantity: number;
    min_stock_level: number;
    last_import_price: number;
    import_date?: string; // Ngày nhập
    thumbnail_id?: string;
    note?: string;
}

export const getInventory = async (categoryId?: string): Promise<InventoryItem[]> => {
    const params = categoryId ? { category_id: categoryId } : {};
    const response = await api.get('/management/inventory', { params });
    return response.data.data;
};

export const getInventoryStats = async (): Promise<any> => {
    const response = await api.get('/management/inventory/stats');
    return response.data.data;
};

export const createItem = async (data: any): Promise<InventoryItem> => {
    const response = await api.post('/management/inventory', data);
    return response.data.data;
};

export const updateItem = async (id: string, data: any): Promise<InventoryItem> => {
    const response = await api.put(`/management/inventory/${id}`, data);
    return response.data.data;
};

export const deleteItem = async (id: string): Promise<void> => {
    await api.delete(`/management/inventory/${id}`);
};

