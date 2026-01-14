import { Router } from 'express';
import * as usageController from '../controllers/management/inventory-usage.controller';

const router = Router();

router.post('/log', usageController.logUsage);
router.get('/season/:seasonId', usageController.getUsageBySeason);
router.get('/season/:seasonId/medicine-stats', usageController.getMedicineUsageStats);

export default router;
