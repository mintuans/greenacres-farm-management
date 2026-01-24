import { Request, Response } from 'express';
import * as partnerService from '../../services/partner.service';
import { logActivity } from '../../services/audit-log.service';

// Tạo đối tác mới
export const createPartner = async (req: Request, res: Response): Promise<any> => {
    try {
        const partner = await partnerService.createPartner(req.body);

        await logActivity(req, 'CREATE_PARTNER', 'partners', partner.id, null, req.body);

        return res.status(201).json({
            success: true,
            data: partner,
            message: 'Partner created successfully'
        });
    } catch (error: any) {
        console.error('Create partner error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create partner'
        });
    }
};

// Lấy danh sách đối tác
export const getPartners = async (req: Request, res: Response): Promise<any> => {
    try {
        const { type } = req.query;
        const partners = await partnerService.getPartners(type as string);
        return res.json({
            success: true,
            data: partners
        });
    } catch (error: any) {
        console.error('Get partners error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get partners'
        });
    }
};

// Lấy đối tác theo ID
export const getPartnerById = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const partner = await partnerService.getPartnerById(id);

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found'
            });
        }

        return res.json({
            success: true,
            data: partner
        });
    } catch (error: any) {
        console.error('Get partner error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get partner'
        });
    }
};

// Cập nhật đối tác
export const updatePartner = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldPartner = await partnerService.getPartnerById(id);
        const partner = await partnerService.updatePartner(id, req.body);

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found'
            });
        }

        await logActivity(req, 'UPDATE_PARTNER', 'partners', id, oldPartner, req.body);

        return res.json({
            success: true,
            data: partner,
            message: 'Partner updated successfully'
        });
    } catch (error: any) {
        console.error('Update partner error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update partner'
        });
    }
};

// Xóa đối tác
export const deletePartner = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldPartner = await partnerService.getPartnerById(id);
        const deleted = await partnerService.deletePartner(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found'
            });
        }

        await logActivity(req, 'DELETE_PARTNER', 'partners', id, oldPartner, null);

        return res.json({
            success: true,
            message: 'Partner deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete partner error:', error);

        // Handle foreign key constraint error (23503 is Postgres code for FK violation)
        if (error.code === '23503') {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa nhân sự này vì đã có dữ liệu liên quan (giao dịch, phiếu lương hoặc nhật ký công). Hãy kiểm tra lại.'
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete partner'
        });
    }
};

// Lấy số dư
export const getPartnerBalance = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const balance = await partnerService.getPartnerBalance(id);

        return res.json({
            success: true,
            data: { balance }
        });
    } catch (error: any) {
        console.error('Get balance error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get balance'
        });
    }
};

// Lấy mã tiếp theo
export const getNextCode = async (req: Request, res: Response): Promise<any> => {
    try {
        const { type } = req.query;
        if (!type) {
            return res.status(400).json({ success: false, message: 'Type is required' });
        }
        const nextCode = await partnerService.getNextPartnerCode(type as string);
        return res.json({
            success: true,
            data: nextCode
        });
    } catch (error: any) {
        console.error('Get next code error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get next code'
        });
    }
};
