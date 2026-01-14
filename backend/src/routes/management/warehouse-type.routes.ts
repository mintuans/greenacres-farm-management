import { Router } from 'express';
import * as warehouseTypeController from '../../controllers/management/warehouse-type.controller';

const router = Router();

router.get('/', warehouseTypeController.getAll);
router.post('/', warehouseTypeController.create);
router.put('/:id', warehouseTypeController.update);
router.delete('/:id', warehouseTypeController.remove);

export default router;
