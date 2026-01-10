import { Router } from 'express';
import * as mediaController from '../../controllers/management/media.controller';

const router = Router();

// GET /api/management/media - Lấy danh sách
router.get('/', mediaController.getAllMedia);

// GET /api/management/media/:id - Lấy chi tiết (base64)
router.get('/:id', mediaController.getMediaById);

// GET /api/management/media/raw/:id - Lấy ảnh raw (binary)
router.get('/raw/:id', mediaController.getMediaResource);

// POST /api/management/media - Upload ảnh
router.post('/', mediaController.uploadMedia);

// DELETE /api/management/media/:id - Xóa ảnh
router.delete('/:id', mediaController.deleteMedia);

export default router;
