import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface WarehouseItem {
    id: string;
    item_code: string;
    item_name: string;
    category?: string;
    quantity: number;
    unit?: string;
    price: number;
    location?: string;
    thumbnail_id?: string;
    note?: string;
    created_at?: string;
}

export const getWarehouseItems = async (type: 'household' | 'electronics' | 'plants', search?: string): Promise<WarehouseItem[]> => {
    const params = search ? { search } : {};
    const response = await axios.get(`${API_URL}/management/${type}`, { params });
    return response.data.data;
};

export const createWarehouseItem = async (type: 'household' | 'electronics' | 'plants', data: any): Promise<WarehouseItem> => {
    const response = await axios.post(`${API_URL}/management/${type}`, data);
    return response.data.data;
};

export const updateWarehouseItem = async (type: 'household' | 'electronics' | 'plants', id: string, data: any): Promise<WarehouseItem> => {
    const response = await axios.put(`${API_URL}/management/${type}/${id}`, data);
    return response.data.data;
};

export const deleteWarehouseItem = async (type: 'household' | 'electronics' | 'plants', id: string): Promise<void> => {
    await axios.delete(`${API_URL}/management/${type}/${id}`);
};

export const getNextWarehouseCode = async (type: 'household' | 'electronics' | 'plants'): Promise<string> => {
    const response = await axios.get(`${API_URL}/management/${type}/next-code`);
    return response.data.data;
};

