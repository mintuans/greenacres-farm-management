import { Router } from 'express';
import * as publicUserController from '../../controllers/management/public-user.controller';

const router = Router();

router.get('/', publicUserController.getPublicUsers);
router.post('/', publicUserController.createPublicUser);
router.put('/:id', publicUserController.updatePublicUser);
router.delete('/:id', publicUserController.deletePublicUser);

router.get('/:id/roles', publicUserController.getUserRoles);
router.post('/:id/roles', publicUserController.assignRoleToUser);
router.delete('/:id/roles/:roleId', publicUserController.removeRoleFromUser);

export default router;
