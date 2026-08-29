import { Request, Response, NextFunction } from 'express';
import { StrategiesService } from './strategies.service.js';
import { CreateStrategySchema, UpdateStrategySchema } from './strategies.dto.js';

export class StrategiesController {
  static async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const leaderboard = await StrategiesService.getLeaderboard(req.user!.id);
      res.status(200).json(leaderboard);
    } catch (error) {
      next(error);
    }
  }

  static async createStrategy(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = CreateStrategySchema.parse(req.body);
      const strategy = await StrategiesService.createStrategy(userId, data);
      res.status(201).json(strategy);
    } catch (error) {
      next(error);
    }
  }

  static async getStrategies(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const strategies = await StrategiesService.getStrategies(userId, limit, offset);
      res.json(strategies);
    } catch (error) {
      next(error);
    }
  }

  static async getStrategy(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const strategyId = req.params.id as string;
      
      const strategy = await StrategiesService.getStrategy(userId, strategyId);
      if (!strategy) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      
      res.json(strategy);
    } catch (error) {
      next(error);
    }
  }

  static async updateStrategy(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const strategyId = req.params.id as string;
      const data = UpdateStrategySchema.parse(req.body);
      
      const strategy = await StrategiesService.updateStrategy(userId, strategyId, data);
      res.json(strategy);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      next(error);
    }
  }

  static async deleteStrategy(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const strategyId = req.params.id as string;
      
      const deleted = await StrategiesService.deleteStrategy(userId, strategyId);
      if (!deleted) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async getStrategyVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const strategyId = req.params.id as string;
      
      const versions = await StrategiesService.getStrategyVersions(userId, strategyId);
      if (!versions) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      
      res.json(versions);
    } catch (error) {
      next(error);
    }
  }
}
