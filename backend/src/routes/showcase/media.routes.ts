import { Router } from 'express';
import * as mediaController from '../../controllers/showcase/media.controller';

const router = Router();

router.get('/farm', mediaController.getFarmImages);
router.get('/raw/:id', mediaController.getMediaResource);

export default router;
