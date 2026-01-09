
export interface NavItem {
    label: string;
    path: string;
    icon: string;
}

export interface StatCardProps {
    label: string;
    value: string;
    trend?: string;
    trendUp?: boolean;
    icon: string;
    colorClass: string;
}

export interface Transaction {
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
    status: 'completed' | 'pending';
}

export interface Season {
    id: string;
    name: string;
    status: 'In Progress' | 'Completed';
    startDate: string;
    income: string;
    expenses: string;
    profit: string;
    progress: number;
    type: string;
}
