import { Router } from 'express';
import * as statsController from '../../controllers/showcase/stats.controller';

const router = Router();

router.get('/', statsController.getStats);
router.post('/increment', statsController.incrementStats);

export default router;
