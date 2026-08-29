/**
 * Transaction Cost Models
 * 
 * Supports:
 *  - Commission: percentage of trade value (e.g. 0.001 = 0.1%)
 *  - Slippage: percentage price impact (e.g. 0.0005 = 0.05%)
 */

export interface CostConfig {
  commissionRate: number; // as decimal, e.g. 0.001 = 0.1%
  slippageRate: number;   // as decimal, e.g. 0.0005 = 0.05%
}

/**
 * Calculate the effective execution price after slippage.
 * BUY orders pay more, SELL orders receive less.
 */
export function applySlippage(
  price: number,
  side: 'BUY' | 'SELL',
  slippageRate: number
): number {
  if (side === 'BUY') {
    return price * (1 + slippageRate);
  } else {
    return price * (1 - slippageRate);
  }
}

/**
 * Calculate commission on a trade.
 */
export function calculateCommission(
  tradeValue: number,
  commissionRate: number
): number {
  return tradeValue * commissionRate;
}

/**
 * Total transaction cost for a trade (commission + slippage impact).
 * Note: slippage is already baked into the fill price via applySlippage().
 * This function returns only the additional commission cost.
 */
export function calculateTradeCosts(
  quantity: number,
  fillPrice: number,
  config: CostConfig
): number {
  const tradeValue = quantity * fillPrice;
  return calculateCommission(tradeValue, config.commissionRate);
}
