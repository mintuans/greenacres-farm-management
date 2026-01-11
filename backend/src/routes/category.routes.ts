import { Router } from 'express';
import * as categoryController from '../controllers/management/category.controller';

const router = Router();

// CRUD routes
router.post('/', categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/stats', categoryController.getCategoryStats);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
