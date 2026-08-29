import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/profile', usersController.getProfile);
router.put('/profile', usersController.updateProfile);

// Admin only
router.get('/', authorize('ADMIN'), usersController.listUsers);

export default router;
