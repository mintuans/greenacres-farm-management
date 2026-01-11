import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Transaction {
    id: string;
    partner_id?: string;
    season_id?: string;
    category_id?: string;
    amount: number;
    paid_amount: number;
    type: 'INCOME' | 'EXPENSE';
    transaction_date: string;
    note?: string;
    is_inventory_affected: boolean;
    partner_name?: string;
    category_name?: string;
    season_name?: string;
}

export const getTransactions = async (seasonId?: string): Promise<Transaction[]> => {
    const params: any = {};
    if (seasonId) params.seasonId = seasonId;
    const response = await axios.get(`${API_URL}/management/transactions`, { params });
    return response.data.data;
};

export const createTransaction = async (data: any): Promise<Transaction> => {
    const response = await axios.post(`${API_URL}/management/transactions`, data);
    return response.data.data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/management/transactions/${id}`);
};
