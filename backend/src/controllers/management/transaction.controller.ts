import { Request, Response } from 'express';
import * as transactionService from '../../services/transaction.service';
import { logActivity } from '../../services/audit-log.service';

export const getTransactions = async (req: Request, res: Response): Promise<any> => {
    try {
        const { seasonId, month, year } = req.query;
        const transactions = await transactionService.getTransactions(
            month ? parseInt(month as string) : undefined,
            year ? parseInt(year as string) : undefined,
            seasonId as string
        );
        return res.json({ success: true, data: transactions });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createTransaction = async (req: Request, res: Response): Promise<any> => {
    try {
        const transaction = await transactionService.createTransaction(req.body);

        await logActivity(req, 'CREATE_TRANSACTION', 'transactions', transaction.id, null, req.body);

        return res.status(201).json({ success: true, data: transaction });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteTransaction = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldTransaction = await transactionService.getTransactionById(id);
        const result = await transactionService.deleteTransaction(id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }

        await logActivity(req, 'DELETE_TRANSACTION', 'transactions', id, oldTransaction, null);

        return res.json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
