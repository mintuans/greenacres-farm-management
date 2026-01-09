// Common types and interfaces for the backend

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export type UserRole = 'user' | 'admin';

export type SeasonStatus = 'active' | 'completed' | 'cancelled';

export type DebtStatus = 'pending' | 'paid' | 'overdue';
