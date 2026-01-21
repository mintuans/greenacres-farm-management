import api from '../services/api';


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
    const response = await api.get('/management/job-types');
    return response.data.data;
};

export const getJobTypeById = async (id: string): Promise<JobType> => {
    const response = await api.get(`/management/job-types/${id}`);
    return response.data.data;
};

export const createJobType = async (data: CreateJobTypeInput): Promise<JobType> => {
    const response = await api.post('/management/job-types', data);
    return response.data.data;
};

export const updateJobType = async (id: string, data: UpdateJobTypeInput): Promise<JobType> => {
    const response = await api.put(`/management/job-types/${id}`, data);
    return response.data.data;
};

export const deleteJobType = async (id: string): Promise<void> => {
    await api.delete(`/management/job-types/${id}`);
};

export const getJobTypeStats = async (): Promise<any> => {
    const response = await api.get('/management/job-types/stats');
    return response.data.data;
};
