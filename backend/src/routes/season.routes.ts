import { Router } from 'express';
import * as seasonController from '../controllers/management/season.controller';
import { authenticate, checkPermission } from '../middlewares/auth.middleware';

const router = Router();

// CRUD routes
router.post('/', authenticate, checkPermission('seasons.create'), seasonController.createSeason);
router.get('/', authenticate, checkPermission('seasons.read'), seasonController.getSeasons);
router.get('/stats', authenticate, checkPermission('seasons.read'), seasonController.getSeasonStats);
router.get('/next-code', authenticate, checkPermission('seasons.read'), seasonController.getNextSeasonCode);
router.get('/:id', authenticate, checkPermission('seasons.read'), seasonController.getSeasonById);
router.put('/:id', authenticate, checkPermission('seasons.update'), seasonController.updateSeason);
router.delete('/:id', authenticate, checkPermission('seasons.delete'), seasonController.deleteSeason);

// Additional routes
router.post('/:id/close', authenticate, checkPermission('seasons.update'), seasonController.closeSeason);

export default router;
