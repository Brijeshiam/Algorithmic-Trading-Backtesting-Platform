/**
 * Relative Strength Index (RSI)
 * 
 * Standard 14-period RSI using Wilder's smoothing method.
 * Returns array same length as input; null for insufficient data.
 * 
 * Formula:
 *   RS  = AvgGain / AvgLoss
 *   RSI = 100 - (100 / (1 + RS))
 */
export function calculateRSI(prices: number[], period: number = 14): (number | null)[] {
  if (period <= 0) throw new Error('RSI period must be > 0');
  const result: (number | null)[] = new Array(prices.length).fill(null);
  
  if (prices.length < period + 1) return result;
  
  // Calculate initial average gain/loss over first `period` changes
  let avgGain = 0;
  let avgLoss = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }
  
  avgGain /= period;
  avgLoss /= period;
  
  const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
  result[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
  
  // Wilder's smoothing for subsequent values
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    
    const rsVal = avgLoss === 0 ? Infinity : avgGain / avgLoss;
    result[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + rsVal));
  }
  
  return result;
}

export interface RSIState {
  avgGain: number;
  avgLoss: number;
  prevPrice: number;
  count: number;
}

/**
 * Compute RSI incrementally (for the backtest engine loop).
 */
export function computeRSIIncremental(
  state: RSIState | null,
  currentPrice: number,
  period: number
): { value: number | null; state: RSIState } {
  if (!state) {
    return { value: null, state: { avgGain: 0, avgLoss: 0, prevPrice: currentPrice, count: 1 } };
  }
  
  const change = currentPrice - state.prevPrice;
  const gain = change > 0 ? change : 0;
  const loss = change < 0 ? Math.abs(change) : 0;
  
  const newCount = state.count + 1;
  let avgGain: number;
  let avgLoss: number;
  
  if (newCount <= period) {
    // Still in initial accumulation phase
    avgGain = (state.avgGain * (state.count - 1) + gain) / (newCount - 1 || 1);
    avgLoss = (state.avgLoss * (state.count - 1) + loss) / (newCount - 1 || 1);
  } else {
    // Wilder's smoothing
    avgGain = (state.avgGain * (period - 1) + gain) / period;
    avgLoss = (state.avgLoss * (period - 1) + loss) / period;
  }
  
  const value = newCount > period
    ? (avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss)))
    : null;
  
  return {
    value,
    state: { avgGain, avgLoss, prevPrice: currentPrice, count: newCount },
  };
}
