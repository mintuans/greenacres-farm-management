import api from '../services/api';


export interface WarehouseType {
    id: string;
    warehouse_code: string;
    warehouse_name: string;
    description: string;
    created_at?: string;
}

export const getWarehouseTypes = async (): Promise<WarehouseType[]> => {
    const response = await api.get('/management/warehouse-types');
    return response.data.data;
};

export const createWarehouseType = async (data: Omit<WarehouseType, 'id'>): Promise<WarehouseType> => {
    const response = await api.post('/management/warehouse-types', data);
    return response.data.data;
};

export const updateWarehouseType = async (id: string, data: Partial<WarehouseType>): Promise<WarehouseType> => {
    const response = await api.put(`/management/warehouse-types/${id}`, data);
    return response.data.data;
};

export const deleteWarehouseType = async (id: string): Promise<void> => {
    await api.delete(`/management/warehouse-types/${id}`);
};
