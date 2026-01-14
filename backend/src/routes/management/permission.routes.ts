import { Router } from 'express';
import * as permissionController from '../../controllers/management/permission.controller';

const router = Router();

router.get('/', permissionController.getPermissions);
router.post('/', permissionController.createPermission);
router.put('/:id', permissionController.updatePermission);
router.delete('/:id', permissionController.deletePermission);

export default router;
