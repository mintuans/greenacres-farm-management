/**
 * SOLID API - Clean Architecture
 * 
 * This file uses the new SOLID architecture backend endpoints.
 * Endpoints: /api/solid/seasons
 * 
 * Features:
 * - Clean Architecture
 * - SOLID Principles
 * - Dependency Injection
 * - Type-safe
 * - Better error handling
 */

import api from '../services/api';

export interface Season {
    id: string;
    unit_id: string;
    season_code: string;
    season_name: string;
    start_date: string;
    end_date?: string;
    status: string;
    expected_revenue?: number;
    unit_name?: string;
}

export interface CreateSeasonInput {
    unit_id: string;
    season_code: string;
    season_name: string;
    start_date: string;
    end_date?: string;
    expected_revenue?: number;
}

export interface UpdateSeasonInput {
    unit_id?: string;
    season_name?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    expected_revenue?: number;
}

export const getSeasons = async (status?: string, unitId?: string): Promise<Season[]> => {
    const params: any = {};
    if (status) params.status = status;
    if (unitId) params.unitId = unitId;
    const response = await api.get('/solid/seasons', { params });
    return response.data.data;
};

export const getSeasonById = async (id: string): Promise<Season> => {
    const response = await api.get(`/solid/seasons/${id}`);
    return response.data.data;
};

export const createSeason = async (data: CreateSeasonInput): Promise<Season> => {
    const response = await api.post('/solid/seasons', data);
    return response.data.data;
};

export const updateSeason = async (id: string, data: UpdateSeasonInput): Promise<Season> => {
    const response = await api.put(`/solid/seasons/${id}`, data);
    return response.data.data;
};

export const deleteSeason = async (id: string): Promise<void> => {
    await api.delete(`/solid/seasons/${id}`);
};

export const closeSeason = async (id: string): Promise<Season> => {
    const response = await api.post(`/solid/seasons/${id}/close`);
    return response.data.data;
};

export const getSeasonStats = async (): Promise<any> => {
    const response = await api.get('/solid/seasons/stats');
    return response.data.data;
};

export const getNextSeasonCode = async (): Promise<string> => {
    const response = await api.get('/solid/seasons/next-code');
    return response.data.data;
};
