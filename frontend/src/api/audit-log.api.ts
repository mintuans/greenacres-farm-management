import api from '../services/api';

export interface AuditLog {
    id: string;
    user_id?: string;
    full_name?: string;
    action: string;
    entity_table?: string;
    entity_id?: string;
    old_values?: any;
    new_values?: any;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}

export const getAuditLogs = async (): Promise<AuditLog[]> => {
    const response = await api.get('/management/audit-logs');
    return response.data.data;
};
