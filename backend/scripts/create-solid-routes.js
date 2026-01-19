const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');

console.log('🚀 Creating SOLID routes for all modules...\n');

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
    const routeContent = `import { Router } from 'express';
import { container } from '../../core/container';
import { ${module}Controller } from '../../presentation/controllers/${module}Controller';
import { TYPES } from '../../core/types';

/**
 * ${module} Routes - SOLID Version
 * Uses Dependency Injection
 */
const router = Router();

// Resolve controller from DI container
const controller = container.get<${module}Controller>(TYPES.${module}Controller);

// Routes
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
`;

    const filename = path.join(baseDir, `src/routes/solid/${module.toLowerCase()}.routes.ts`);
    const dir = path.dirname(filename);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filename, routeContent);
    console.log(`✅ ${module.toLowerCase()}.routes.ts`);
});

// Create index file
const indexContent = `import { Router } from 'express';
import partnerRoutes from './partner.routes';
import workscheduleRoutes from './workschedule.routes';
import inventoryRoutes from './inventory.routes';
import transactionRoutes from './transaction.routes';
import seasonRoutes from './season.routes';
import payrollRoutes from './payroll.routes';
import jobtypeRoutes from './jobtype.routes';
import workshiftRoutes from './workshift.routes';
import warehousetypeRoutes from './warehousetype.routes';

/**
 * SOLID Routes Index
 * All routes using SOLID architecture with DI
 */
const router = Router();

router.use('/partners', partnerRoutes);
router.use('/work-schedules', workscheduleRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/seasons', seasonRoutes);
router.use('/payrolls', payrollRoutes);
router.use('/job-types', jobtypeRoutes);
router.use('/work-shifts', workshiftRoutes);
router.use('/warehouse-types', warehousetypeRoutes);

export default router;
`;

fs.writeFileSync(path.join(baseDir, 'src/routes/solid/index.ts'), indexContent);
console.log('✅ index.ts\n');

console.log('🎉 All SOLID routes created!');
console.log('\n📝 Next step: Add to server.ts:');
console.log('   import solidRoutes from \'./routes/solid\';');
console.log('   app.use(\'/api/solid\', solidRoutes);');
