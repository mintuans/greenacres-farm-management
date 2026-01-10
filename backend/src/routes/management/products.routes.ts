import { Router } from 'express';
import * as productsController from '../../controllers/management/products.controller';

const router = Router();

// GET /api/management/products - Lấy danh sách
router.get('/', productsController.getAllProducts);

// GET /api/management/products/:id - Lấy chi tiết
router.get('/:id', productsController.getProductById);

// POST /api/management/products - Tạo mới
router.post('/', productsController.createProduct);

// PUT /api/management/products/:id - Cập nhật
router.put('/:id', productsController.updateProduct);

// DELETE /api/management/products/:id - Xóa
router.delete('/:id', productsController.deleteProduct);

export default router;
