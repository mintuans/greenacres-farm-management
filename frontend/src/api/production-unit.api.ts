import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ProductionUnit {
    id: string;
    unit_code: string;
    unit_name: string;
    type?: 'CROP' | 'LIVESTOCK';
    area_size?: number;
    description?: string;
}

export interface CreateProductionUnitInput {
    unit_code: string;
    unit_name: string;
    type?: 'CROP' | 'LIVESTOCK';
    area_size?: number;
    description?: string;
}

export interface UpdateProductionUnitInput {
    unit_name?: string;
    type?: 'CROP' | 'LIVESTOCK';
    area_size?: number;
    description?: string;
}

export const getProductionUnits = async (type?: string): Promise<ProductionUnit[]> => {
    const params = type ? { type } : {};
    const response = await axios.get(`${API_URL}/management/production-units`, { params });
    return response.data.data;
};

export const getProductionUnitById = async (id: string): Promise<ProductionUnit> => {
    const response = await axios.get(`${API_URL}/management/production-units/${id}`);
    return response.data.data;
};

export const createProductionUnit = async (data: CreateProductionUnitInput): Promise<ProductionUnit> => {
    const response = await axios.post(`${API_URL}/management/production-units`, data);
    return response.data.data;
};

export const updateProductionUnit = async (id: string, data: UpdateProductionUnitInput): Promise<ProductionUnit> => {
    const response = await axios.put(`${API_URL}/management/production-units/${id}`, data);
    return response.data.data;
};

export const deleteProductionUnit = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/management/production-units/${id}`);
};

export const getProductionUnitStats = async (): Promise<any> => {
    const response = await axios.get(`${API_URL}/management/production-units/stats`);
    return response.data.data;
};
