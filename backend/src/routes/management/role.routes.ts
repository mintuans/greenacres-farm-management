import { Router } from 'express';
import * as roleController from '../../controllers/management/role.controller';

const router = Router();

router.get('/', roleController.getRoles);
router.post('/', roleController.createRole);
router.put('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

router.get('/:id/permissions', roleController.getRolePermissions);
router.post('/:id/permissions', roleController.assignPermission);
router.delete('/:id/permissions/:permissionId', roleController.removePermission);

export default router;
