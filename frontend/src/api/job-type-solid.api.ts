/**
 * SOLID API - Clean Architecture
 * 
 * This file uses the new SOLID architecture backend endpoints.
 * Endpoints: /api/solid/job-types
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

export interface JobType {
    id: string;
    job_code: string;
    job_name: string;
    base_rate: number;
    description?: string;
}

export interface CreateJobTypeInput {
    job_code: string;
    job_name: string;
    base_rate: number;
    description?: string;
}

export interface UpdateJobTypeInput {
    job_name?: string;
    base_rate?: number;
    description?: string;
}

export const getJobTypes = async (): Promise<JobType[]> => {
    const response = await axios.get(`${API_URL}/solid/job-types`);
    return response.data.data;
};

export const getJobTypeById = async (id: string): Promise<JobType> => {
    const response = await axios.get(`${API_URL}/solid/job-types/${id}`);
    return response.data.data;
};

export const createJobType = async (data: CreateJobTypeInput): Promise<JobType> => {
    const response = await axios.post(`${API_URL}/solid/job-types`, data);
    return response.data.data;
};

export const updateJobType = async (id: string, data: UpdateJobTypeInput): Promise<JobType> => {
    const response = await axios.put(`${API_URL}/solid/job-types/${id}`, data);
    return response.data.data;
};

export const deleteJobType = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/solid/job-types/${id}`);
};

export const getJobTypeStats = async (): Promise<any> => {
    const response = await axios.get(`${API_URL}/solid/job-types/stats`);
    return response.data.data;
};
