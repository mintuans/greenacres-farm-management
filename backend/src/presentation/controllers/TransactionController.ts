import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TransactionService } from '../../domain/services/TransactionService';
import { TYPES } from '../../core/types';

@injectable()
export class TransactionController {
    constructor(
        @inject(TYPES.TransactionService) private transactionService: TransactionService
    ) {}

    getAll = async (_req: Request, res: Response): Promise<void> => {
        try {
            const transactions = await this.transactionService.getAllTransactions();
            res.json({ success: true, data: transactions });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    getOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const transaction = await this.transactionService.getTransaction(req.params.id);
            if (!transaction) {
                res.status(404).json({ success: false, message: 'Transaction not found' });
                return;
            }
            res.json({ success: true, data: transaction });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const transaction = await this.transactionService.createTransaction(req.body);
            res.status(201).json({ success: true, data: transaction });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const transaction = await this.transactionService.updateTransaction(req.params.id, req.body);
            res.json({ success: true, data: transaction });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.transactionService.deleteTransaction(req.params.id);
            res.json({ success: true, message: 'Transaction deleted successfully' });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };
}
