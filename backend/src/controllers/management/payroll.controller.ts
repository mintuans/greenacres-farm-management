
import { Request, Response } from 'express';
import * as payrollService from '../../services/payroll.service';

// Lấy tất cả payrolls
export const getAllPayrolls = async (_req: Request, res: Response): Promise<any> => {
    try {
        const payrolls = await payrollService.getAllPayrolls();
        return res.json({ success: true, data: payrolls });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy payroll theo ID
export const getPayrollById = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const payroll = await payrollService.getPayrollById(id);
        if (!payroll) {
            return res.status(404).json({ success: false, message: 'Payroll not found' });
        }
        return res.json({ success: true, data: payroll });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy payrolls theo season
export const getPayrollsBySeason = async (req: Request, res: Response): Promise<any> => {
    try {
        const { seasonId } = req.params;
        const payrolls = await payrollService.getPayrollsBySeason(seasonId);
        return res.json({ success: true, data: payrolls });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy payrolls theo partner
export const getPayrollsByPartner = async (req: Request, res: Response): Promise<any> => {
    try {
        const { partnerId } = req.params;
        const payrolls = await payrollService.getPayrollsByPartner(partnerId);
        return res.json({ success: true, data: payrolls });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Tạo payroll mới
export const createPayroll = async (req: Request, res: Response): Promise<any> => {
    try {
        const payroll = await payrollService.createPayroll(req.body);
        return res.status(201).json({ success: true, data: payroll });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật payroll
export const updatePayroll = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const payroll = await payrollService.updatePayroll(id, req.body);
        if (!payroll) {
            return res.status(404).json({ success: false, message: 'Payroll not found or no changes made' });
        }
        return res.json({ success: true, data: payroll });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật trạng thái payroll (QUAN TRỌNG: Trigger sẽ tự động tạo transaction khi status = PAID)
export const updatePayrollStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { status, payment_date } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        const payroll = await payrollService.updatePayrollStatus(id, status, payment_date);
        if (!payroll) {
            return res.status(404).json({ success: false, message: 'Payroll not found' });
        }

        return res.json({
            success: true,
            data: payroll,
            message: status === 'PAID' ? 'Payroll marked as PAID. Transaction created automatically.' : 'Status updated successfully'
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa payroll
export const deletePayroll = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const success = await payrollService.deletePayroll(id);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Payroll not found' });
        }
        return res.json({ success: true, message: 'Payroll deleted successfully' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy thống kê payroll
export const getPayrollStats = async (_req: Request, res: Response): Promise<any> => {
    try {
        const stats = await payrollService.getPayrollStats();
        return res.json({ success: true, data: stats });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
