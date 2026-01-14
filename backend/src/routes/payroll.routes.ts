
import { Router } from 'express';
import * as payrollController from '../controllers/management/payroll.controller';

const router = Router();

router.get('/season/:seasonId', payrollController.getPayrollsBySeason);

export default router;
