/**
 * MACD — Moving Average Convergence Divergence
 * 
 * Standard: fast=12, slow=26, signal=9
 * 
 * MACD Line   = EMA(fast) - EMA(slow)
 * Signal Line = EMA(9) of MACD Line
 * Histogram   = MACD Line - Signal Line
 */
import { calculateEMA } from './ema.js';

export interface MACDResult {
  macd: number | null;
  signal: number | null;
  histogram: number | null;
}

export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult[] {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  
  // MACD line: defined only where both EMAs are defined
  const macdLine: (number | null)[] = prices.map((_, i) => {
    if (fastEMA[i] === null || slowEMA[i] === null) return null;
    return (fastEMA[i] as number) - (slowEMA[i] as number);
  });
  
  // Signal line: EMA of MACD line (only valid values)
  const validMacdValues = macdLine.filter(v => v !== null) as number[];
  const signalEMAValues = calculateEMA(validMacdValues, signalPeriod);
  
  // Map signal EMA values back onto the full array
  let validIdx = 0;
  const signalLine: (number | null)[] = macdLine.map(v => {
    if (v === null) return null;
    const sig = signalEMAValues[validIdx];
    validIdx++;
    return sig;
  });
  
  return prices.map((_, i) => {
    const macd = macdLine[i];
    const signal = signalLine[i];
    return {
      macd,
      signal,
      histogram: macd !== null && signal !== null ? macd - signal : null,
    };
  });
}
