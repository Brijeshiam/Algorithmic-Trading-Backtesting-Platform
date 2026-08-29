/**
 * Indicator Registry
 * 
 * Central exports for all technical indicators.
 * The backtest engine uses this to resolve indicator names from strategy JSON.
 */

export { calculateSMA, getSMAValue } from './sma.js';
export { calculateEMA, computeEMAIncremental } from './ema.js';
export { calculateRSI, computeRSIIncremental } from './rsi.js';
export type { RSIState } from './rsi.js';
export { calculateMACD } from './macd.js';
export type { MACDResult } from './macd.js';
export { calculateBollinger, getBollingerValue } from './bollinger.js';
export type { BollingerResult } from './bollinger.js';
