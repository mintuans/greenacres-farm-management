import { api } from './client';

/**
 * Interface cho Inventory Item
 */
export interface InventoryItem {
    id?: string;
    name: string;
    sku: string;
    category: string;
    quantity: number;
    unit: string;
    cost: number;
    supplier?: string;
    minStock?: number;
    description?: string;
    status?: 'Còn hàng' | 'Sắp hết' | 'Cần đặt thêm';
    createdAt?: string;
    updatedAt?: string;
}

/**
 * API functions cho Inventory management
 */
export const inventoryAPI = {
    /**
     * Lấy tất cả vật tư
     */
    getAll: () => api.get<InventoryItem[]>('/inventory'),

    /**
     * Lấy vật tư theo ID
     */
    getById: (id: string) => api.get<InventoryItem>(`/inventory/${id}`),

    /**
     * Tạo vật tư mới
     */
    create: (data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) =>
        api.post<InventoryItem>('/inventory', data),

    /**
     * Cập nhật vật tư
     */
    update: (id: string, data: Partial<InventoryItem>) =>
        api.put<InventoryItem>(`/inventory/${id}`, data),

    /**
     * Xóa vật tư
     */
    delete: (id: string) => api.delete<void>(`/inventory/${id}`),

    /**
     * Tìm kiếm vật tư
     */
    search: (query: string) =>
        api.get<InventoryItem[]>(`/inventory/search?q=${encodeURIComponent(query)}`),

    /**
     * Lọc theo danh mục
     */
    filterByCategory: (category: string) =>
        api.get<InventoryItem[]>(`/inventory?category=${encodeURIComponent(category)}`),

    /**
     * Lấy vật tư sắp hết
     */
    getLowStock: () => api.get<InventoryItem[]>('/inventory/low-stock'),
};
