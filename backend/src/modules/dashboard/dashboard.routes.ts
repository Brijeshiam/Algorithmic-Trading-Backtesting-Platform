import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/summary', dashboardController.getSummary);

export default router;
