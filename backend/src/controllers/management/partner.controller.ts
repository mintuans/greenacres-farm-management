import { Request, Response } from 'express';
import * as partnerService from '../../services/partner.service';

// Tạo đối tác mới
export const createPartner = async (req: Request, res: Response) => {
    try {
        const partner = await partnerService.createPartner(req.body);
        res.status(201).json({
            success: true,
            data: partner,
            message: 'Partner created successfully'
        });
    } catch (error: any) {
        console.error('Create partner error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create partner'
        });
    }
};

// Lấy danh sách đối tác
export const getPartners = async (req: Request, res: Response) => {
    try {
        const { type } = req.query;
        const partners = await partnerService.getPartners(type as string);
        res.json({
            success: true,
            data: partners
        });
    } catch (error: any) {
        console.error('Get partners error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get partners'
        });
    }
};

// Lấy đối tác theo ID
export const getPartnerById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const partner = await partnerService.getPartnerById(id);

        if (!partner) {
            res.status(404).json({
                success: false,
                message: 'Partner not found'
            });
            return;
        }

        res.json({
            success: true,
            data: partner
        });
    } catch (error: any) {
        console.error('Get partner error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get partner'
        });
    }
};

// Cập nhật đối tác
export const updatePartner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const partner = await partnerService.updatePartner(id, req.body);

        if (!partner) {
            res.status(404).json({
                success: false,
                message: 'Partner not found'
            });
            return;
        }

        res.json({
            success: true,
            data: partner,
            message: 'Partner updated successfully'
        });
    } catch (error: any) {
        console.error('Update partner error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update partner'
        });
    }
};

// Xóa đối tác
export const deletePartner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await partnerService.deletePartner(id);

        if (!deleted) {
            res.status(404).json({
                success: false,
                message: 'Partner not found'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Partner deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete partner error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete partner'
        });
    }
};

// Lấy số dư
export const getPartnerBalance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const balance = await partnerService.getPartnerBalance(id);

        res.json({
            success: true,
            data: { balance }
        });
    } catch (error: any) {
        console.error('Get balance error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get balance'
        });
    }
};
