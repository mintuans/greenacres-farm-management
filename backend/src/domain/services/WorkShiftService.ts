import { injectable, inject } from 'inversify';
import { IWorkShiftRepository } from '../repositories/IWorkShiftRepository';
import { WorkShift, CreateWorkShiftDTO, UpdateWorkShiftDTO } from '../entities/WorkShift';
import { TYPES } from '../../core/types';

@injectable()
export class WorkShiftService {
    constructor(
        @inject(TYPES.IWorkShiftRepository) private workShiftRepo: IWorkShiftRepository
    ) {}

    async getWorkShift(id: string): Promise<WorkShift | null> {
        if (!id || id.trim() === '') {
            throw new Error('WorkShift ID is required');
        }
        return this.workShiftRepo.findById(id);
    }

    async getAllWorkShifts(): Promise<WorkShift[]> {
        return this.workShiftRepo.findAll();
    }

    async createWorkShift(data: CreateWorkShiftDTO): Promise<WorkShift> {
        if (!data.shift_name || data.shift_name.trim() === '') {
            throw new Error('Shift name is required');
        }
        if (!data.start_time) {
            throw new Error('Start time is required');
        }
        if (!data.end_time) {
            throw new Error('End time is required');
        }
        return this.workShiftRepo.create(data);
    }

    async updateWorkShift(id: string, data: UpdateWorkShiftDTO): Promise<WorkShift | null> {
        if (!id || id.trim() === '') {
            throw new Error('WorkShift ID is required');
        }
        const existing = await this.workShiftRepo.findById(id);
        if (!existing) {
            throw new Error(`WorkShift with ID '${id}' not found`);
        }
        return this.workShiftRepo.update(id, data);
    }

    async deleteWorkShift(id: string): Promise<boolean> {
        if (!id || id.trim() === '') {
            throw new Error('WorkShift ID is required');
        }
        const existing = await this.workShiftRepo.findById(id);
        if (!existing) {
            throw new Error(`WorkShift with ID '${id}' not found`);
        }
        return this.workShiftRepo.delete(id);
    }
}
