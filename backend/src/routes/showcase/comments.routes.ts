import { Router } from 'express';
import * as commentsController from '../../controllers/showcase/comments.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// GET /api/showcase/comments - Công khai, không cần đăng nhập
router.get('/', commentsController.getComments);

// POST /api/showcase/comments - Yêu cầu đăng nhập
router.post('/', authenticate, commentsController.createComment);

// POST /api/showcase/comments/:id/reactions - Yêu cầu đăng nhập
router.post('/:id/reactions', authenticate, commentsController.addReaction);

export default router;

