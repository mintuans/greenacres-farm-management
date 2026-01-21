import api from '../services/api';

export interface Category {
    id: string;
    category_code: string;
    category_name: string;
    parent_id?: string;
    scope: 'FARM' | 'PERSONAL' | 'BOTH';
    parent_name?: string;
    children?: Category[];
}

export interface CreateCategoryInput {
    category_code: string;
    category_name: string;
    parent_id?: string;
    scope: 'FARM' | 'PERSONAL' | 'BOTH';
}

export interface UpdateCategoryInput {
    category_name?: string;
    parent_id?: string;
    scope?: 'FARM' | 'PERSONAL' | 'BOTH';
}

export const getCategories = async (scope?: string, parentId?: string | null): Promise<Category[]> => {
    const params: any = {};
    if (scope) params.scope = scope;
    if (parentId !== undefined) params.parentId = parentId === null ? 'null' : parentId;
    const response = await api.get('/management/categories', { params });
    return response.data.data;
};

export const getCategoryTree = async (scope?: string): Promise<Category[]> => {
    const params = scope ? { scope } : {};
    const response = await api.get('/management/categories/tree', { params });
    return response.data.data;
};

export const getCategoryById = async (id: string): Promise<Category> => {
    const response = await api.get(`/management/categories/${id}`);
    return response.data.data;
};

export const createCategory = async (data: CreateCategoryInput): Promise<Category> => {
    const response = await api.post('/management/categories', data);
    return response.data.data;
}

export const updateCategory = async (id: string, data: UpdateCategoryInput): Promise<Category> => {
    const response = await api.put(`/management/categories/${id}`, data);
    return response.data.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
    await api.delete(`/management/categories/${id}`);
};

export const getCategoryStats = async (): Promise<any> => {
    const response = await api.get('/management/categories/stats');
    return response.data.data;
};

