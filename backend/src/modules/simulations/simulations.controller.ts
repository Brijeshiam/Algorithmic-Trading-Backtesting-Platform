import { Request, Response, NextFunction } from 'express';
import { RunMonteCarloSchema } from './simulations.dto.js';
import { SimulationsService } from './simulations.service.js';

export class SimulationsController {
  static async runMonteCarlo(req: Request, res: Response, next: NextFunction) {
    try {
      const data = RunMonteCarloSchema.parse(req.body);
      const result = await SimulationsService.runMonteCarlo(req.user!.id, data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getMonteCarlo(req: Request, res: Response, next: NextFunction) {
    try {
      const backtestId = req.params.backtestId as string;
      const result = await SimulationsService.getMonteCarloResult(req.user!.id, backtestId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
