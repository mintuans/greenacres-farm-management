import { Router } from 'express';
import * as eventsController from '../../controllers/showcase/events.controller';
import { authenticate, checkRole } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', eventsController.getPublicEvents);
router.get('/:id', authenticate, checkRole('USERFORSHOWCASE_EVENT'), eventsController.getPublicEventById);
router.post('/:id/join', authenticate, eventsController.joinEvent);

export default router;
