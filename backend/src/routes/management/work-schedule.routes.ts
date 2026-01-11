import { Router } from 'express';
import * as workScheduleController from '../../controllers/management/work-schedule.controller';

const router = Router();

router.get('/', workScheduleController.getWorkSchedules);
router.post('/', workScheduleController.createWorkSchedule);
router.put('/:id', workScheduleController.updateWorkSchedule);
router.delete('/:id', workScheduleController.deleteWorkSchedule);

export default router;
