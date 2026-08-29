import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/error-handler.middleware.js';
import { dashboardService } from './dashboard.service.js';

export class DashboardController {
  getSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await dashboardService.getSummary(req.user!.id);
    res.json(summary);
  });
}

export const dashboardController = new DashboardController();
