import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/error-handler.middleware.js';
import { authService } from './auth.service.js';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json({
      message: 'Account created successfully',
      ...result,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.json({
      message: 'Login successful',
      ...result,
    });
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.json(result);
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.user!.id);
    res.json({ message: 'Logged out successfully' });
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    // req.user is set by auth middleware
    res.json({ user: req.user });
  });
}

export const authController = new AuthController();
