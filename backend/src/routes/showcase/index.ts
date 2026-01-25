import { Router } from 'express';
import productsRoutes from './products.routes';
import blogRoutes from './blog.routes';
import commentsRoutes from './comments.routes';
import categoriesRoutes from './categories.routes';
import statsRoutes from './stats.routes';
import authRoutes from './auth.routes';
import mediaRoutes from './media.routes';
import profileRoutes from './profile.routes';
import eventsRoutes from './events.routes';

const router = Router();

// Mount routes
router.use('/products', productsRoutes);
router.use('/blog', blogRoutes);
router.use('/comments', commentsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/stats', statsRoutes);
router.use('/auth', authRoutes);
router.use('/media', mediaRoutes);
router.use('/profile', profileRoutes);
router.use('/events', eventsRoutes);

export default router;
