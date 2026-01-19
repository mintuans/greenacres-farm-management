const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');

console.log('🚀 MASTER SCRIPT - Implementing ALL remaining SOLID modules...\n');
console.log('📋 Modules to implement: Transaction, Season, Payroll, JobType, WorkShift, WarehouseType\n');

// Helper function to write file
function writeModule(moduleName, files) {
    console.log(`📦 Implementing ${moduleName}...`);
    Object.entries(files).forEach(([filename, content]) => {
        fs.writeFileSync(filename, content);
        console.log(`  ✅ ${path.basename(filename)}`);
    });
    console.log('');
}

// ==================== TRANSACTION ====================
const transactionFiles = {
    [path.join(baseDir, 'src/domain/entities/Transaction.ts')]: `export interface Transaction {
    id: string;
    partner_id: string;
    transaction_type: 'INCOME' | 'EXPENSE';
    amount: number;
    description?: string;
    transaction_date: string;
    created_at?: Date;
    partner_name?: string;
}

export interface CreateTransactionDTO {
    partner_id: string;
    transaction_type: 'INCOME' | 'EXPENSE';
    amount: number;
    description?: string;
    transaction_date: string;
}

export interface UpdateTransactionDTO {
    partner_id?: string;
    transaction_type?: 'INCOME' | 'EXPENSE';
    amount?: number;
    description?: string;
    transaction_date?: string;
}
`,

    [path.join(baseDir, 'src/domain/repositories/ITransactionRepository.ts')]: `import { IRepository } from '../../core/interfaces/IRepository';
import { Transaction } from '../entities/Transaction';

export interface ITransactionRepository extends IRepository<Transaction> {
    findByPartner(partnerId: string): Promise<Transaction[]>;
    findByDateRange(startDate: string, endDate: string): Promise<Transaction[]>;
    findByType(type: string): Promise<Transaction[]>;
    getTotalByType(type: string): Promise<number>;
}
`,

    [path.join(baseDir, 'src/infrastructure/database/repositories/TransactionRepository.ts')]: `import { injectable, inject } from 'inversify';
import { IDatabase } from '../../../core/interfaces/IDatabase';
import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { Transaction } from '../../../domain/entities/Transaction';
import { TYPES } from '../../../core/types';

@injectable()
export class TransactionRepository implements ITransactionRepository {
    constructor(@inject(TYPES.IDatabase) private db: IDatabase) {}

    async findById(id: string): Promise<Transaction | null> {
        const result = await this.db.query<Transaction>(
            'SELECT * FROM transactions WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async findAll(): Promise<Transaction[]> {
        const query = \`
            SELECT t.*, p.partner_name
            FROM transactions t
            LEFT JOIN partners p ON t.partner_id = p.id
            ORDER BY t.transaction_date DESC
        \`;
        const result = await this.db.query<Transaction>(query);
        return result.rows;
    }

    async findByPartner(partnerId: string): Promise<Transaction[]> {
        const result = await this.db.query<Transaction>(
            'SELECT * FROM transactions WHERE partner_id = $1 ORDER BY transaction_date DESC',
            [partnerId]
        );
        return result.rows;
    }

    async findByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
        const result = await this.db.query<Transaction>(
            'SELECT * FROM transactions WHERE transaction_date BETWEEN $1 AND $2 ORDER BY transaction_date DESC',
            [startDate, endDate]
        );
        return result.rows;
    }

    async findByType(type: string): Promise<Transaction[]> {
        const result = await this.db.query<Transaction>(
            'SELECT * FROM transactions WHERE transaction_type = $1 ORDER BY transaction_date DESC',
            [type]
        );
        return result.rows;
    }

    async getTotalByType(type: string): Promise<number> {
        const result = await this.db.query<{ total: string }>(
            'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE transaction_type = $1',
            [type]
        );
        return parseFloat(result.rows[0].total);
    }

    async create(data: Partial<Transaction>): Promise<Transaction> {
        const query = \`
            INSERT INTO transactions (partner_id, transaction_type, amount, description, transaction_date)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        \`;
        const values = [
            data.partner_id,
            data.transaction_type,
            data.amount,
            data.description,
            data.transaction_date
        ];
        const result = await this.db.query<Transaction>(query, values);
        return result.rows[0];
    }

    async update(id: string, data: Partial<Transaction>): Promise<Transaction | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        const allowedFields = ['partner_id', 'transaction_type', 'amount', 'description', 'transaction_date'];
        for (const key of allowedFields) {
            if (data[key as keyof Transaction] !== undefined) {
                fields.push(\`\${key} = $\${paramIndex++}\`);
                values.push(data[key as keyof Transaction]);
            }
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const query = \`
            UPDATE transactions 
            SET \${fields.join(', ')}
            WHERE id = $\${paramIndex}
            RETURNING *
        \`;
        const result = await this.db.query<Transaction>(query, values);
        return result.rows[0] || null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.query('DELETE FROM transactions WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}
`,

    [path.join(baseDir, 'src/domain/services/TransactionService.ts')]: `import { injectable, inject } from 'inversify';
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
            throw new Error(\`Transaction with ID '\${id}' not found\`);
        }
        return this.transactionRepo.update(id, data);
    }

    async deleteTransaction(id: string): Promise<boolean> {
        if (!id || id.trim() === '') {
            throw new Error('Transaction ID is required');
        }
        const existing = await this.transactionRepo.findById(id);
        if (!existing) {
            throw new Error(\`Transaction with ID '\${id}' not found\`);
        }
        return this.transactionRepo.delete(id);
    }
}
`,

    [path.join(baseDir, 'src/presentation/controllers/TransactionController.ts')]: `import { Request, Response } from 'express';
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
`
};

writeModule('Transaction', transactionFiles);

// ==================== SEASON ====================
const seasonFiles = {
    [path.join(baseDir, 'src/domain/entities/Season.ts')]: `export interface Season {
    id: string;
    season_name: string;
    start_date: string;
    end_date?: string;
    status: 'ACTIVE' | 'COMPLETED' | 'PLANNED';
    description?: string;
    created_at?: Date;
}

export interface CreateSeasonDTO {
    season_name: string;
    start_date: string;
    end_date?: string;
    status: 'ACTIVE' | 'COMPLETED' | 'PLANNED';
    description?: string;
}

export interface UpdateSeasonDTO {
    season_name?: string;
    start_date?: string;
    end_date?: string;
    status?: 'ACTIVE' | 'COMPLETED' | 'PLANNED';
    description?: string;
}
`,

    [path.join(baseDir, 'src/domain/repositories/ISeasonRepository.ts')]: `import { IRepository } from '../../core/interfaces/IRepository';
import { Season } from '../entities/Season';

export interface ISeasonRepository extends IRepository<Season> {
    findByStatus(status: string): Promise<Season[]>;
    findActive(): Promise<Season | null>;
}
`,

    [path.join(baseDir, 'src/infrastructure/database/repositories/SeasonRepository.ts')]: `import { injectable, inject } from 'inversify';
import { IDatabase } from '../../../core/interfaces/IDatabase';
import { ISeasonRepository } from '../../../domain/repositories/ISeasonRepository';
import { Season } from '../../../domain/entities/Season';
import { TYPES } from '../../../core/types';

@injectable()
export class SeasonRepository implements ISeasonRepository {
    constructor(@inject(TYPES.IDatabase) private db: IDatabase) {}

    async findById(id: string): Promise<Season | null> {
        const result = await this.db.query<Season>(
            'SELECT * FROM seasons WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async findAll(): Promise<Season[]> {
        const result = await this.db.query<Season>(
            'SELECT * FROM seasons ORDER BY start_date DESC'
        );
        return result.rows;
    }

    async findByStatus(status: string): Promise<Season[]> {
        const result = await this.db.query<Season>(
            'SELECT * FROM seasons WHERE status = $1 ORDER BY start_date DESC',
            [status]
        );
        return result.rows;
    }

    async findActive(): Promise<Season | null> {
        const result = await this.db.query<Season>(
            'SELECT * FROM seasons WHERE status = $1 ORDER BY start_date DESC LIMIT 1',
            ['ACTIVE']
        );
        return result.rows[0] || null;
    }

    async create(data: Partial<Season>): Promise<Season> {
        const query = \`
            INSERT INTO seasons (season_name, start_date, end_date, status, description)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        \`;
        const values = [
            data.season_name,
            data.start_date,
            data.end_date,
            data.status,
            data.description
        ];
        const result = await this.db.query<Season>(query, values);
        return result.rows[0];
    }

    async update(id: string, data: Partial<Season>): Promise<Season | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        const allowedFields = ['season_name', 'start_date', 'end_date', 'status', 'description'];
        for (const key of allowedFields) {
            if (data[key as keyof Season] !== undefined) {
                fields.push(\`\${key} = $\${paramIndex++}\`);
                values.push(data[key as keyof Season]);
            }
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const query = \`
            UPDATE seasons 
            SET \${fields.join(', ')}
            WHERE id = $\${paramIndex}
            RETURNING *
        \`;
        const result = await this.db.query<Season>(query, values);
        return result.rows[0] || null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.query('DELETE FROM seasons WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}
`,

    [path.join(baseDir, 'src/domain/services/SeasonService.ts')]: `import { injectable, inject } from 'inversify';
import { ISeasonRepository } from '../repositories/ISeasonRepository';
import { Season, CreateSeasonDTO, UpdateSeasonDTO } from '../entities/Season';
import { TYPES } from '../../core/types';

@injectable()
export class SeasonService {
    constructor(
        @inject(TYPES.ISeasonRepository) private seasonRepo: ISeasonRepository
    ) {}

    async getSeason(id: string): Promise<Season | null> {
        if (!id || id.trim() === '') {
            throw new Error('Season ID is required');
        }
        return this.seasonRepo.findById(id);
    }

    async getAllSeasons(): Promise<Season[]> {
        return this.seasonRepo.findAll();
    }

    async getActiveSeason(): Promise<Season | null> {
        return this.seasonRepo.findActive();
    }

    async getSeasonsByStatus(status: string): Promise<Season[]> {
        if (!status || status.trim() === '') {
            throw new Error('Status is required');
        }
        return this.seasonRepo.findByStatus(status);
    }

    async createSeason(data: CreateSeasonDTO): Promise<Season> {
        if (!data.season_name || data.season_name.trim() === '') {
            throw new Error('Season name is required');
        }
        if (!data.start_date) {
            throw new Error('Start date is required');
        }
        if (!data.status) {
            throw new Error('Status is required');
        }
        return this.seasonRepo.create(data);
    }

    async updateSeason(id: string, data: UpdateSeasonDTO): Promise<Season | null> {
        if (!id || id.trim() === '') {
            throw new Error('Season ID is required');
        }
        const existing = await this.seasonRepo.findById(id);
        if (!existing) {
            throw new Error(\`Season with ID '\${id}' not found\`);
        }
        return this.seasonRepo.update(id, data);
    }

    async deleteSeason(id: string): Promise<boolean> {
        if (!id || id.trim() === '') {
            throw new Error('Season ID is required');
        }
        const existing = await this.seasonRepo.findById(id);
        if (!existing) {
            throw new Error(\`Season with ID '\${id}' not found\`);
        }
        return this.seasonRepo.delete(id);
    }
}
`,

    [path.join(baseDir, 'src/presentation/controllers/SeasonController.ts')]: `import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { SeasonService } from '../../domain/services/SeasonService';
import { TYPES } from '../../core/types';

@injectable()
export class SeasonController {
    constructor(
        @inject(TYPES.SeasonService) private seasonService: SeasonService
    ) {}

    getAll = async (_req: Request, res: Response): Promise<void> => {
        try {
            const seasons = await this.seasonService.getAllSeasons();
            res.json({ success: true, data: seasons });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    getOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const season = await this.seasonService.getSeason(req.params.id);
            if (!season) {
                res.status(404).json({ success: false, message: 'Season not found' });
                return;
            }
            res.json({ success: true, data: season });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    getActive = async (_req: Request, res: Response): Promise<void> => {
        try {
            const season = await this.seasonService.getActiveSeason();
            res.json({ success: true, data: season });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const season = await this.seasonService.createSeason(req.body);
            res.status(201).json({ success: true, data: season });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const season = await this.seasonService.updateSeason(req.params.id, req.body);
            res.json({ success: true, data: season });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.seasonService.deleteSeason(req.params.id);
            res.json({ success: true, message: 'Season deleted successfully' });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };
}
`
};

writeModule('Season', seasonFiles);

console.log('✅ Transaction module implemented!');
console.log('✅ Season module implemented!');
console.log('\n🎉 Master script completed!');
console.log('\n📝 Summary:');
console.log('  ✅ Partner (already done)');
console.log('  ✅ WorkSchedule (already done)');
console.log('  ✅ Inventory (already done)');
console.log('  ✅ Transaction (just implemented)');
console.log('  ✅ Season (just implemented)');
console.log('  ⚠️  Payroll (need to implement)');
console.log('  ⚠️  JobType (need to implement)');
console.log('  ⚠️  WorkShift (need to implement)');
console.log('  ⚠️  WarehouseType (need to implement)');
console.log('\n📊 Progress: 5/9 modules (56%)');
