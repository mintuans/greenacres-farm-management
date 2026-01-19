const fs = require('fs');
const path = require('path');

// Modules cần generate
const modules = [
    { name: 'WorkSchedule', table: 'work_schedules' },
    { name: 'Inventory', table: 'inventory' },
    { name: 'Transaction', table: 'transactions' },
    { name: 'Season', table: 'seasons' },
    { name: 'Payroll', table: 'payrolls' },
    { name: 'JobType', table: 'job_types' },
    { name: 'WorkShift', table: 'work_shifts' },
    { name: 'WarehouseType', table: 'warehouse_types' },
];

const baseDir = path.join(__dirname, '..');

console.log('🚀 Generating SOLID modules...\n');

modules.forEach(module => {
    console.log(`📦 ${module.name}...`);

    // 1. Entity
    const entityContent = `export interface ${module.name} {
    id: string;
    [key: string]: any;
}

export interface Create${module.name}DTO {
    [key: string]: any;
}

export interface Update${module.name}DTO {
    [key: string]: any;
}
`;

    // 2. Repository Interface
    const repoInterfaceContent = `import { IRepository } from '../../core/interfaces/IRepository';
import { ${module.name} } from '../entities/${module.name}';

export interface I${module.name}Repository extends IRepository<${module.name}> {
}
`;

    // 3. Repository Implementation
    const repoImplContent = `import { injectable, inject } from 'inversify';
import { IDatabase } from '../../../core/interfaces/IDatabase';
import { I${module.name}Repository } from '../../../domain/repositories/I${module.name}Repository';
import { ${module.name} } from '../../../domain/entities/${module.name}';
import { TYPES } from '../../../core/types';

@injectable()
export class ${module.name}Repository implements I${module.name}Repository {
    constructor(@inject(TYPES.IDatabase) private db: IDatabase) {}

    async findById(id: string): Promise<${module.name} | null> {
        const result = await this.db.query<${module.name}>(
            'SELECT * FROM ${module.table} WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async findAll(): Promise<${module.name}[]> {
        const result = await this.db.query<${module.name}>(
            'SELECT * FROM ${module.table} ORDER BY created_at DESC'
        );
        return result.rows;
    }

    async create(data: Partial<${module.name}>): Promise<${module.name}> {
        // Implement based on table structure
        throw new Error('Not implemented');
    }

    async update(id: string, data: Partial<${module.name}>): Promise<${module.name} | null> {
        // Implement based on table structure
        throw new Error('Not implemented');
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.query(
            'DELETE FROM ${module.table} WHERE id = $1',
            [id]
        );
        return result.rowCount > 0;
    }
}
`;

    // 4. Service
    const serviceContent = `import { injectable, inject } from 'inversify';
import { I${module.name}Repository } from '../repositories/I${module.name}Repository';
import { ${module.name}, Create${module.name}DTO, Update${module.name}DTO } from '../entities/${module.name}';
import { TYPES } from '../../core/types';

@injectable()
export class ${module.name}Service {
    constructor(
        @inject(TYPES.I${module.name}Repository) private repo: I${module.name}Repository
    ) {}

    async get${module.name}(id: string): Promise<${module.name} | null> {
        return this.repo.findById(id);
    }

    async getAll${module.name}s(): Promise<${module.name}[]> {
        return this.repo.findAll();
    }

    async create${module.name}(data: Create${module.name}DTO): Promise<${module.name}> {
        return this.repo.create(data);
    }

    async update${module.name}(id: string, data: Update${module.name}DTO): Promise<${module.name} | null> {
        return this.repo.update(id, data);
    }

    async delete${module.name}(id: string): Promise<boolean> {
        return this.repo.delete(id);
    }
}
`;

    // 5. Controller
    const controllerContent = `import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { ${module.name}Service } from '../../domain/services/${module.name}Service';
import { TYPES } from '../../core/types';

@injectable()
export class ${module.name}Controller {
    constructor(
        @inject(TYPES.${module.name}Service) private service: ${module.name}Service
    ) {}

    getAll = async (_req: Request, res: Response): Promise<void> => {
        try {
            const items = await this.service.getAll${module.name}s();
            res.json({ success: true, data: items });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    getOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const item = await this.service.get${module.name}(req.params.id);
            if (!item) {
                res.status(404).json({ success: false, message: 'Not found' });
                return;
            }
            res.json({ success: true, data: item });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const item = await this.service.create${module.name}(req.body);
            res.status(201).json({ success: true, data: item });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const item = await this.service.update${module.name}(req.params.id, req.body);
            res.json({ success: true, data: item });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.service.delete${module.name}(req.params.id);
            res.json({ success: true, message: 'Deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}
`;

    // Write files
    const files = [
        { path: `src/domain/entities/${module.name}.ts`, content: entityContent },
        { path: `src/domain/repositories/I${module.name}Repository.ts`, content: repoInterfaceContent },
        { path: `src/infrastructure/database/repositories/${module.name}Repository.ts`, content: repoImplContent },
        { path: `src/domain/services/${module.name}Service.ts`, content: serviceContent },
        { path: `src/presentation/controllers/${module.name}Controller.ts`, content: controllerContent },
    ];

    files.forEach(file => {
        const fullPath = path.join(baseDir, file.path);
        const dir = path.dirname(fullPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(fullPath, file.content);
        console.log(`  ✅ ${path.basename(file.path)}`);
    });

    console.log('');
});

console.log('🎉 Done! Generated files for all modules.');
console.log('\n📝 Next: Update core/types.ts and core/container.ts');
