import { Router } from 'express';
import * as inventoryController from '../controllers/management/inventory.controller';

const router = Router();

router.get('/', inventoryController.getInventory);
router.get('/stats', inventoryController.getStats);
router.post('/', inventoryController.createItem);
router.put('/:id', inventoryController.updateItem);
router.delete('/:id', inventoryController.deleteItem);

export default router;
