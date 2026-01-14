import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface WarehouseItem {
    id: string;
    warehouse_type_id: string;
    item_code: string;
    sku?: string;
    item_name: string;
    category?: string;
    quantity: number;
    unit?: string;
    price: number;
    location?: string;
    thumbnail_id?: string;
    note?: string;
    created_at?: string;
    warehouse_name?: string;
}

export const getWarehouseItems = async (typeId?: string, search?: string): Promise<WarehouseItem[]> => {
    const params: any = {};
    if (typeId) params.typeId = typeId;
    if (search) params.search = search;
    const response = await axios.get(`${API_URL}/management/warehouse-items/items`, { params });
    return response.data.data;
};

export const createWarehouseItem = async (data: any): Promise<WarehouseItem> => {
    const response = await axios.post(`${API_URL}/management/warehouse-items/items`, data);
    return response.data.data;
};

export const updateWarehouseItem = async (id: string, data: any): Promise<WarehouseItem> => {
    const response = await axios.put(`${API_URL}/management/warehouse-items/items/${id}`, data);
    return response.data.data;
};

export const deleteWarehouseItem = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/management/warehouse-items/items/${id}`);
};

export const getNextWarehouseCode = async (typeId: string): Promise<string> => {
    const response = await axios.get(`${API_URL}/management/warehouse-items/next-code`, { params: { typeId } });
    return response.data.data;
};
