import { Router } from 'express';
import * as workShiftController from '../controllers/management/work-shift.controller';

const router = Router();

// CRUD routes
router.post('/', workShiftController.createWorkShift);
router.get('/', workShiftController.getWorkShifts);
router.get('/:id', workShiftController.getWorkShiftById);
router.put('/:id', workShiftController.updateWorkShift);
router.delete('/:id', workShiftController.deleteWorkShift);

export default router;
