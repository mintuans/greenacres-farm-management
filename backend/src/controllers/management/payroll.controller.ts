
import { Request, Response } from 'express';
import * as payrollService from '../../services/payroll.service';

export const getPayrollsBySeason = async (req: Request, res: Response): Promise<any> => {
    try {
        const { seasonId } = req.params;
        const payrolls = await payrollService.getPayrollsBySeason(seasonId);
        return res.json(payrolls);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};
