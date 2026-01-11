import { Request, Response } from 'express';
import * as workShiftService from '../../services/work-shift.service';

// Tạo ca làm việc mới
export const createWorkShift = async (req: Request, res: Response) => {
    try {
        const shift = await workShiftService.createWorkShift(req.body);
        res.status(201).json({
            success: true,
            data: shift,
            message: 'Work shift created successfully'
        });
    } catch (error: any) {
        console.error('Create work shift error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create work shift'
        });
    }
};

// Lấy danh sách ca làm việc
export const getWorkShifts = async (_req: Request, res: Response) => {
    try {
        const shifts = await workShiftService.getWorkShifts();
        res.json({
            success: true,
            data: shifts
        });
    } catch (error: any) {
        console.error('Get work shifts error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get work shifts'
        });
    }
};

// Lấy ca làm việc theo ID
export const getWorkShiftById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const shift = await workShiftService.getWorkShiftById(id);

        if (!shift) {
            res.status(404).json({
                success: false,
                message: 'Work shift not found'
            });
            return;
        }

        res.json({
            success: true,
            data: shift
        });
    } catch (error: any) {
        console.error('Get work shift error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get work shift'
        });
    }
};

// Cập nhật ca làm việc
export const updateWorkShift = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const shift = await workShiftService.updateWorkShift(id, req.body);

        if (!shift) {
            res.status(404).json({
                success: false,
                message: 'Work shift not found'
            });
            return;
        }

        res.json({
            success: true,
            data: shift,
            message: 'Work shift updated successfully'
        });
    } catch (error: any) {
        console.error('Update work shift error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update work shift'
        });
    }
};

// Xóa ca làm việc
export const deleteWorkShift = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await workShiftService.deleteWorkShift(id);

        if (!deleted) {
            res.status(404).json({
                success: false,
                message: 'Work shift not found'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Work shift deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete work shift error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete work shift'
        });
    }
};
