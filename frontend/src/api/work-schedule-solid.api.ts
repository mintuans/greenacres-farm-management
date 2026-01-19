/**
 * SOLID API - Clean Architecture
 * 
 * This file uses the new SOLID architecture backend endpoints.
 * Endpoints: /api/solid/work-schedules
 * 
 * Features:
 * - Clean Architecture
 * - SOLID Principles
 * - Dependency Injection
 * - Type-safe
 * - Better error handling
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface WorkSchedule {
    id: string;
    partner_id: string;
    shift_id: string;
    job_type_id: string;
    work_date: string;
    status: 'PLANNED' | 'CONFIRMED' | 'CANCELLED';
    note?: string;
    partner_name?: string;  // For display
    shift_name?: string;    // For display
    job_name?: string;      // For display
    season_id?: string;
    season_name?: string;   // For display
}

export const getWorkSchedules = async (): Promise<WorkSchedule[]> => {
    const response = await axios.get(`${API_URL}/solid/work-schedules`);
    return response.data.data;
};

export const createWorkSchedule = async (data: any): Promise<WorkSchedule> => {
    const response = await axios.post(`${API_URL}/solid/work-schedules`, data);
    return response.data.data;
};

export const updateWorkSchedule = async (id: string, data: any): Promise<WorkSchedule> => {
    const response = await axios.put(`${API_URL}/solid/work-schedules/${id}`, data);
    return response.data.data;
};

export const deleteWorkSchedule = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/solid/work-schedules/${id}`);
};
