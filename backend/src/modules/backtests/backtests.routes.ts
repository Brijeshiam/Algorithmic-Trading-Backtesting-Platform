import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { BacktestsController } from './backtests.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', BacktestsController.listBacktests);
router.post('/', BacktestsController.runBacktest);
router.get('/:id', BacktestsController.getBacktest);

export default router;
