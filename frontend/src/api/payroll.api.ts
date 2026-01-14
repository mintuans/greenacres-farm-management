
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Payroll {
    id: string;
    payroll_code: string;
    partner_id: string;
    partner_name?: string;
    total_amount: number;
    bonus: number;
    deductions: number;
    final_amount: number;
    status: string;
    transaction_id?: string;
    payment_date?: string;
    created_at: string;
}

export const getPayrollsBySeason = async (seasonId: string): Promise<Payroll[]> => {
    const response = await axios.get(`${API_URL}/management/payrolls/season/${seasonId}`);
    return response.data;
};
