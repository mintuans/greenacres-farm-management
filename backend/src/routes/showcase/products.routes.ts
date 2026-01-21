import { Router } from 'express';
import * as productsController from '../../controllers/showcase/products.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// GET /api/showcase/products - Công khai, không cần đăng nhập
router.get('/', productsController.getProducts);

// GET /api/showcase/products/:slug - Công khai, không cần đăng nhập
router.get('/:slug', productsController.getProductBySlug);

// GET /api/showcase/products/:id/reviews - Công khai, không cần đăng nhập
router.get('/:id/reviews', productsController.getProductReviews);

// POST /api/showcase/products/:id/reviews - Yêu cầu đăng nhập
router.post('/:id/reviews', authenticate, productsController.createProductReview);

export default router;

