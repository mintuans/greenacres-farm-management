import { IRepository } from '../../core/interfaces/IRepository';
import { Transaction } from '../entities/Transaction';

export interface ITransactionRepository extends IRepository<Transaction> {
    findByPartner(partnerId: string): Promise<Transaction[]>;
    findByDateRange(startDate: string, endDate: string): Promise<Transaction[]>;
    findByType(type: string): Promise<Transaction[]>;
    getTotalByType(type: string): Promise<number>;
}
