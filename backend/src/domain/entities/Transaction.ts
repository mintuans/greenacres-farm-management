export interface Transaction {
    id: string;
    partner_id: string;
    transaction_type: 'INCOME' | 'EXPENSE';
    amount: number;
    description?: string;
    transaction_date: string;
    created_at?: Date;
    partner_name?: string;
}

export interface CreateTransactionDTO {
    partner_id: string;
    transaction_type: 'INCOME' | 'EXPENSE';
    amount: number;
    description?: string;
    transaction_date: string;
}

export interface UpdateTransactionDTO {
    partner_id?: string;
    transaction_type?: 'INCOME' | 'EXPENSE';
    amount?: number;
    description?: string;
    transaction_date?: string;
}
