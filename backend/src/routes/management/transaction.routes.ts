import { Router } from 'express';
import * as transactionController from '../../controllers/management/transaction.controller';

const router = Router();

router.get('/', transactionController.getTransactions);
router.post('/', transactionController.createTransaction);
router.delete('/:id', transactionController.deleteTransaction);

export default router;
