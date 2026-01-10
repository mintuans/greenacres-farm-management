import { Router } from 'express';
import * as commentsController from '../../controllers/showcase/comments.controller';

const router = Router();

// GET /api/showcase/comments
router.get('/', commentsController.getComments);

// POST /api/showcase/comments
router.post('/', commentsController.createComment);

// POST /api/showcase/comments/:id/reactions
router.post('/:id/reactions', commentsController.addReaction);

export default router;
