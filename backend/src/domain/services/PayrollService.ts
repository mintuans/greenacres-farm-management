import { injectable, inject } from 'inversify';
import { IPayrollRepository } from '../repositories/IPayrollRepository';
import { Payroll, CreatePayrollDTO, UpdatePayrollDTO } from '../entities/Payroll';
import { TYPES } from '../../core/types';

@injectable()
export class PayrollService {
    constructor(
        @inject(TYPES.IPayrollRepository) private payrollRepo: IPayrollRepository
    ) {}

    async getPayroll(id: string): Promise<Payroll | null> {
        if (!id || id.trim() === '') {
            throw new Error('Payroll ID is required');
        }
        return this.payrollRepo.findById(id);
    }

    async getAllPayrolls(): Promise<Payroll[]> {
        return this.payrollRepo.findAll();
    }

    async getPayrollsByPartner(partnerId: string): Promise<Payroll[]> {
        if (!partnerId || partnerId.trim() === '') {
            throw new Error('Partner ID is required');
        }
        return this.payrollRepo.findByPartner(partnerId);
    }

    async getPayrollsBySeason(seasonId: string): Promise<Payroll[]> {
        if (!seasonId || seasonId.trim() === '') {
            throw new Error('Season ID is required');
        }
        return this.payrollRepo.findBySeason(seasonId);
    }

    async getPayrollStats(): Promise<any> {
        return this.payrollRepo.getStats();
    }

    async createPayroll(data: CreatePayrollDTO): Promise<Payroll> {
        if (!data.payroll_code || data.payroll_code.trim() === '') {
            throw new Error('Payroll code is required');
        }
        if (!data.partner_id || data.partner_id.trim() === '') {
            throw new Error('Partner ID is required');
        }
        if (!data.final_amount || data.final_amount < 0) {
            throw new Error('Final amount must be greater than or equal to 0');
        }
        return this.payrollRepo.create(data);
    }

    async updatePayroll(id: string, data: UpdatePayrollDTO): Promise<Payroll | null> {
        if (!id || id.trim() === '') {
            throw new Error('Payroll ID is required');
        }
        const existing = await this.payrollRepo.findById(id);
        if (!existing) {
            throw new Error(`Payroll with ID '${id}' not found`);
        }
        return this.payrollRepo.update(id, data);
    }

    async updatePayrollStatus(id: string, status: string, paymentDate?: string): Promise<Payroll | null> {
        if (!id || id.trim() === '') {
            throw new Error('Payroll ID is required');
        }
        const existing = await this.payrollRepo.findById(id);
        if (!existing) {
            throw new Error(`Payroll with ID '${id}' not found`);
        }
        return this.payrollRepo.updateStatus(id, status, paymentDate);
    }

    async deletePayroll(id: string): Promise<boolean> {
        if (!id || id.trim() === '') {
            throw new Error('Payroll ID is required');
        }
        const existing = await this.payrollRepo.findById(id);
        if (!existing) {
            throw new Error(`Payroll with ID '${id}' not found`);
        }
        return this.payrollRepo.delete(id);
    }
}
