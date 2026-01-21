import api from '../services/api';


export interface Partner {
    id: string;
    partner_code: string;
    partner_name: string;
    type: 'SUPPLIER' | 'BUYER' | 'WORKER';
    phone?: string;
    address?: string;
    current_balance: number;
    created_at: string;
}

export interface CreatePartnerInput {
    partner_code: string;
    partner_name: string;
    type: 'SUPPLIER' | 'BUYER' | 'WORKER';
    phone?: string;
    address?: string;
}

export interface UpdatePartnerInput {
    partner_name?: string;
    type?: 'SUPPLIER' | 'BUYER' | 'WORKER';
    phone?: string;
    address?: string;
}

// Lấy danh sách đối tác
export const getPartners = async (type?: string): Promise<Partner[]> => {
    const params = type ? { type } : {};
    const response = await api.get('/management/partners', { params });
    return response.data.data;
};

// Lấy đối tác theo ID
export const getPartnerById = async (id: string): Promise<Partner> => {
    const response = await api.get(`/management/partners/${id}`);
    return response.data.data;
};

// Tạo đối tác mới
export const createPartner = async (data: CreatePartnerInput): Promise<Partner> => {
    const response = await api.post('/management/partners', data);
    return response.data.data;
};

// Cập nhật đối tác
export const updatePartner = async (id: string, data: UpdatePartnerInput): Promise<Partner> => {
    const response = await api.put(`/management/partners/${id}`, data);
    return response.data.data;
};

// Xóa đối tác
export const deletePartner = async (id: string): Promise<void> => {
    await api.delete(`/management/partners/${id}`);
};

// Lấy số dư
export const getPartnerBalance = async (id: string): Promise<number> => {
    const response = await api.get(`/management/partners/${id}/balance`);
    return response.data.data.balance;
};
