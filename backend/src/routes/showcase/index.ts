import { Router } from 'express';
import productsRoutes from './products.routes';
import blogRoutes from './blog.routes';
import commentsRoutes from './comments.routes';
import categoriesRoutes from './categories.routes';
import statsRoutes from './stats.routes';

const router = Router();

// Mount routes
router.use('/products', productsRoutes);
router.use('/blog', blogRoutes);
router.use('/comments', commentsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/stats', statsRoutes);

export default router;
