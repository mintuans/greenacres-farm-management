import { Request, Response } from 'express';
import * as jobTypeService from '../../services/job-type.service';
import { logActivity } from '../../services/audit-log.service';

// Tạo loại công việc mới
export const createJobType = async (req: Request, res: Response): Promise<any> => {
    try {
        const jobType = await jobTypeService.createJobType(req.body);

        await logActivity(req, 'CREATE_JOB_TYPE', 'job_types', jobType.id, null, req.body);

        return res.status(201).json({
            success: true,
            data: jobType,
            message: 'Job type created successfully'
        });
    } catch (error: any) {
        console.error('Create job type error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create job type'
        });
    }
};

// Lấy danh sách loại công việc
export const getJobTypes = async (_req: Request, res: Response): Promise<any> => {
    try {
        const jobTypes = await jobTypeService.getJobTypes();
        return res.json({
            success: true,
            data: jobTypes
        });
    } catch (error: any) {
        console.error('Get job types error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get job types'
        });
    }
};

// Lấy loại công việc theo ID
export const getJobTypeById = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const jobType = await jobTypeService.getJobTypeById(id);

        if (!jobType) {
            return res.status(404).json({
                success: false,
                message: 'Job type not found'
            });
        }

        return res.json({
            success: true,
            data: jobType
        });
    } catch (error: any) {
        console.error('Get job type error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get job type'
        });
    }
};

// Cập nhật loại công việc
export const updateJobType = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldJobType = await jobTypeService.getJobTypeById(id);
        const jobType = await jobTypeService.updateJobType(id, req.body);

        if (!jobType) {
            return res.status(404).json({
                success: false,
                message: 'Job type not found'
            });
        }

        await logActivity(req, 'UPDATE_JOB_TYPE', 'job_types', id, oldJobType, req.body);

        return res.json({
            success: true,
            data: jobType,
            message: 'Job type updated successfully'
        });
    } catch (error: any) {
        console.error('Update job type error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update job type'
        });
    }
};

// Xóa loại công việc
export const deleteJobType = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldJobType = await jobTypeService.getJobTypeById(id);
        const deleted = await jobTypeService.deleteJobType(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Job type not found'
            });
        }

        await logActivity(req, 'DELETE_JOB_TYPE', 'job_types', id, oldJobType, null);

        return res.json({
            success: true,
            message: 'Job type deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete job type error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete job type'
        });
    }
};

// Lấy thống kê
export const getJobTypeStats = async (_req: Request, res: Response): Promise<any> => {
    try {
        const stats = await jobTypeService.getJobTypeStats();
        return res.json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        console.error('Get job type stats error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get job type stats'
        });
    }
};
