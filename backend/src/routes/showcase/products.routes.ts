import { Router } from 'express';
import * as productsController from '../../controllers/showcase/products.controller';

const router = Router();

// GET /api/showcase/products
router.get('/', productsController.getProducts);

// GET /api/showcase/products/:slug
router.get('/:slug', productsController.getProductBySlug);

// GET /api/showcase/products/:id/reviews
router.get('/:id/reviews', productsController.getProductReviews);

// POST /api/showcase/products/:id/reviews
router.post('/:id/reviews', productsController.createProductReview);

export default router;
