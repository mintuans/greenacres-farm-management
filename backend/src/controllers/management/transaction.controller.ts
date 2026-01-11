import { Request, Response } from 'express';
import * as transactionService from '../../services/transaction.service';

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const { seasonId } = req.query;
        const transactions = await transactionService.getTransactions(seasonId as string);
        res.json({ success: true, data: transactions });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createTransaction = async (req: Request, res: Response) => {
    try {
        const transaction = await transactionService.createTransaction(req.body);
        res.status(201).json({ success: true, data: transaction });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteTransaction = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await transactionService.deleteTransaction(id);
        if (!result) {
            res.status(404).json({ success: false, message: 'Not found' });
            return;
        }
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
