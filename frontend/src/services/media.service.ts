import api from './api';

export interface MediaFile {
    id: string;
    image_name: string;
    file_size: number;
    mime_type: string;
    created_at: string;
    image_data?: string;
}

/**
 * Lấy danh sách media files
 */
export const getMediaFiles = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
}) => {
    const response = await api.get('/management/media', { params });
    return response.data;
};

/**
 * Lấy media file theo ID (với base64 data)
 */
export const getMediaById = async (id: string) => {
    const response = await api.get(`/management/media/${id}`);
    return response.data;
};

/**
 * Upload media file
 */
export const uploadMedia = async (file: File, category?: string) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const response = await api.post('/management/media', {
                    image_name: file.name,
                    image_data: reader.result,
                    mime_type: file.type,
                    category: category
                });
                resolve(response.data);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Xóa media file
 */
export const deleteMedia = async (id: string) => {
    const response = await api.delete(`/management/media/${id}`);
    return response.data;
};

/**
 * Lấy danh sách ảnh của vườn (Showcase API)
 */
export const getFarmImages = async (limit: number = 6) => {
    const response = await api.get('/showcase/media/farm', { params: { limit } });
    return response.data;
};
