export interface JobType {
    id: string;
    job_name: string;
    description?: string;
    created_at?: Date;
}

export interface CreateJobTypeDTO {
    job_name: string;
    description?: string;
}

export interface UpdateJobTypeDTO {
    job_name?: string;
    description?: string;
}
