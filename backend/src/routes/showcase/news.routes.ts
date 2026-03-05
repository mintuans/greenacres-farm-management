import { Router } from 'express';
import { getExternalNews } from '../../controllers/showcase/news.controller';

const router = Router();

router.get('/external', getExternalNews);

export default router;
