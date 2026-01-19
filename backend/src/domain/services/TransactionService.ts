import { injectable, inject } from 'inversify';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { Transaction, CreateTransactionDTO, UpdateTransactionDTO } from '../entities/Transaction';
import { TYPES } from '../../core/types';

@injectable()
export class TransactionService {
    constructor(
        @inject(TYPES.ITransactionRepository) private transactionRepo: ITransactionRepository
    ) {}

    async getTransaction(id: string): Promise<Transaction | null> {
        if (!id || id.trim() === '') {
            throw new Error('Transaction ID is required');
        }
        return this.transactionRepo.findById(id);
    }

    async getAllTransactions(): Promise<Transaction[]> {
        return this.transactionRepo.findAll();
    }

    async getTransactionsByPartner(partnerId: string): Promise<Transaction[]> {
        if (!partnerId || partnerId.trim() === '') {
            throw new Error('Partner ID is required');
        }
        return this.transactionRepo.findByPartner(partnerId);
    }

    async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
        if (!startDate || !endDate) {
            throw new Error('Start date and end date are required');
        }
        return this.transactionRepo.findByDateRange(startDate, endDate);
    }

    async getTotalByType(type: string): Promise<number> {
        return this.transactionRepo.getTotalByType(type);
    }

    async createTransaction(data: CreateTransactionDTO): Promise<Transaction> {
        if (!data.partner_id || data.partner_id.trim() === '') {
            throw new Error('Partner ID is required');
        }
        if (!data.transaction_type) {
            throw new Error('Transaction type is required');
        }
        if (!data.amount || data.amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        if (!data.transaction_date) {
            throw new Error('Transaction date is required');
        }
        return this.transactionRepo.create(data);
    }

    async updateTransaction(id: string, data: UpdateTransactionDTO): Promise<Transaction | null> {
        if (!id || id.trim() === '') {
            throw new Error('Transaction ID is required');
        }
        const existing = await this.transactionRepo.findById(id);
        if (!existing) {
            throw new Error(`Transaction with ID '${id}' not found`);
        }
        return this.transactionRepo.update(id, data);
    }

    async deleteTransaction(id: string): Promise<boolean> {
        if (!id || id.trim() === '') {
            throw new Error('Transaction ID is required');
        }
        const existing = await this.transactionRepo.findById(id);
        if (!existing) {
            throw new Error(`Transaction with ID '${id}' not found`);
        }
        return this.transactionRepo.delete(id);
    }
}
