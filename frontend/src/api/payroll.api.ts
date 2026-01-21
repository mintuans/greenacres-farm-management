import api from '../services/api';


export interface Payroll {
    id: string;
    payroll_code: string;
    partner_id: string;
    partner_name?: string;
    total_amount: number;
    bonus: number;
    deductions: number;
    final_amount: number;
    status: 'DRAFT' | 'APPROVED' | 'PAID' | 'CANCELLED';
    transaction_id?: string;
    payment_date?: string;
    created_at: string;
}

export interface PayrollStats {
    total_payrolls: number;
    draft_count: number;
    approved_count: number;
    paid_count: number;
    total_paid_amount: number;
    pending_amount: number;
}

// Lấy tất cả payrolls
export const getAllPayrolls = async (): Promise<Payroll[]> => {
    const response = await api.get('/payroll');
    return response.data.data;
};

// Lấy payroll theo ID
export const getPayrollById = async (id: string): Promise<Payroll> => {
    const response = await api.get(`/payroll/${id}`);
    return response.data.data;
};

// Lấy payrolls theo season
export const getPayrollsBySeason = async (seasonId: string): Promise<Payroll[]> => {
    const response = await api.get(`/payroll/season/${seasonId}`);
    return response.data.data;
};

// Lấy payrolls theo partner
export const getPayrollsByPartner = async (partnerId: string): Promise<Payroll[]> => {
    const response = await api.get(`/payroll/partner/${partnerId}`);
    return response.data.data;
};

// Tạo payroll mới
export const createPayroll = async (data: Partial<Payroll>): Promise<Payroll> => {
    const response = await api.post('/payroll', data);
    return response.data.data;
};

// Cập nhật payroll
export const updatePayroll = async (id: string, data: Partial<Payroll>): Promise<Payroll> => {
    const response = await api.put(`/payroll/${id}`, data);
    return response.data.data;
};

// Cập nhật trạng thái payroll (QUAN TRỌNG: Trigger tự động tạo transaction khi status = PAID)
export const updatePayrollStatus = async (
    id: string,
    status: 'DRAFT' | 'APPROVED' | 'PAID' | 'CANCELLED',
    paymentDate?: string
): Promise<Payroll> => {
    const response = await api.put(`/payroll/${id}/status`, {
        status,
        payment_date: paymentDate || new Date().toISOString()
    });
    return response.data.data;
};

// Xóa payroll
export const deletePayroll = async (id: string): Promise<void> => {
    await api.delete(`/payroll/${id}`);
};

// Lấy thống kê payroll
export const getPayrollStats = async (): Promise<PayrollStats> => {
    const response = await api.get('/payroll/stats');
    return response.data.data;
};
