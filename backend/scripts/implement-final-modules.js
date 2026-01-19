const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');

console.log('🚀 FINAL SCRIPT - Implementing last 4 modules...\n');
console.log('📋 Modules: Payroll, JobType, WorkShift, WarehouseType\n');

function writeModule(moduleName, files) {
    console.log(`📦 Implementing ${moduleName}...`);
    Object.entries(files).forEach(([filename, content]) => {
        fs.writeFileSync(filename, content);
        console.log(`  ✅ ${path.basename(filename)}`);
    });
    console.log('');
}

// ==================== PAYROLL ====================
const payrollFiles = {
    [path.join(baseDir, 'src/domain/entities/Payroll.ts')]: `export interface Payroll {
    id: string;
    payroll_code: string;
    partner_id: string;
    partner_name?: string;
    total_amount: number;
    bonus: number;
    deductions: number;
    final_amount: number;
    status: 'DRAFT' | 'APPROVED' | 'PAID';
    transaction_id?: string;
    payment_date?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreatePayrollDTO {
    payroll_code: string;
    partner_id: string;
    total_amount?: number;
    bonus?: number;
    deductions?: number;
    final_amount: number;
    status?: 'DRAFT' | 'APPROVED' | 'PAID';
    payment_date?: string;
}

export interface UpdatePayrollDTO {
    total_amount?: number;
    bonus?: number;
    deductions?: number;
    final_amount?: number;
    status?: 'DRAFT' | 'APPROVED' | 'PAID';
    payment_date?: string;
}
`,

    [path.join(baseDir, 'src/domain/repositories/IPayrollRepository.ts')]: `import { IRepository } from '../../core/interfaces/IRepository';
import { Payroll } from '../entities/Payroll';

export interface IPayrollRepository extends IRepository<Payroll> {
    findByPartner(partnerId: string): Promise<Payroll[]>;
    findBySeason(seasonId: string): Promise<Payroll[]>;
    updateStatus(id: string, status: string, paymentDate?: string): Promise<Payroll | null>;
    getStats(): Promise<any>;
}
`,

    [path.join(baseDir, 'src/infrastructure/database/repositories/PayrollRepository.ts')]: `import { injectable, inject } from 'inversify';
import { IDatabase } from '../../../core/interfaces/IDatabase';
import { IPayrollRepository } from '../../../domain/repositories/IPayrollRepository';
import { Payroll } from '../../../domain/entities/Payroll';
import { TYPES } from '../../../core/types';

@injectable()
export class PayrollRepository implements IPayrollRepository {
    constructor(@inject(TYPES.IDatabase) private db: IDatabase) {}

    async findById(id: string): Promise<Payroll | null> {
        const query = \`
            SELECT p.*, pt.partner_name
            FROM payrolls p
            JOIN partners pt ON p.partner_id = pt.id
            WHERE p.id = $1
        \`;
        const result = await this.db.query<Payroll>(query, [id]);
        return result.rows[0] || null;
    }

    async findAll(): Promise<Payroll[]> {
        const query = \`
            SELECT p.*, pt.partner_name
            FROM payrolls p
            JOIN partners pt ON p.partner_id = pt.id
            ORDER BY p.created_at DESC
        \`;
        const result = await this.db.query<Payroll>(query);
        return result.rows;
    }

    async findByPartner(partnerId: string): Promise<Payroll[]> {
        const query = \`
            SELECT p.*, pt.partner_name
            FROM payrolls p
            JOIN partners pt ON p.partner_id = pt.id
            WHERE p.partner_id = $1
            ORDER BY p.created_at DESC
        \`;
        const result = await this.db.query<Payroll>(query, [partnerId]);
        return result.rows;
    }

    async findBySeason(seasonId: string): Promise<Payroll[]> {
        const query = \`
            SELECT DISTINCT p.*, pt.partner_name
            FROM payrolls p
            JOIN partners pt ON p.partner_id = pt.id
            JOIN daily_work_logs dl ON p.id = dl.payroll_id
            WHERE dl.season_id = $1
            ORDER BY p.created_at DESC
        \`;
        const result = await this.db.query<Payroll>(query, [seasonId]);
        return result.rows;
    }

    async updateStatus(id: string, status: string, paymentDate?: string): Promise<Payroll | null> {
        const query = \`
            UPDATE payrolls 
            SET status = $1, 
                payment_date = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 
            RETURNING *
        \`;
        const values = [status, paymentDate || new Date().toISOString(), id];
        const result = await this.db.query<Payroll>(query, values);
        return result.rows[0];
    }

    async getStats(): Promise<any> {
        const query = \`
            SELECT 
                COUNT(*) as total_payrolls,
                COUNT(CASE WHEN status = 'DRAFT' THEN 1 END) as draft_count,
                COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paid_count,
                COALESCE(SUM(CASE WHEN status = 'PAID' THEN final_amount ELSE 0 END), 0) as total_paid_amount,
                COALESCE(SUM(CASE WHEN status IN ('DRAFT', 'APPROVED') THEN final_amount ELSE 0 END), 0) as pending_amount
            FROM payrolls
        \`;
        const result = await this.db.query(query);
        return result.rows[0];
    }

    async create(data: Partial<Payroll>): Promise<Payroll> {
        const query = \`
            INSERT INTO payrolls (
                payroll_code, partner_id, total_amount, bonus, 
                deductions, final_amount, status, payment_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        \`;
        const values = [
            data.payroll_code,
            data.partner_id,
            data.total_amount || 0,
            data.bonus || 0,
            data.deductions || 0,
            data.final_amount,
            data.status || 'DRAFT',
            data.payment_date || null
        ];
        const result = await this.db.query<Payroll>(query, values);
        return result.rows[0];
    }

    async update(id: string, data: Partial<Payroll>): Promise<Payroll | null> {
        const fields = ['total_amount', 'bonus', 'deductions', 'final_amount', 'status', 'payment_date'];
        const values: any[] = [];
        const setClauses = fields
            .map((field) => {
                if (data[field as keyof Payroll] !== undefined) {
                    values.push(data[field as keyof Payroll]);
                    return \`\${field} = $\${values.length}\`;
                }
                return null;
            })
            .filter(Boolean);

        if (setClauses.length === 0) return null;

        values.push(id);
        const query = \`
            UPDATE payrolls 
            SET \${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $\${values.length} 
            RETURNING *
        \`;
        const result = await this.db.query<Payroll>(query, values);
        return result.rows[0];
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.query('DELETE FROM payrolls WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}
`,

    [path.join(baseDir, 'src/domain/services/PayrollService.ts')]: `import { injectable, inject } from 'inversify';
import { IPayrollRepository } from '../repositories/IPayrollRepository';
import { Payroll, CreatePayrollDTO, UpdatePayrollDTO } from '../entities/Payroll';
import { TYPES } from '../../core/types';

@injectable()
export class PayrollService {
    constructor(
        @inject(TYPES.IPayrollRepository) private payrollRepo: IPayrollRepository
    ) {}

    async getPayroll(id: string): Promise<Payroll | null> {
        if (!id || id.trim() === '') {
            throw new Error('Payroll ID is required');
        }
        return this.payrollRepo.findById(id);
    }

    async getAllPayrolls(): Promise<Payroll[]> {
        return this.payrollRepo.findAll();
    }

    async getPayrollsByPartner(partnerId: string): Promise<Payroll[]> {
        if (!partnerId || partnerId.trim() === '') {
            throw new Error('Partner ID is required');
        }
        return this.payrollRepo.findByPartner(partnerId);
    }

    async getPayrollsBySeason(seasonId: string): Promise<Payroll[]> {
        if (!seasonId || seasonId.trim() === '') {
            throw new Error('Season ID is required');
        }
        return this.payrollRepo.findBySeason(seasonId);
    }

    async getPayrollStats(): Promise<any> {
        return this.payrollRepo.getStats();
    }

    async createPayroll(data: CreatePayrollDTO): Promise<Payroll> {
        if (!data.payroll_code || data.payroll_code.trim() === '') {
            throw new Error('Payroll code is required');
        }
        if (!data.partner_id || data.partner_id.trim() === '') {
            throw new Error('Partner ID is required');
        }
        if (!data.final_amount || data.final_amount < 0) {
            throw new Error('Final amount must be greater than or equal to 0');
        }
        return this.payrollRepo.create(data);
    }

    async updatePayroll(id: string, data: UpdatePayrollDTO): Promise<Payroll | null> {
        if (!id || id.trim() === '') {
            throw new Error('Payroll ID is required');
        }
        const existing = await this.payrollRepo.findById(id);
        if (!existing) {
            throw new Error(\`Payroll with ID '\${id}' not found\`);
        }
        return this.payrollRepo.update(id, data);
    }

    async updatePayrollStatus(id: string, status: string, paymentDate?: string): Promise<Payroll | null> {
        if (!id || id.trim() === '') {
            throw new Error('Payroll ID is required');
        }
        const existing = await this.payrollRepo.findById(id);
        if (!existing) {
            throw new Error(\`Payroll with ID '\${id}' not found\`);
        }
        return this.payrollRepo.updateStatus(id, status, paymentDate);
    }

    async deletePayroll(id: string): Promise<boolean> {
        if (!id || id.trim() === '') {
            throw new Error('Payroll ID is required');
        }
        const existing = await this.payrollRepo.findById(id);
        if (!existing) {
            throw new Error(\`Payroll with ID '\${id}' not found\`);
        }
        return this.payrollRepo.delete(id);
    }
}
`,

    [path.join(baseDir, 'src/presentation/controllers/PayrollController.ts')]: `import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { PayrollService } from '../../domain/services/PayrollService';
import { TYPES } from '../../core/types';

@injectable()
export class PayrollController {
    constructor(
        @inject(TYPES.PayrollService) private payrollService: PayrollService
    ) {}

    getAll = async (_req: Request, res: Response): Promise<void> => {
        try {
            const payrolls = await this.payrollService.getAllPayrolls();
            res.json({ success: true, data: payrolls });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    getOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const payroll = await this.payrollService.getPayroll(req.params.id);
            if (!payroll) {
                res.status(404).json({ success: false, message: 'Payroll not found' });
                return;
            }
            res.json({ success: true, data: payroll });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    getStats = async (_req: Request, res: Response): Promise<void> => {
        try {
            const stats = await this.payrollService.getPayrollStats();
            res.json({ success: true, data: stats });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const payroll = await this.payrollService.createPayroll(req.body);
            res.status(201).json({ success: true, data: payroll });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const payroll = await this.payrollService.updatePayroll(req.params.id, req.body);
            res.json({ success: true, data: payroll });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };

    updateStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const { status, payment_date } = req.body;
            const payroll = await this.payrollService.updatePayrollStatus(req.params.id, status, payment_date);
            res.json({ success: true, data: payroll });
        } catch (error: any) {
            const statusCode = error.message.includes('not found') ? 404 : 400;
            res.status(statusCode).json({ success: false, message: error.message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.payrollService.deletePayroll(req.params.id);
            res.json({ success: true, message: 'Payroll deleted successfully' });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };
}
`
};

writeModule('Payroll', payrollFiles);

// ==================== JOBTYPE ====================
const jobTypeFiles = {
    [path.join(baseDir, 'src/domain/entities/JobType.ts')]: `export interface JobType {
    id: string;
    job_name: string;
    description?: string;
    created_at?: Date;
}

export interface CreateJobTypeDTO {
    job_name: string;
    description?: string;
}

export interface UpdateJobTypeDTO {
    job_name?: string;
    description?: string;
}
`,

    [path.join(baseDir, 'src/domain/repositories/IJobTypeRepository.ts')]: `import { IRepository } from '../../core/interfaces/IRepository';
import { JobType } from '../entities/JobType';

export interface IJobTypeRepository extends IRepository<JobType> {
}
`,

    [path.join(baseDir, 'src/infrastructure/database/repositories/JobTypeRepository.ts')]: `import { injectable, inject } from 'inversify';
import { IDatabase } from '../../../core/interfaces/IDatabase';
import { IJobTypeRepository } from '../../../domain/repositories/IJobTypeRepository';
import { JobType } from '../../../domain/entities/JobType';
import { TYPES } from '../../../core/types';

@injectable()
export class JobTypeRepository implements IJobTypeRepository {
    constructor(@inject(TYPES.IDatabase) private db: IDatabase) {}

    async findById(id: string): Promise<JobType | null> {
        const result = await this.db.query<JobType>(
            'SELECT * FROM job_types WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async findAll(): Promise<JobType[]> {
        const result = await this.db.query<JobType>(
            'SELECT * FROM job_types ORDER BY job_name ASC'
        );
        return result.rows;
    }

    async create(data: Partial<JobType>): Promise<JobType> {
        const query = 'INSERT INTO job_types (job_name, description) VALUES ($1, $2) RETURNING *';
        const values = [data.job_name, data.description];
        const result = await this.db.query<JobType>(query, values);
        return result.rows[0];
    }

    async update(id: string, data: Partial<JobType>): Promise<JobType | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.job_name !== undefined) {
            fields.push(\`job_name = $\${paramIndex++}\`);
            values.push(data.job_name);
        }
        if (data.description !== undefined) {
            fields.push(\`description = $\${paramIndex++}\`);
            values.push(data.description);
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const query = \`UPDATE job_types SET \${fields.join(', ')} WHERE id = $\${paramIndex} RETURNING *\`;
        const result = await this.db.query<JobType>(query, values);
        return result.rows[0] || null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.query('DELETE FROM job_types WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}
`,

    [path.join(baseDir, 'src/domain/services/JobTypeService.ts')]: `import { injectable, inject } from 'inversify';
import { IJobTypeRepository } from '../repositories/IJobTypeRepository';
import { JobType, CreateJobTypeDTO, UpdateJobTypeDTO } from '../entities/JobType';
import { TYPES } from '../../core/types';

@injectable()
export class JobTypeService {
    constructor(
        @inject(TYPES.IJobTypeRepository) private jobTypeRepo: IJobTypeRepository
    ) {}

    async getJobType(id: string): Promise<JobType | null> {
        if (!id || id.trim() === '') {
            throw new Error('JobType ID is required');
        }
        return this.jobTypeRepo.findById(id);
    }

    async getAllJobTypes(): Promise<JobType[]> {
        return this.jobTypeRepo.findAll();
    }

    async createJobType(data: CreateJobTypeDTO): Promise<JobType> {
        if (!data.job_name || data.job_name.trim() === '') {
            throw new Error('Job name is required');
        }
        return this.jobTypeRepo.create(data);
    }

    async updateJobType(id: string, data: UpdateJobTypeDTO): Promise<JobType | null> {
        if (!id || id.trim() === '') {
            throw new Error('JobType ID is required');
        }
        const existing = await this.jobTypeRepo.findById(id);
        if (!existing) {
            throw new Error(\`JobType with ID '\${id}' not found\`);
        }
        return this.jobTypeRepo.update(id, data);
    }

    async deleteJobType(id: string): Promise<boolean> {
        if (!id || id.trim() === '') {
            throw new Error('JobType ID is required');
        }
        const existing = await this.jobTypeRepo.findById(id);
        if (!existing) {
            throw new Error(\`JobType with ID '\${id}' not found\`);
        }
        return this.jobTypeRepo.delete(id);
    }
}
`,

    [path.join(baseDir, 'src/presentation/controllers/JobTypeController.ts')]: `import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { JobTypeService } from '../../domain/services/JobTypeService';
import { TYPES } from '../../core/types';

@injectable()
export class JobTypeController {
    constructor(
        @inject(TYPES.JobTypeService) private jobTypeService: JobTypeService
    ) {}

    getAll = async (_req: Request, res: Response): Promise<void> => {
        try {
            const jobTypes = await this.jobTypeService.getAllJobTypes();
            res.json({ success: true, data: jobTypes });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    getOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const jobType = await this.jobTypeService.getJobType(req.params.id);
            if (!jobType) {
                res.status(404).json({ success: false, message: 'Job type not found' });
                return;
            }
            res.json({ success: true, data: jobType });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const jobType = await this.jobTypeService.createJobType(req.body);
            res.status(201).json({ success: true, data: jobType });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const jobType = await this.jobTypeService.updateJobType(req.params.id, req.body);
            res.json({ success: true, data: jobType });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.jobTypeService.deleteJobType(req.params.id);
            res.json({ success: true, message: 'Job type deleted successfully' });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };
}
`
};

writeModule('JobType', jobTypeFiles);

// ==================== WORKSHIFT ====================
const workShiftFiles = {
    [path.join(baseDir, 'src/domain/entities/WorkShift.ts')]: `export interface WorkShift {
    id: string;
    shift_name: string;
    start_time: string;
    end_time: string;
    description?: string;
    created_at?: Date;
}

export interface CreateWorkShiftDTO {
    shift_name: string;
    start_time: string;
    end_time: string;
    description?: string;
}

export interface UpdateWorkShiftDTO {
    shift_name?: string;
    start_time?: string;
    end_time?: string;
    description?: string;
}
`,

    [path.join(baseDir, 'src/domain/repositories/IWorkShiftRepository.ts')]: `import { IRepository } from '../../core/interfaces/IRepository';
import { WorkShift } from '../entities/WorkShift';

export interface IWorkShiftRepository extends IRepository<WorkShift> {
}
`,

    [path.join(baseDir, 'src/infrastructure/database/repositories/WorkShiftRepository.ts')]: `import { injectable, inject } from 'inversify';
import { IDatabase } from '../../../core/interfaces/IDatabase';
import { IWorkShiftRepository } from '../../../domain/repositories/IWorkShiftRepository';
import { WorkShift } from '../../../domain/entities/WorkShift';
import { TYPES } from '../../../core/types';

@injectable()
export class WorkShiftRepository implements IWorkShiftRepository {
    constructor(@inject(TYPES.IDatabase) private db: IDatabase) {}

    async findById(id: string): Promise<WorkShift | null> {
        const result = await this.db.query<WorkShift>(
            'SELECT * FROM work_shifts WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async findAll(): Promise<WorkShift[]> {
        const result = await this.db.query<WorkShift>(
            'SELECT * FROM work_shifts ORDER BY start_time ASC'
        );
        return result.rows;
    }

    async create(data: Partial<WorkShift>): Promise<WorkShift> {
        const query = \`
            INSERT INTO work_shifts (shift_name, start_time, end_time, description)
            VALUES ($1, $2, $3, $4) RETURNING *
        \`;
        const values = [data.shift_name, data.start_time, data.end_time, data.description];
        const result = await this.db.query<WorkShift>(query, values);
        return result.rows[0];
    }

    async update(id: string, data: Partial<WorkShift>): Promise<WorkShift | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        const allowedFields = ['shift_name', 'start_time', 'end_time', 'description'];
        for (const key of allowedFields) {
            if (data[key as keyof WorkShift] !== undefined) {
                fields.push(\`\${key} = $\${paramIndex++}\`);
                values.push(data[key as keyof WorkShift]);
            }
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const query = \`UPDATE work_shifts SET \${fields.join(', ')} WHERE id = $\${paramIndex} RETURNING *\`;
        const result = await this.db.query<WorkShift>(query, values);
        return result.rows[0] || null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.query('DELETE FROM work_shifts WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}
`,

    [path.join(baseDir, 'src/domain/services/WorkShiftService.ts')]: `import { injectable, inject } from 'inversify';
import { IWorkShiftRepository } from '../repositories/IWorkShiftRepository';
import { WorkShift, CreateWorkShiftDTO, UpdateWorkShiftDTO } from '../entities/WorkShift';
import { TYPES } from '../../core/types';

@injectable()
export class WorkShiftService {
    constructor(
        @inject(TYPES.IWorkShiftRepository) private workShiftRepo: IWorkShiftRepository
    ) {}

    async getWorkShift(id: string): Promise<WorkShift | null> {
        if (!id || id.trim() === '') {
            throw new Error('WorkShift ID is required');
        }
        return this.workShiftRepo.findById(id);
    }

    async getAllWorkShifts(): Promise<WorkShift[]> {
        return this.workShiftRepo.findAll();
    }

    async createWorkShift(data: CreateWorkShiftDTO): Promise<WorkShift> {
        if (!data.shift_name || data.shift_name.trim() === '') {
            throw new Error('Shift name is required');
        }
        if (!data.start_time) {
            throw new Error('Start time is required');
        }
        if (!data.end_time) {
            throw new Error('End time is required');
        }
        return this.workShiftRepo.create(data);
    }

    async updateWorkShift(id: string, data: UpdateWorkShiftDTO): Promise<WorkShift | null> {
        if (!id || id.trim() === '') {
            throw new Error('WorkShift ID is required');
        }
        const existing = await this.workShiftRepo.findById(id);
        if (!existing) {
            throw new Error(\`WorkShift with ID '\${id}' not found\`);
        }
        return this.workShiftRepo.update(id, data);
    }

    async deleteWorkShift(id: string): Promise<boolean> {
        if (!id || id.trim() === '') {
            throw new Error('WorkShift ID is required');
        }
        const existing = await this.workShiftRepo.findById(id);
        if (!existing) {
            throw new Error(\`WorkShift with ID '\${id}' not found\`);
        }
        return this.workShiftRepo.delete(id);
    }
}
`,

    [path.join(baseDir, 'src/presentation/controllers/WorkShiftController.ts')]: `import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { WorkShiftService } from '../../domain/services/WorkShiftService';
import { TYPES } from '../../core/types';

@injectable()
export class WorkShiftController {
    constructor(
        @inject(TYPES.WorkShiftService) private workShiftService: WorkShiftService
    ) {}

    getAll = async (_req: Request, res: Response): Promise<void> => {
        try {
            const shifts = await this.workShiftService.getAllWorkShifts();
            res.json({ success: true, data: shifts });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    getOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const shift = await this.workShiftService.getWorkShift(req.params.id);
            if (!shift) {
                res.status(404).json({ success: false, message: 'Work shift not found' });
                return;
            }
            res.json({ success: true, data: shift });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const shift = await this.workShiftService.createWorkShift(req.body);
            res.status(201).json({ success: true, data: shift });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const shift = await this.workShiftService.updateWorkShift(req.params.id, req.body);
            res.json({ success: true, data: shift });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.workShiftService.deleteWorkShift(req.params.id);
            res.json({ success: true, message: 'Work shift deleted successfully' });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };
}
`
};

writeModule('WorkShift', workShiftFiles);

// ==================== WAREHOUSETYPE ====================
const warehouseTypeFiles = {
    [path.join(baseDir, 'src/domain/entities/WarehouseType.ts')]: `export interface WarehouseType {
    id: string;
    type_name: string;
    description?: string;
    created_at?: Date;
}

export interface CreateWarehouseTypeDTO {
    type_name: string;
    description?: string;
}

export interface UpdateWarehouseTypeDTO {
    type_name?: string;
    description?: string;
}
`,

    [path.join(baseDir, 'src/domain/repositories/IWarehouseTypeRepository.ts')]: `import { IRepository } from '../../core/interfaces/IRepository';
import { WarehouseType } from '../entities/WarehouseType';

export interface IWarehouseTypeRepository extends IRepository<WarehouseType> {
}
`,

    [path.join(baseDir, 'src/infrastructure/database/repositories/WarehouseTypeRepository.ts')]: `import { injectable, inject } from 'inversify';
import { IDatabase } from '../../../core/interfaces/IDatabase';
import { IWarehouseTypeRepository } from '../../../domain/repositories/IWarehouseTypeRepository';
import { WarehouseType } from '../../../domain/entities/WarehouseType';
import { TYPES } from '../../../core/types';

@injectable()
export class WarehouseTypeRepository implements IWarehouseTypeRepository {
    constructor(@inject(TYPES.IDatabase) private db: IDatabase) {}

    async findById(id: string): Promise<WarehouseType | null> {
        const result = await this.db.query<WarehouseType>(
            'SELECT * FROM warehouse_types WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async findAll(): Promise<WarehouseType[]> {
        const result = await this.db.query<WarehouseType>(
            'SELECT * FROM warehouse_types ORDER BY type_name ASC'
        );
        return result.rows;
    }

    async create(data: Partial<WarehouseType>): Promise<WarehouseType> {
        const query = 'INSERT INTO warehouse_types (type_name, description) VALUES ($1, $2) RETURNING *';
        const values = [data.type_name, data.description];
        const result = await this.db.query<WarehouseType>(query, values);
        return result.rows[0];
    }

    async update(id: string, data: Partial<WarehouseType>): Promise<WarehouseType | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.type_name !== undefined) {
            fields.push(\`type_name = $\${paramIndex++}\`);
            values.push(data.type_name);
        }
        if (data.description !== undefined) {
            fields.push(\`description = $\${paramIndex++}\`);
            values.push(data.description);
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const query = \`UPDATE warehouse_types SET \${fields.join(', ')} WHERE id = $\${paramIndex} RETURNING *\`;
        const result = await this.db.query<WarehouseType>(query, values);
        return result.rows[0] || null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.query('DELETE FROM warehouse_types WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}
`,

    [path.join(baseDir, 'src/domain/services/WarehouseTypeService.ts')]: `import { injectable, inject } from 'inversify';
import { IWarehouseTypeRepository } from '../repositories/IWarehouseTypeRepository';
import { WarehouseType, CreateWarehouseTypeDTO, UpdateWarehouseTypeDTO } from '../entities/WarehouseType';
import { TYPES } from '../../core/types';

@injectable()
export class WarehouseTypeService {
    constructor(
        @inject(TYPES.IWarehouseTypeRepository) private warehouseTypeRepo: IWarehouseTypeRepository
    ) {}

    async getWarehouseType(id: string): Promise<WarehouseType | null> {
        if (!id || id.trim() === '') {
            throw new Error('WarehouseType ID is required');
        }
        return this.warehouseTypeRepo.findById(id);
    }

    async getAllWarehouseTypes(): Promise<WarehouseType[]> {
        return this.warehouseTypeRepo.findAll();
    }

    async createWarehouseType(data: CreateWarehouseTypeDTO): Promise<WarehouseType> {
        if (!data.type_name || data.type_name.trim() === '') {
            throw new Error('Type name is required');
        }
        return this.warehouseTypeRepo.create(data);
    }

    async updateWarehouseType(id: string, data: UpdateWarehouseTypeDTO): Promise<WarehouseType | null> {
        if (!id || id.trim() === '') {
            throw new Error('WarehouseType ID is required');
        }
        const existing = await this.warehouseTypeRepo.findById(id);
        if (!existing) {
            throw new Error(\`WarehouseType with ID '\${id}' not found\`);
        }
        return this.warehouseTypeRepo.update(id, data);
    }

    async deleteWarehouseType(id: string): Promise<boolean> {
        if (!id || id.trim() === '') {
            throw new Error('WarehouseType ID is required');
        }
        const existing = await this.warehouseTypeRepo.findById(id);
        if (!existing) {
            throw new Error(\`WarehouseType with ID '\${id}' not found\`);
        }
        return this.warehouseTypeRepo.delete(id);
    }
}
`,

    [path.join(baseDir, 'src/presentation/controllers/WarehouseTypeController.ts')]: `import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { WarehouseTypeService } from '../../domain/services/WarehouseTypeService';
import { TYPES } from '../../core/types';

@injectable()
export class WarehouseTypeController {
    constructor(
        @inject(TYPES.WarehouseTypeService) private warehouseTypeService: WarehouseTypeService
    ) {}

    getAll = async (_req: Request, res: Response): Promise<void> => {
        try {
            const types = await this.warehouseTypeService.getAllWarehouseTypes();
            res.json({ success: true, data: types });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    getOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const type = await this.warehouseTypeService.getWarehouseType(req.params.id);
            if (!type) {
                res.status(404).json({ success: false, message: 'Warehouse type not found' });
                return;
            }
            res.json({ success: true, data: type });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const type = await this.warehouseTypeService.createWarehouseType(req.body);
            res.status(201).json({ success: true, data: type });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const type = await this.warehouseTypeService.updateWarehouseType(req.params.id, req.body);
            res.json({ success: true, data: type });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.warehouseTypeService.deleteWarehouseType(req.params.id);
            res.json({ success: true, message: 'Warehouse type deleted successfully' });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    };
}
`
};

writeModule('WarehouseType', warehouseTypeFiles);

console.log('🎉🎉🎉 ALL MODULES IMPLEMENTED! 🎉🎉🎉\n');
console.log('📊 Final Summary:');
console.log('  ✅ Partner');
console.log('  ✅ WorkSchedule');
console.log('  ✅ Inventory');
console.log('  ✅ Transaction');
console.log('  ✅ Season');
console.log('  ✅ Payroll');
console.log('  ✅ JobType');
console.log('  ✅ WorkShift');
console.log('  ✅ WarehouseType');
console.log('\n📈 Progress: 9/9 modules (100%) ✅');
console.log('\n🎯 Next steps:');
console.log('  1. DI Container is already configured');
console.log('  2. Test the implementation');
console.log('  3. Create routes for new modules');
console.log('\n✨ SOLID migration complete!');
