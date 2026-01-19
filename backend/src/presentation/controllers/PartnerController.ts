import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { PartnerService } from '../../domain/services/PartnerService';
import { TYPES } from '../../core/types';

/**
 * Partner Controller
 * Presentation layer - chỉ xử lý HTTP requests/responses
 * Tuân thủ Single Responsibility Principle
 */
@injectable()
export class PartnerController {
    constructor(
        @inject(TYPES.PartnerService) private partnerService: PartnerService
    ) { }

    /**
     * GET /api/solid/partners
     * Get all partners with optional type filter
     */
    getAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const { type } = req.query;
            const partners = await this.partnerService.getAllPartners(type as string);

            res.json({
                success: true,
                data: partners
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    /**
     * GET /api/solid/partners/:id
     * Get partner by ID
     */
    getOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const partner = await this.partnerService.getPartner(id);

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
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    /**
     * POST /api/solid/partners
     * Create new partner
     */
    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const partner = await this.partnerService.createPartner(req.body);

            res.status(201).json({
                success: true,
                data: partner,
                message: 'Partner created successfully'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    /**
     * PUT /api/solid/partners/:id
     * Update partner
     */
    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const partner = await this.partnerService.updatePartner(id, req.body);

            res.json({
                success: true,
                data: partner,
                message: 'Partner updated successfully'
            });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({
                success: false,
                message: error.message
            });
        }
    };

    /**
     * DELETE /api/solid/partners/:id
     * Delete partner
     */
    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await this.partnerService.deletePartner(id);

            res.json({
                success: true,
                message: 'Partner deleted successfully'
            });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({
                success: false,
                message: error.message
            });
        }
    };

    /**
     * GET /api/solid/partners/:id/balance
     * Get partner balance
     */
    getBalance = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const balance = await this.partnerService.getPartnerBalance(id);

            res.json({
                success: true,
                data: { balance }
            });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({
                success: false,
                message: error.message
            });
        }
    };
}
