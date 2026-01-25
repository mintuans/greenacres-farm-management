import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import * as profileController from '../../controllers/showcase/profile.controller';

const router = Router();

// Tất cả các route profile đều yêu cầu đăng nhập
router.use(authenticate);

router.get('/me', profileController.getProfile);
router.put('/me', profileController.updateProfile);

export default router;
