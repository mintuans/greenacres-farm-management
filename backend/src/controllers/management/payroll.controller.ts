
import { Request, Response } from 'express';
import * as payrollService from '../../services/payroll.service';

export const getPayrollsBySeason = async (req: Request, res: Response) => {
    try {
        const { seasonId } = req.params;
        const payrolls = await payrollService.getPayrollsBySeason(seasonId);
        res.json(payrolls);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
