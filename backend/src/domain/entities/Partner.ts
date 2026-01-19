/**
 * Partner Domain Entity
 * Đại diện cho đối tác trong hệ thống (Supplier/Buyer/Worker)
 */
export interface Partner {
    id: string;
    partner_code: string;
    partner_name: string;
    type: 'SUPPLIER' | 'BUYER' | 'WORKER';
    phone?: string;
    address?: string;
    current_balance: number;
    created_at: Date;
}

/**
 * DTO for creating new Partner
 */
export interface CreatePartnerDTO {
    partner_code: string;
    partner_name: string;
    type: 'SUPPLIER' | 'BUYER' | 'WORKER';
    phone?: string;
    address?: string;
}

/**
 * DTO for updating Partner
 */
export interface UpdatePartnerDTO {
    partner_name?: string;
    type?: 'SUPPLIER' | 'BUYER' | 'WORKER';
    phone?: string;
    address?: string;
}
