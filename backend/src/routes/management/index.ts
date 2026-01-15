import { Router } from 'express';
import productsRoutes from './products.routes';
import mediaRoutes from './media.routes';
import blogRoutes from './blog.routes';
import partnerRoutes from '../partner.routes';
import productionUnitRoutes from '../production-unit.routes';
import seasonRoutes from '../season.routes';
import categoryRoutes from '../category.routes';
import workShiftRoutes from '../work-shift.routes';
import jobTypeRoutes from '../job-type.routes';
import inventoryRoutes from '../inventory.routes';
import workScheduleRoutes from './work-schedule.routes';
import farmEventRoutes from './farm-event.routes';
import transactionRoutes from './transaction.routes';
import warehouseRoutes from './warehouse.routes';
import dailyWorkLogRoutes from './daily-work-log.routes';
import warehouseTypeRoutes from './warehouse-type.routes';
import inventoryUsageRoutes from '../inventory-usage.routes';
import payrollRoutes from '../payroll.routes';
import publicUserRoutes from './public-user.routes';
import roleRoutes from './role.routes';
import permissionRoutes from './permission.routes';
import auditLogRoutes from './audit-log.routes';
import scheduleRoutes from './schedule.routes';
import dashboardRoutes from './dashboard.routes';


const router = Router();

router.use('/warehouse-items', warehouseRoutes);

console.log('🔧 Management routes loaded!');
console.log('📦 Partner routes:', typeof partnerRoutes);
console.log('📦 Production Unit routes:', typeof productionUnitRoutes);
console.log('📦 Season routes:', typeof seasonRoutes);
console.log('📦 Category routes:', typeof categoryRoutes);

// Mount routes
router.use('/products', productsRoutes);
router.use('/media', mediaRoutes);
router.use('/blog', blogRoutes);

// Farm management routes
router.use('/partners', partnerRoutes);
router.use('/production-units', productionUnitRoutes);
router.use('/seasons', seasonRoutes);
router.use('/categories', categoryRoutes);
router.use('/work-shifts', workShiftRoutes);
router.use('/job-types', jobTypeRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/work-schedules', workScheduleRoutes);
router.use('/farm-events', farmEventRoutes);
router.use('/transactions', transactionRoutes);
router.use('/daily-work-logs', dailyWorkLogRoutes);
router.use('/warehouse-types', warehouseTypeRoutes);
router.use('/inventory-usage', inventoryUsageRoutes);
router.use('/payrolls', payrollRoutes);

// System settings
router.use('/users', publicUserRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/dashboard', dashboardRoutes);


export default router;
