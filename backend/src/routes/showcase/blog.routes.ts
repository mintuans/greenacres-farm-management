import { Router } from 'express';
import * as blogController from '../../controllers/showcase/blog.controller';

const router = Router();

// GET /api/showcase/blog
router.get('/', blogController.getBlogPosts);

// GET /api/showcase/blog/:slug
router.get('/:slug', blogController.getBlogPostBySlug);

export default router;
