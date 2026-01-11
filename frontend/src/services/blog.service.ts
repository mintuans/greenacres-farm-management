import api from './api';

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    thumbnail_id?: string;
    featured_image_id?: string;
    category_id?: string;
    category_name?: string;
    author_id?: string;
    status: 'DRAFT' | 'PUBLISHED';
    published_at: string;
    view_count: number;
    comment_count?: number;
    created_at: string;
    updated_at: string;
    tags?: Array<{
        id: string;
        tag_name: string;
        slug: string;
    }>;
}

export interface BlogCategory {
    id: string;
    category_code: string;
    category_name: string;
    slug: string;
    description?: string;
}

/**
 * Lấy danh sách bài viết blog
 */
export const getBlogPosts = async (params?: {
    category_id?: string;
    search?: string;
    page?: number;
    limit?: number;
}) => {
    const response = await api.get('/showcase/blog', { params });
    return response.data;
};

/**
 * Lấy chi tiết bài viết theo slug
 */
export const getBlogPostBySlug = async (slug: string) => {
    const response = await api.get(`/showcase/blog/${slug}`);
    return response.data;
};

/**
 * Lấy danh sách danh mục blog
 */
export const getBlogCategories = async () => {
    const response = await api.get('/showcase/categories/blog');
    return response.data;
};

// ============ MANAGEMENT APIs ============

/**
 * Lấy tất cả bài viết (bao gồm draft) - cho admin
 */
export const getAllBlogPostsForManagement = async (params?: {
    category_id?: string;
    search?: string;
    page?: number;
    limit?: number;
}) => {
    const response = await api.get('/management/blog', { params });
    return response.data;
};

/**
 * Tạo bài viết mới
 */
export const createBlogPost = async (data: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    thumbnail_id?: string;
    category_id?: string;
    status?: 'DRAFT' | 'PUBLISHED';
}) => {
    const response = await api.post('/management/blog', data);
    return response.data;
};

/**
 * Cập nhật bài viết
 */
export const updateBlogPost = async (id: string, data: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    thumbnail_id: string;
    category_id: string;
    status: 'DRAFT' | 'PUBLISHED';
}>) => {
    const response = await api.put(`/management/blog/${id}`, data);
    return response.data;
};

/**
 * Xóa bài viết
 */
export const deleteBlogPost = async (id: string) => {
    const response = await api.delete(`/management/blog/${id}`);
    return response.data;
};

/**
 * Lấy danh sách danh mục (cho management)
 */
export const getBlogCategoriesForManagement = async () => {
    const response = await api.get('/management/blog/categories');
    return response.data;
};
