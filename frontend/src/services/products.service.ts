import api from './api';

export interface Product {
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
}

export interface ProductImage {
    id: string;
    image_name: string;
    display_order: number;
    is_primary: boolean;
}

export interface ProductCategory {
    id: string;
    category_code: string;
    category_name: string;
    slug: string;
    description?: string;
    parent_id?: string;
    display_order: number;
    is_active: boolean;
}

/**
 * Lấy danh sách sản phẩm
 */
export const getProducts = async (params?: {
    category_id?: string;
    search?: string;
    page?: number;
    limit?: number;
}) => {
    const response = await api.get('/showcase/products', { params });
    return response.data;
};

/**
 * Lấy chi tiết sản phẩm theo slug
 */
export const getProductBySlug = async (slug: string) => {
    const response = await api.get(`/showcase/products/${slug}`);
    return response.data;
};

/**
 * Lấy danh mục sản phẩm
 */
export const getProductCategories = async () => {
    const response = await api.get('/showcase/categories/products');
    return response.data;
};

/**
 * Lấy URL hình ảnh từ media_id
 */
export const getMediaUrl = (mediaId: string) => {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/management/media/raw/${mediaId}`;
};
