import { Router } from 'express';
import productsRoutes from './products.routes';
import mediaRoutes from './media.routes';

const router = Router();

// Mount routes
router.use('/products', productsRoutes);
router.use('/media', mediaRoutes);

export default router;
