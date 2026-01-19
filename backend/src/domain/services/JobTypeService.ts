import { injectable, inject } from 'inversify';
import { IJobTypeRepository } from '../repositories/IJobTypeRepository';
import { JobType, CreateJobTypeDTO, UpdateJobTypeDTO } from '../entities/JobType';
import { TYPES } from '../../core/types';

@injectable()
export class JobTypeService {
    constructor(
        @inject(TYPES.IJobTypeRepository) private jobTypeRepo: IJobTypeRepository
    ) {}

    async getJobType(id: string): Promise<JobType | null> {
        if (!id || id.trim() === '') {
            throw new Error('JobType ID is required');
        }
        return this.jobTypeRepo.findById(id);
    }

    async getAllJobTypes(): Promise<JobType[]> {
        return this.jobTypeRepo.findAll();
    }

    async createJobType(data: CreateJobTypeDTO): Promise<JobType> {
        if (!data.job_name || data.job_name.trim() === '') {
            throw new Error('Job name is required');
        }
        return this.jobTypeRepo.create(data);
    }

    async updateJobType(id: string, data: UpdateJobTypeDTO): Promise<JobType | null> {
        if (!id || id.trim() === '') {
            throw new Error('JobType ID is required');
        }
        const existing = await this.jobTypeRepo.findById(id);
        if (!existing) {
            throw new Error(`JobType with ID '${id}' not found`);
        }
        return this.jobTypeRepo.update(id, data);
    }

    async deleteJobType(id: string): Promise<boolean> {
        if (!id || id.trim() === '') {
            throw new Error('JobType ID is required');
        }
        const existing = await this.jobTypeRepo.findById(id);
        if (!existing) {
            throw new Error(`JobType with ID '${id}' not found`);
        }
        return this.jobTypeRepo.delete(id);
    }
}
