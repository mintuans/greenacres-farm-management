import { Router, Request, Response } from 'express';
import { container } from '../../core/container';
import { PartnerController } from '../../presentation/controllers/PartnerController';
import { TYPES } from '../../core/types';

/**
 * Partner Routes - SOLID Version
 * Uses Dependency Injection with lazy controller resolution
 */
const router = Router();

// Helper to get controller (lazy resolution)
const getController = () => container.get<PartnerController>(TYPES.PartnerController);

// Custom routes (must be before /:id routes)
router.get('/:id/balance', (req: Request, res: Response) => getController().getBalance(req, res));

// Standard CRUD routes
router.get('/', (req: Request, res: Response) => getController().getAll(req, res));
router.get('/:id', (req: Request, res: Response) => getController().getOne(req, res));
router.post('/', (req: Request, res: Response) => getController().create(req, res));
router.put('/:id', (req: Request, res: Response) => getController().update(req, res));
router.delete('/:id', (req: Request, res: Response) => getController().delete(req, res));

export default router;
