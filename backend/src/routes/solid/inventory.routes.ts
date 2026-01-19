import { Router, Request, Response } from 'express';
import { container } from '../../core/container';
import { InventoryController } from '../../presentation/controllers/InventoryController';
import { TYPES } from '../../core/types';

/**
 * Inventory Routes - SOLID Version
 * Uses Dependency Injection with lazy controller resolution
 */
const router = Router();

// Helper to get controller (lazy resolution)
const getController = () => container.get<InventoryController>(TYPES.InventoryController);

// Custom routes (must be before /:id routes)
router.get('/stats', (req: Request, res: Response) => getController().getStats(req, res));
router.patch('/:id/stock', (req: Request, res: Response) => getController().updateStock(req, res));

// Standard CRUD routes
router.get('/', (req: Request, res: Response) => getController().getAll(req, res));
router.get('/:id', (req: Request, res: Response) => getController().getOne(req, res));
router.post('/', (req: Request, res: Response) => getController().create(req, res));
router.put('/:id', (req: Request, res: Response) => getController().update(req, res));
router.delete('/:id', (req: Request, res: Response) => getController().delete(req, res));

export default router;
