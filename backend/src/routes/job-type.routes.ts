import { Router } from 'express';
import * as jobTypeController from '../controllers/management/job-type.controller';

const router = Router();

// CRUD routes
router.post('/', jobTypeController.createJobType);
router.get('/', jobTypeController.getJobTypes);
router.get('/stats', jobTypeController.getJobTypeStats);
router.get('/:id', jobTypeController.getJobTypeById);
router.put('/:id', jobTypeController.updateJobType);
router.delete('/:id', jobTypeController.deleteJobType);

export default router;
