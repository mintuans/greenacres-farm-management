import { Router } from 'express';
import * as commentsController from '../../controllers/showcase/comments.controller';
import { authenticate, checkPermission } from '../../middlewares/auth.middleware';

const router = Router();

// GET /api/showcase/comments - Công khai, không cần đăng nhập
router.get('/', commentsController.getComments);

// GET /api/showcase/comments/stats - Công khai
router.get('/stats', commentsController.getCommentStats);

// POST /api/showcase/comments - Yêu cầu đăng nhập & quyền tạo
router.post('/', authenticate, checkPermission('comments.create'), commentsController.createComment);

// POST /api/showcase/comments/:id/reactions - Yêu cầu đăng nhập & quyền tạo
router.post('/:id/reactions', authenticate, checkPermission('comment_reactions.create'), commentsController.addReaction);

// GET /api/showcase/comments/:id/reactions - Công khai
router.get('/:id/reactions', commentsController.getReactionDetails);

// DELETE /api/showcase/comments/:id - Yêu cầu đăng nhập & quyền xóa
router.delete('/:id', authenticate, checkPermission('comments.delete'), commentsController.deleteComment);

export default router;

