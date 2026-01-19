import { Router, Request, Response } from 'express';
import { container } from '../../core/container';
import { PayrollController } from '../../presentation/controllers/PayrollController';
import { TYPES } from '../../core/types';

/**
 * Payroll Routes - SOLID Version
 * Uses Dependency Injection with lazy controller resolution
 */
const router = Router();

// Helper to get controller (lazy resolution)
const getController = () => container.get<PayrollController>(TYPES.PayrollController);

// Custom routes (must be before /:id routes)
router.get('/stats', (req: Request, res: Response) => getController().getStats(req, res));
router.get('/season/:seasonId', (req: Request, res: Response) => getController().getBySeason(req, res));
router.get('/partner/:partnerId', (req: Request, res: Response) => getController().getByPartner(req, res));
router.put('/:id/status', (req: Request, res: Response) => getController().updateStatus(req, res));

// Standard CRUD routes
router.get('/', (req: Request, res: Response) => getController().getAll(req, res));
router.get('/:id', (req: Request, res: Response) => getController().getOne(req, res));
router.post('/', (req: Request, res: Response) => getController().create(req, res));
router.put('/:id', (req: Request, res: Response) => getController().update(req, res));
router.delete('/:id', (req: Request, res: Response) => getController().delete(req, res));

export default router;
