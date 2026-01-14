import { Router } from 'express';
import * as warehouseController from '../../controllers/management/warehouse.controller';

const router = Router();

router.get('/items', warehouseController.getItems);
router.get('/next-code', warehouseController.getNextCode);
router.post('/items', warehouseController.createItem);
router.put('/items/:id', warehouseController.updateItem);
router.delete('/items/:id', warehouseController.deleteItem);

export default router;
