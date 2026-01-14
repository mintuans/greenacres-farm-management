import { Router } from 'express';
import * as publicUserController from '../../controllers/management/public-user.controller';

const router = Router();

router.get('/', publicUserController.getPublicUsers);
router.post('/', publicUserController.createPublicUser);
router.put('/:id', publicUserController.updatePublicUser);
router.delete('/:id', publicUserController.deletePublicUser);

export default router;
