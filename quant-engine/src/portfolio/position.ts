/**
 * Position — tracks a single open position in a symbol.
 */

export interface PositionSnapshot {
  symbol: string;
  quantity: number;
  avgEntryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
}

export class Position {
  symbol: string;
  quantity: number = 0;
  avgEntryPrice: number = 0;
  totalCost: number = 0;

  constructor(symbol: string) {
    this.symbol = symbol;
  }

  /** Open or add to a position */
  add(quantity: number, price: number): void {
    const newCost = quantity * price;
    this.totalCost += newCost;
    this.quantity += quantity;
    this.avgEntryPrice = this.quantity > 0 ? this.totalCost / this.quantity : 0;
  }

  /**
   * Reduce or close a position.
   * Returns realized PnL (gross, before costs).
   */
  reduce(quantity: number, price: number): number {
    const qty = Math.min(quantity, this.quantity);
    const realizedPnl = (price - this.avgEntryPrice) * qty;
    this.totalCost -= this.avgEntryPrice * qty;
    this.quantity -= qty;
    if (this.quantity <= 0) {
      this.quantity = 0;
      this.totalCost = 0;
      this.avgEntryPrice = 0;
    }
    return realizedPnl;
  }

  get isOpen(): boolean {
    return this.quantity > 0;
  }

  /** Unrealized P&L as a percentage */
  unrealizedPnlPct(currentPrice: number): number | null {
    if (this.avgEntryPrice === 0) return null;
    return ((currentPrice - this.avgEntryPrice) / this.avgEntryPrice) * 100;
  }

  snapshot(currentPrice: number): PositionSnapshot {
    const marketValue = this.quantity * currentPrice;
    const unrealizedPnl = (currentPrice - this.avgEntryPrice) * this.quantity;
    const unrealizedPnlPct = this.avgEntryPrice > 0
      ? (unrealizedPnl / (this.avgEntryPrice * this.quantity)) * 100
      : 0;
    return {
      symbol: this.symbol,
      quantity: this.quantity,
      avgEntryPrice: this.avgEntryPrice,
      currentPrice,
      marketValue,
      unrealizedPnl,
      unrealizedPnlPct,
    };
  }
}
