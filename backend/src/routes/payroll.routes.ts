
import { Router } from 'express';
import * as payrollController from '../controllers/management/payroll.controller';

const router = Router();

// GET routes
router.get('/', payrollController.getAllPayrolls);
router.get('/stats', payrollController.getPayrollStats);
router.get('/season/:seasonId', payrollController.getPayrollsBySeason);
router.get('/partner/:partnerId', payrollController.getPayrollsByPartner);
router.get('/:id', payrollController.getPayrollById);

// POST routes
router.post('/', payrollController.createPayroll);

// PUT routes
router.put('/:id', payrollController.updatePayroll);
router.put('/:id/status', payrollController.updatePayrollStatus); // Quan trọng: Trigger tự động tạo transaction

// DELETE routes
router.delete('/:id', payrollController.deletePayroll);

export default router;
