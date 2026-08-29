import { Request, Response, NextFunction } from 'express';
import { PaperService } from './paper.service.js';
import { InitAccountSchema, PlaceOrderSchema } from './paper.dto.js';

export class PaperController {
  static async getAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await PaperService.getAccount(req.user!.id);
      res.status(200).json(account);
    } catch (error) {
      next(error);
    }
  }

  static async initAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const data = InitAccountSchema.parse(req.body);
      const account = await PaperService.initAccount(req.user!.id, data);
      res.status(201).json(account);
    } catch (error) {
      next(error);
    }
  }

  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await PaperService.getOrders(req.user!.id);
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  static async placeOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = PlaceOrderSchema.parse(req.body);
      const order = await PaperService.placeOrder(req.user!.id, data);
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }
}
