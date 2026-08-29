import { Request, Response, NextFunction } from 'express';
import { MarketDataService } from './market-data.service.js';
import { MarketDataQuerySchema } from './market-data.dto.js';

export class MarketDataController {
  static async getAssets(req: Request, res: Response, next: NextFunction) {
    try {
      const assets = await MarketDataService.getAssets();
      res.json(assets);
    } catch (error) {
      next(error);
    }
  }

  static async getAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const symbol = req.params.symbol as string;
      const asset = await MarketDataService.getAsset(symbol);
      if (!asset) {
        return res.status(404).json({ error: `Asset '${symbol}' not found` });
      }
      res.json(asset);
    } catch (error) {
      next(error);
    }
  }

  static async getMarketData(req: Request, res: Response, next: NextFunction) {
    try {
      const symbol = req.params.symbol as string;
      const { from, to, limit } = MarketDataQuerySchema.parse(req.query);

      // Verify asset exists first
      const asset = await MarketDataService.getAsset(symbol);
      if (!asset) {
        return res.status(404).json({ error: `Asset '${symbol}' not found` });
      }

      const candles = await MarketDataService.getMarketData(symbol, from, to, limit);
      res.json({
        symbol: symbol.toUpperCase(),
        asset,
        candles,
        count: candles.length,
      });
    } catch (error) {
      next(error);
    }
  }
}
