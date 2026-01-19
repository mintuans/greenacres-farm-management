import { Router } from 'express';
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
