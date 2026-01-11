import { Router } from 'express';
import * as warehouseController from '../../controllers/management/warehouse.controller';

const router = Router();

router.get('/', warehouseController.getItems);
router.get('/next-code', warehouseController.getNextCode);
router.post('/', warehouseController.createItem);
router.put('/:id', warehouseController.updateItem);
router.delete('/:id', warehouseController.deleteItem);

export default router;
