import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { PayrollService } from '../../domain/services/PayrollService';
import { TYPES } from '../../core/types';

@injectable()
export class PayrollController {
    constructor(
        @inject(TYPES.PayrollService) private payrollService: PayrollService
    ) { }

    getAll = async (_req: Request, res: Response): Promise<void> => {
        try {
            const payrolls = await this.payrollService.getAllPayrolls();
            res.json({ success: true, data: payrolls });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    getOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const payroll = await this.payrollService.getPayroll(req.params.id);
            if (!payroll) {
                res.status(404).json({ success: false, message: 'Payroll not found' });
                return;
            }
            res.json({ success: true, data: payroll });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    getStats = async (_req: Request, res: Response): Promise<void> => {
        try {
            const stats = await this.payrollService.getPayrollStats();
            res.json({ success: true, data: stats });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const payroll = await this.payrollService.createPayroll(req.body);
            res.status(201).json({ success: true, data: payroll });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const payroll = await this.payrollService.updatePayroll(req.params.id, req.body);
            res.json({ success: true, data: payroll });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };

    updateStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const { status, payment_date } = req.body;
            const payroll = await this.payrollService.updatePayrollStatus(req.params.id, status, payment_date);
            res.json({ success: true, data: payroll });
        } catch (error: any) {
            const statusCode = error.message.includes('not found') ? 404 : 400;
            res.status(statusCode).json({ success: false, message: error.message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.payrollService.deletePayroll(req.params.id);
            res.json({ success: true, message: 'Payroll deleted successfully' });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };

    getBySeason = async (req: Request, res: Response): Promise<void> => {
        try {
            const payrolls = await this.payrollService.getPayrollsBySeason(req.params.seasonId);
            res.json({ success: true, data: payrolls });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    getByPartner = async (req: Request, res: Response): Promise<void> => {
        try {
            const payrolls = await this.payrollService.getPayrollsByPartner(req.params.partnerId);
            res.json({ success: true, data: payrolls });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
