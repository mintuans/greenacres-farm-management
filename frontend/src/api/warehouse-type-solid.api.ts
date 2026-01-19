/**
 * SOLID API - Clean Architecture
 * 
 * This file uses the new SOLID architecture backend endpoints.
 * Endpoints: /api/solid/warehouse-types
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

export interface WarehouseType {
    id: string;
    warehouse_code: string;
    warehouse_name: string;
    description: string;
    created_at?: string;
}

export const getWarehouseTypes = async (): Promise<WarehouseType[]> => {
    const response = await axios.get(`${API_URL}/solid/warehouse-types`);
    return response.data.data;
};

export const createWarehouseType = async (data: Omit<WarehouseType, 'id'>): Promise<WarehouseType> => {
    const response = await axios.post(`${API_URL}/solid/warehouse-types`, data);
    return response.data.data;
};

export const updateWarehouseType = async (id: string, data: Partial<WarehouseType>): Promise<WarehouseType> => {
    const response = await axios.put(`${API_URL}/solid/warehouse-types/${id}`, data);
    return response.data.data;
};

export const deleteWarehouseType = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/solid/warehouse-types/${id}`);
};
