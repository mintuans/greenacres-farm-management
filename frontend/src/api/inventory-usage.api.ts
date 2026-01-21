import api from '../services/api';


export interface InventoryUsage {
    id?: string;
    inventory_id: string;
    season_id: string;
    unit_id?: string;
    quantity: number;
    purpose?: string;
    usage_date?: string;
    inventory_name?: string;
    unit_of_measure?: string;
    category_name?: string;
}

export const logUsage = async (data: InventoryUsage): Promise<any> => {
    const response = await api.post('/management/inventory-usage/log', data);
    return response.data.data;
};

export const getUsageBySeason = async (seasonId: string): Promise<InventoryUsage[]> => {
    const response = await api.get(`/management/inventory-usage/season/${seasonId}`);
    return response.data.data;
};

export const getMedicineUsageStats = async (seasonId: string): Promise<any[]> => {
    const response = await api.get(`/management/inventory-usage/season/${seasonId}/medicine-stats`);
    return response.data.data;
};
