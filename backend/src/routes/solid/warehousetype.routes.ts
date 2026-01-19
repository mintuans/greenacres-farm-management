import { Router, Request, Response } from 'express';
import { container } from '../../core/container';
import { WarehouseTypeController } from '../../presentation/controllers/WarehouseTypeController';
import { TYPES } from '../../core/types';

/**
 * WarehouseType Routes - SOLID Version
 * Uses Dependency Injection with lazy controller resolution
 */
const router = Router();

// Helper to get controller (lazy resolution)
const getController = () => container.get<WarehouseTypeController>(TYPES.WarehouseTypeController);

// Routes - Controllers are resolved when route is called
router.get('/', (req: Request, res: Response) => getController().getAll(req, res));
router.get('/:id', (req: Request, res: Response) => getController().getOne(req, res));
router.post('/', (req: Request, res: Response) => getController().create(req, res));
router.put('/:id', (req: Request, res: Response) => getController().update(req, res));
router.delete('/:id', (req: Request, res: Response) => getController().delete(req, res));

export default router;
