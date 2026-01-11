import { Router } from 'express';
import * as seasonController from '../controllers/management/season.controller';

const router = Router();

// CRUD routes
router.post('/', seasonController.createSeason);
router.get('/', seasonController.getSeasons);
router.get('/stats', seasonController.getSeasonStats);
router.get('/:id', seasonController.getSeasonById);
router.put('/:id', seasonController.updateSeason);
router.delete('/:id', seasonController.deleteSeason);

// Additional routes
router.post('/:id/close', seasonController.closeSeason);

export default router;
