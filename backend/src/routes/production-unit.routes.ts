import { Router } from 'express';
import * as productionUnitController from '../controllers/management/production-unit.controller';

const router = Router();

// CRUD routes
router.post('/', productionUnitController.createProductionUnit);
router.get('/', productionUnitController.getProductionUnits);
router.get('/stats', productionUnitController.getProductionUnitStats);
router.get('/:id', productionUnitController.getProductionUnitById);
router.put('/:id', productionUnitController.updateProductionUnit);
router.delete('/:id', productionUnitController.deleteProductionUnit);

export default router;
