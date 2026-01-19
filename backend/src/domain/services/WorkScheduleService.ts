import { injectable, inject } from 'inversify';
import { IWorkScheduleRepository } from '../repositories/IWorkScheduleRepository';
import { WorkSchedule, CreateWorkScheduleDTO, UpdateWorkScheduleDTO } from '../entities/WorkSchedule';
import { TYPES } from '../../core/types';

@injectable()
export class WorkScheduleService {
    constructor(
        @inject(TYPES.IWorkScheduleRepository) private workScheduleRepo: IWorkScheduleRepository
    ) { }

    async getWorkSchedule(id: string): Promise<WorkSchedule | null> {
        if (!id || id.trim() === '') {
            throw new Error('WorkSchedule ID is required');
        }
        return this.workScheduleRepo.findById(id);
    }

    async getAllWorkSchedules(): Promise<WorkSchedule[]> {
        return this.workScheduleRepo.findAllWithDetails();
    }

    async getWorkSchedulesByPartner(partnerId: string): Promise<WorkSchedule[]> {
        if (!partnerId || partnerId.trim() === '') {
            throw new Error('Partner ID is required');
        }
        return this.workScheduleRepo.findByPartnerId(partnerId);
    }

    async getWorkSchedulesByDateRange(startDate: string, endDate: string): Promise<WorkSchedule[]> {
        if (!startDate || !endDate) {
            throw new Error('Start date and end date are required');
        }
        return this.workScheduleRepo.findByDateRange(startDate, endDate);
    }

    async getWorkSchedulesByStatus(status: string): Promise<WorkSchedule[]> {
        if (!status || status.trim() === '') {
            throw new Error('Status is required');
        }
        return this.workScheduleRepo.findByStatus(status);
    }

    async createWorkSchedule(data: CreateWorkScheduleDTO): Promise<WorkSchedule> {
        // Validation
        if (!data.partner_id || data.partner_id.trim() === '') {
            throw new Error('Partner ID is required');
        }
        if (!data.shift_id || data.shift_id.trim() === '') {
            throw new Error('Shift ID is required');
        }
        if (!data.job_type_id || data.job_type_id.trim() === '') {
            throw new Error('Job Type ID is required');
        }
        if (!data.work_date || data.work_date.trim() === '') {
            throw new Error('Work date is required');
        }
        if (!data.status || data.status.trim() === '') {
            throw new Error('Status is required');
        }

        return this.workScheduleRepo.create(data);
    }

    async updateWorkSchedule(id: string, data: UpdateWorkScheduleDTO): Promise<WorkSchedule | null> {
        if (!id || id.trim() === '') {
            throw new Error('WorkSchedule ID is required');
        }

        const existing = await this.workScheduleRepo.findById(id);
        if (!existing) {
            throw new Error(`WorkSchedule with ID '${id}' not found`);
        }

        return this.workScheduleRepo.update(id, data);
    }

    async deleteWorkSchedule(id: string): Promise<boolean> {
        if (!id || id.trim() === '') {
            throw new Error('WorkSchedule ID is required');
        }

        const existing = await this.workScheduleRepo.findById(id);
        if (!existing) {
            throw new Error(`WorkSchedule with ID '${id}' not found`);
        }

        return this.workScheduleRepo.delete(id);
    }
}
