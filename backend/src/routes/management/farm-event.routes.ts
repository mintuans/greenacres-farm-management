import { Router } from 'express';
import * as farmEventController from '../../controllers/management/farm-event.controller';

const router = Router();

router.get('/', farmEventController.getFarmEvents);
router.post('/', farmEventController.createFarmEvent);
router.put('/:id', farmEventController.updateFarmEvent);
router.delete('/:id', farmEventController.deleteFarmEvent);

export default router;
