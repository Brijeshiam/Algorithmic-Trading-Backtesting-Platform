/**
 * Backtest Types
 */

import { StrategyDefinition } from '../strategy/types.js';
import { PortfolioSnapshot } from '../portfolio/portfolio.js';

export interface OHLCVBar {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BacktestConfig {
  symbol: string;
  initialCapital: number;
  commissionRate: number;   // e.g. 0.001 = 0.1%
  slippageRate: number;     // e.g. 0.0005 = 0.05%
  strategy: StrategyDefinition;
  data: OHLCVBar[];
}

export interface Trade {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  entryTime: string;
  exitPrice?: number;
  exitTime?: string;
  grossPnl?: number;
  costs: number;
  netPnl?: number;
  status: 'OPEN' | 'CLOSED';
  holdingDays?: number;
}

export interface BacktestResult {
  symbol: string;
  dateStart: string;
  dateEnd: string;
  initialCapital: number;
  finalEquity: number;
  trades: Trade[];
  equitySnapshots: PortfolioSnapshot[];
  totalCosts: number;
  totalBars: number;
  barsInMarket: number;
}

/** Pending order to be filled at the next candle's open */
export interface PendingOrder {
  side: 'BUY' | 'SELL';
  signal_timestamp: string;
}
