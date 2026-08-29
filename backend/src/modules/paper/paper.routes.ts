import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { PaperController } from './paper.controller.js';

const router = Router();

router.use(authenticate);

router.get('/account', PaperController.getAccount);
router.post('/account', PaperController.initAccount);

router.get('/orders', PaperController.getOrders);
router.post('/orders', PaperController.placeOrder);

export default router;
