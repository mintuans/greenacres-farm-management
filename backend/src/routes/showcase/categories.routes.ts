import { Router } from 'express';
import * as categoriesController from '../../controllers/showcase/categories.controller';

const router = Router();

// GET /api/showcase/categories/products
router.get('/products', categoriesController.getProductCategories);

// GET /api/showcase/categories/blog
router.get('/blog', categoriesController.getBlogCategories);

export default router;
