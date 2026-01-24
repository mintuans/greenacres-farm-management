import { Router } from 'express';
import * as partnerController from '../controllers/management/partner.controller';

const router = Router();

// CRUD routes
router.post('/', partnerController.createPartner);
router.get('/', partnerController.getPartners);
router.get('/get-next-code', partnerController.getNextCode);
router.get('/:id', partnerController.getPartnerById);
router.put('/:id', partnerController.updatePartner);
router.delete('/:id', partnerController.deletePartner);

// Additional routes
router.get('/:id/balance', partnerController.getPartnerBalance);

export default router;
