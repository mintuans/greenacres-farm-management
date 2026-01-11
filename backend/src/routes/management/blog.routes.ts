import { Router } from 'express';
import * as blogController from '../../controllers/management/blog.controller';

const router = Router();

// GET /api/management/blog - Lấy tất cả bài viết (bao gồm draft)
router.get('/', blogController.getAllBlogPosts);

// GET /api/management/blog/categories - Lấy danh sách danh mục
router.get('/categories', blogController.getBlogCategories);

// POST /api/management/blog - Tạo bài viết mới
router.post('/', blogController.createBlogPost);

// PUT /api/management/blog/:id - Cập nhật bài viết
router.put('/:id', blogController.updateBlogPost);

// DELETE /api/management/blog/:id - Xóa bài viết
router.delete('/:id', blogController.deleteBlogPost);

export default router;
