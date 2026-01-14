import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    const response = await axios.get(`${API_URL}/management/audit-logs`);
    return response.data.data;
};
