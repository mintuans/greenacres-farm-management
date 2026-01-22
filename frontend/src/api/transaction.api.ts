import api from '../services/api';


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
    quantity?: number;
    unit?: string;
    unit_price?: number;
    partner_name?: string;
    category_name?: string;
    category_code?: string;
    season_name?: string;
}

export const getTransactions = async (month?: number, year?: number, seasonId?: string): Promise<Transaction[]> => {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    if (seasonId) params.seasonId = seasonId;
    const response = await api.get('/management/transactions', { params });
    return response.data.data;
};

export const createTransaction = async (data: any): Promise<Transaction> => {
    const response = await api.post('/management/transactions', data);
    return response.data.data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
    await api.delete(`/management/transactions/${id}`);
};
