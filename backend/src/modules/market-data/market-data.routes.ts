import { Router } from 'express';
import { MarketDataController } from './market-data.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// All market data routes require authentication
router.use(authenticate);

// Asset routes
router.get('/assets', MarketDataController.getAssets);
router.get('/assets/:symbol', MarketDataController.getAsset);

// OHLCV data routes
router.get('/market-data/:symbol', MarketDataController.getMarketData);

export default router;
