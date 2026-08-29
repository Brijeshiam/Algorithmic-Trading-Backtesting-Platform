/**
 * Exponential Moving Average (EMA)
 * 
 * Uses a smoothing factor k = 2 / (period + 1).
 * First EMA value is seeded with the SMA of the first `period` prices.
 * Returns an array of the same length as `prices`.
 */
export function calculateEMA(prices: number[], period: number): (number | null)[] {
  if (period <= 0) throw new Error('EMA period must be > 0');
  const result: (number | null)[] = new Array(prices.length).fill(null);
  
  if (prices.length < period) return result;
  
  const k = 2 / (period + 1);
  
  // Seed with SMA of first `period` values
  let ema = 0;
  for (let i = 0; i < period; i++) {
    ema += prices[i];
  }
  ema /= period;
  result[period - 1] = ema;
  
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
    result[i] = ema;
  }
  
  return result;
}

/**
 * Get the last valid EMA value by incrementally computing from a running EMA state.
 * More efficient for the backtest engine which maintains a running EMA.
 */
export function computeEMAIncremental(
  prevEMA: number | null,
  currentPrice: number,
  period: number,
  priceCount: number
): number | null {
  if (priceCount < period) return null;
  if (prevEMA === null) return currentPrice; // seed
  const k = 2 / (period + 1);
  return currentPrice * k + prevEMA * (1 - k);
}
