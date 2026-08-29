/**
 * Bollinger Bands
 * 
 * Middle Band = SMA(period)
 * Upper Band  = Middle + (stdDev * numStdDev)
 * Lower Band  = Middle - (stdDev * numStdDev)
 * 
 * Default: period=20, numStdDev=2
 */
import { calculateSMA } from './sma.js';

export interface BollingerResult {
  upper: number | null;
  middle: number | null;
  lower: number | null;
  bandWidth: number | null; // (upper - lower) / middle — volatility indicator
}

export function calculateBollinger(
  prices: number[],
  period: number = 20,
  numStdDev: number = 2
): BollingerResult[] {
  const sma = calculateSMA(prices, period);
  
  return prices.map((_, i) => {
    if (sma[i] === null) return { upper: null, middle: null, lower: null, bandWidth: null };
    
    const middle = sma[i] as number;
    const slice = prices.slice(i - period + 1, i + 1);
    
    // Population standard deviation
    const mean = middle;
    const variance = slice.reduce((acc, p) => acc + (p - mean) ** 2, 0) / period;
    const stdDev = Math.sqrt(variance);
    
    const upper = middle + numStdDev * stdDev;
    const lower = middle - numStdDev * stdDev;
    const bandWidth = middle !== 0 ? (upper - lower) / middle : null;
    
    return { upper, middle, lower, bandWidth };
  });
}

/**
 * Compute Bollinger Bands for the last data point only (efficient for backtest loop).
 */
export function getBollingerValue(
  recentPrices: number[], // must have length >= period
  period: number = 20,
  numStdDev: number = 2
): BollingerResult {
  if (recentPrices.length < period) return { upper: null, middle: null, lower: null, bandWidth: null };
  
  const slice = recentPrices.slice(-period);
  const middle = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((acc, p) => acc + (p - middle) ** 2, 0) / period;
  const stdDev = Math.sqrt(variance);
  const upper = middle + numStdDev * stdDev;
  const lower = middle - numStdDev * stdDev;
  const bandWidth = middle !== 0 ? (upper - lower) / middle : null;
  
  return { upper, middle, lower, bandWidth };
}
