const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');

console.log('🔧 Fixing SOLID routes - Lazy controller resolution...\n');

const modules = [
    'Partner',
    'WorkSchedule',
    'Inventory',
    'Transaction',
    'Season',
    'Payroll',
    'JobType',
    'WorkShift',
    'WarehouseType'
];

modules.forEach(module => {
    const routeContent = `import { Router, Request, Response } from 'express';
import { container } from '../../core/container';
import { ${module}Controller } from '../../presentation/controllers/${module}Controller';
import { TYPES } from '../../core/types';

/**
 * ${module} Routes - SOLID Version
 * Uses Dependency Injection with lazy controller resolution
 */
const router = Router();

// Helper to get controller (lazy resolution)
const getController = () => container.get<${module}Controller>(TYPES.${module}Controller);

// Routes - Controllers are resolved when route is called
router.get('/', (req: Request, res: Response) => getController().getAll(req, res));
router.get('/:id', (req: Request, res: Response) => getController().getOne(req, res));
router.post('/', (req: Request, res: Response) => getController().create(req, res));
router.put('/:id', (req: Request, res: Response) => getController().update(req, res));
router.delete('/:id', (req: Request, res: Response) => getController().delete(req, res));

export default router;
`;

    const filename = path.join(baseDir, `src/routes/solid/${module.toLowerCase()}.routes.ts`);
    fs.writeFileSync(filename, routeContent);
    console.log(`✅ ${module.toLowerCase()}.routes.ts`);
});

console.log('\n🎉 All routes fixed with lazy resolution!');
console.log('Controllers will be resolved when routes are called, not at import time.');
