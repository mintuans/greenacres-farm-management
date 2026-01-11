
import { Router } from 'express';
import * as dailyWorkLogController from '../../controllers/management/daily-work-log.controller';

const router = Router();

router.get('/', dailyWorkLogController.getDailyWorkLogs);
router.post('/', dailyWorkLogController.createDailyWorkLog);
router.put('/:id', dailyWorkLogController.updateDailyWorkLog);
router.delete('/:id', dailyWorkLogController.deleteDailyWorkLog);

// Stored procedure calls
router.post('/confirm-schedule', dailyWorkLogController.confirmScheduleToLog);
router.post('/calculate-payroll', dailyWorkLogController.calculatePayrollFromLog);
router.post('/calculate-payroll-bulk', dailyWorkLogController.calculatePayrollBulk);


export default router;
