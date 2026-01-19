export interface Payroll {
    id: string;
    payroll_code: string;
    partner_id: string;
    partner_name?: string;
    total_amount: number;
    bonus: number;
    deductions: number;
    final_amount: number;
    status: 'DRAFT' | 'APPROVED' | 'PAID';
    transaction_id?: string;
    payment_date?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreatePayrollDTO {
    payroll_code: string;
    partner_id: string;
    total_amount?: number;
    bonus?: number;
    deductions?: number;
    final_amount: number;
    status?: 'DRAFT' | 'APPROVED' | 'PAID';
    payment_date?: string;
}

export interface UpdatePayrollDTO {
    total_amount?: number;
    bonus?: number;
    deductions?: number;
    final_amount?: number;
    status?: 'DRAFT' | 'APPROVED' | 'PAID';
    payment_date?: string;
}
