import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { SimulationsController } from './simulations.controller.js';

const router = Router();

router.use(authenticate);

router.post('/monte-carlo', SimulationsController.runMonteCarlo);
router.get('/monte-carlo/:backtestId', SimulationsController.getMonteCarlo);

export default router;
