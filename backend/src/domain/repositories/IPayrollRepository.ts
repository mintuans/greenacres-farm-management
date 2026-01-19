import { IRepository } from '../../core/interfaces/IRepository';
import { Payroll } from '../entities/Payroll';

export interface IPayrollRepository extends IRepository<Payroll> {
    findByPartner(partnerId: string): Promise<Payroll[]>;
    findBySeason(seasonId: string): Promise<Payroll[]>;
    updateStatus(id: string, status: string, paymentDate?: string): Promise<Payroll | null>;
    getStats(): Promise<any>;
}
