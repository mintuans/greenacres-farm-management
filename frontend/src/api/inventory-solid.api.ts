/**
 * SOLID API - Clean Architecture
 * 
 * This file uses the new SOLID architecture backend endpoints.
 * Endpoints: /api/solid/inventory
 * 
 * Features:
 * - Clean Architecture
 * - SOLID Principles
 * - Dependency Injection
 * - Type-safe
 * - Better error handling
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    const response = await axios.get(`${API_URL}/solid/inventory`, { params });
    return response.data.data;
};

export const getInventoryStats = async (): Promise<any> => {
    const response = await axios.get(`${API_URL}/solid/inventory/stats`);
    return response.data.data;
};

export const createItem = async (data: any): Promise<InventoryItem> => {
    const response = await axios.post(`${API_URL}/solid/inventory`, data);
    return response.data.data;
};

export const updateItem = async (id: string, data: any): Promise<InventoryItem> => {
    const response = await axios.put(`${API_URL}/solid/inventory/${id}`, data);
    return response.data.data;
};

export const deleteItem = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/solid/inventory/${id}`);
};
