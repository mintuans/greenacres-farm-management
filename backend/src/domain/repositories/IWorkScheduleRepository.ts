import { IRepository } from '../../core/interfaces/IRepository';
import { WorkSchedule } from '../entities/WorkSchedule';

/**
 * WorkSchedule Repository Interface
 */
export interface IWorkScheduleRepository extends IRepository<WorkSchedule> {
    /**
     * Find schedules with joined data (partner, shift, job, season names)
     */
    findAllWithDetails(): Promise<WorkSchedule[]>;

    /**
     * Find schedules by partner ID
     */
    findByPartnerId(partnerId: string): Promise<WorkSchedule[]>;

    /**
     * Find schedules by date range
     */
    findByDateRange(startDate: string, endDate: string): Promise<WorkSchedule[]>;

    /**
     * Find schedules by status
     */
    findByStatus(status: string): Promise<WorkSchedule[]>;
}
