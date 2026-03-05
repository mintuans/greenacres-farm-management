import { Router } from 'express';
import * as statsController from '../../controllers/showcase/stats.controller';

const router = Router();

router.get('/', statsController.getStats);
router.post('/increment', statsController.incrementStats);
router.post('/favorites/toggle', statsController.toggleFavorite);

export default router;
