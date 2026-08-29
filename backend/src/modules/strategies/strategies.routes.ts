import { Router } from 'express';
import { StrategiesController } from './strategies.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// All strategy routes require authentication
router.use(authenticate);

router.get('/leaderboard', StrategiesController.getLeaderboard);

router.post('/', StrategiesController.createStrategy);
router.get('/', StrategiesController.getStrategies);
router.get('/:id', StrategiesController.getStrategy);
router.put('/:id', StrategiesController.updateStrategy);
router.delete('/:id', StrategiesController.deleteStrategy);
router.get('/:id/versions', StrategiesController.getStrategyVersions);

export default router;
