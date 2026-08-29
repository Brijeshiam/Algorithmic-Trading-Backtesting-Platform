import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/error-handler.middleware.js';
import { usersService } from './users.service.js';

export class UsersController {
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.getProfile(req.user!.id);
    res.json({ user });
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.updateProfile(req.user!.id, req.body);
    res.json({ message: 'Profile updated', user });
  });

  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const result = await usersService.listUsers(page, limit);
    res.json(result);
  });
}

export const usersController = new UsersController();
