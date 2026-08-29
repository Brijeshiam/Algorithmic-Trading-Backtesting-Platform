import { Request, Response, NextFunction } from 'express';
import { BacktestsService } from './backtests.service.js';
import { RunBacktestSchema } from './backtests.dto.js';

export class BacktestsController {
  static async listBacktests(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const results = await BacktestsService.listBacktests(userId);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  static async getBacktest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const backtestId = req.params.id as string;
      const result = await BacktestsService.getBacktest(userId, backtestId);
      if (!result) {
        return res.status(404).json({ error: 'Backtest not found' });
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async runBacktest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const dto = RunBacktestSchema.parse(req.body);
      const backtestId = await BacktestsService.runBacktest(userId, dto);
      res.status(201).json({ id: backtestId, message: 'Backtest completed successfully' });
    } catch (error) {
      next(error);
    }
  }
}
