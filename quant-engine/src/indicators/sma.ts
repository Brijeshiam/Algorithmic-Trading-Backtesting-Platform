/**
 * Simple Moving Average (SMA)
 * 
 * Returns an array of the same length as `prices`.
 * Values are `null` until enough data accumulates (first `period - 1` entries).
 */
export function calculateSMA(prices: number[], period: number): (number | null)[] {
  if (period <= 0) throw new Error('SMA period must be > 0');
  const result: (number | null)[] = new Array(prices.length).fill(null);
  
  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += prices[j];
    }
    result[i] = sum / period;
  }
  
  return result;
}

/**
 * Get the last valid (non-null) SMA value.
 * Returns null if insufficient data.
 */
export function getSMAValue(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}
