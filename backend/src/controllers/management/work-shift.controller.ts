import { Request, Response } from 'express';
import * as workShiftService from '../../services/work-shift.service';
import { logActivity } from '../../services/audit-log.service';

// Tạo ca làm việc mới
export const createWorkShift = async (req: Request, res: Response): Promise<any> => {
    try {
        const shift = await workShiftService.createWorkShift(req.body);

        await logActivity(req, 'CREATE_WORK_SHIFT', 'work_shifts', shift.id, null, req.body);

        return res.status(201).json({
            success: true,
            data: shift,
            message: 'Work shift created successfully'
        });
    } catch (error: any) {
        console.error('Create work shift error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create work shift'
        });
    }
};

// Lấy danh sách ca làm việc
export const getWorkShifts = async (_req: Request, res: Response): Promise<any> => {
    try {
        const shifts = await workShiftService.getWorkShifts();
        return res.json({
            success: true,
            data: shifts
        });
    } catch (error: any) {
        console.error('Get work shifts error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get work shifts'
        });
    }
};

// Lấy ca làm việc theo ID
export const getWorkShiftById = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const shift = await workShiftService.getWorkShiftById(id);

        if (!shift) {
            return res.status(404).json({
                success: false,
                message: 'Work shift not found'
            });
        }

        return res.json({
            success: true,
            data: shift
        });
    } catch (error: any) {
        console.error('Get work shift error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get work shift'
        });
    }
};

// Cập nhật ca làm việc
export const updateWorkShift = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldShift = await workShiftService.getWorkShiftById(id);
        const shift = await workShiftService.updateWorkShift(id, req.body);

        if (!shift) {
            return res.status(404).json({
                success: false,
                message: 'Work shift not found'
            });
        }

        await logActivity(req, 'UPDATE_WORK_SHIFT', 'work_shifts', id, oldShift, req.body);

        return res.json({
            success: true,
            data: shift,
            message: 'Work shift updated successfully'
        });
    } catch (error: any) {
        console.error('Update work shift error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update work shift'
        });
    }
};

// Xóa ca làm việc
export const deleteWorkShift = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldShift = await workShiftService.getWorkShiftById(id);
        const deleted = await workShiftService.deleteWorkShift(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Work shift not found'
            });
        }

        await logActivity(req, 'DELETE_WORK_SHIFT', 'work_shifts', id, oldShift, null);

        return res.json({
            success: true,
            message: 'Work shift deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete work shift error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete work shift'
        });
    }
};
