import api from './api';

export interface ManagementProduct {
    id: string;
    product_code: string;
    product_name: string;
    slug: string;
    category_id: string;
    category_name?: string;
    short_description: string;
    full_description: string;
    price: number;
    original_price?: number;
    stock_quantity: number;
    unit_of_measure: string;
    thumbnail_id?: string;
    status: string;
    is_featured: boolean;
    view_count: number;
    sold_count: number;
    avg_rating?: number;
    review_count?: number;
    created_at: string;
    updated_at: string;
}

/**
 * Lấy danh sách sản phẩm (quản lý)
 */
export const getManagementProducts = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}) => {
    const response = await api.get('/management/products', { params });
    return response.data;
};

/**
 * Lấy chi tiết sản phẩm
 */
export const getManagementProductById = async (id: string) => {
    const response = await api.get(`/management/products/${id}`);
    return response.data;
};

/**
 * Tạo sản phẩm mới
 */
export const createManagementProduct = async (data: Partial<ManagementProduct>) => {
    const response = await api.post('/management/products', data);
    return response.data;
};

/**
 * Cập nhật sản phẩm
 */
export const updateManagementProduct = async (id: string, data: Partial<ManagementProduct>) => {
    const response = await api.put(`/management/products/${id}`, data);
    return response.data;
};

/**
 * Xóa sản phẩm
 */
export const deleteManagementProduct = async (id: string) => {
    const response = await api.delete(`/management/products/${id}`);
    return response.data;
};
