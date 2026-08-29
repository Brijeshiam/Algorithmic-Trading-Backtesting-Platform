/**
 * Portfolio — tracks cash, positions, and overall equity during backtesting.
 */

import { Position } from './position.js';

export interface PortfolioSnapshot {
  timestamp: string;
  cash: number;
  positionsValue: number;
  equity: number;
  realizedPnl: number;
  totalCosts: number;
}

export class Portfolio {
  cash: number;
  realizedPnl: number = 0;
  totalCosts: number = 0;
  positions: Map<string, Position> = new Map();

  constructor(initialCash: number) {
    this.cash = initialCash;
  }

  getPosition(symbol: string): Position | undefined {
    return this.positions.get(symbol);
  }

  hasPosition(symbol: string): boolean {
    return (this.positions.get(symbol)?.isOpen) ?? false;
  }

  /** Get total market value of all open positions. */
  positionsValue(prices: Map<string, number>): number {
    let total = 0;
    for (const [symbol, position] of this.positions) {
      const price = prices.get(symbol) ?? position.avgEntryPrice;
      total += position.quantity * price;
    }
    return total;
  }

  /** Total portfolio equity (cash + market value of all positions). */
  equity(prices: Map<string, number>): number {
    return this.cash + this.positionsValue(prices);
  }

  /**
   * Open a new BUY order.
   * Returns the number of shares actually purchased (may be 0 if insufficient cash).
   */
  buy(symbol: string, quantity: number, price: number, costs: number): number {
    const totalCost = quantity * price + costs;
    if (totalCost > this.cash) {
      // Adjust quantity to what we can afford
      const affordableQty = Math.floor((this.cash - costs) / price);
      if (affordableQty <= 0) return 0;
      quantity = affordableQty;
    }

    const actualCost = quantity * price + costs;
    this.cash -= actualCost;
    this.totalCosts += costs;

    if (!this.positions.has(symbol)) {
      this.positions.set(symbol, new Position(symbol));
    }
    this.positions.get(symbol)!.add(quantity, price);

    return quantity;
  }

  /**
   * Close/reduce a SELL order.
   * Returns the realized PnL (net of costs).
   */
  sell(symbol: string, quantity: number, price: number, costs: number): number {
    const position = this.positions.get(symbol);
    if (!position || !position.isOpen) return 0;

    const grossPnl = position.reduce(quantity, price);
    const proceeds = quantity * price - costs;
    this.cash += proceeds;
    this.totalCosts += costs;
    this.realizedPnl += grossPnl - costs;

    return grossPnl - costs;
  }

  snapshot(timestamp: string, prices: Map<string, number>): PortfolioSnapshot {
    const positionsValue = this.positionsValue(prices);
    return {
      timestamp,
      cash: this.cash,
      positionsValue,
      equity: this.cash + positionsValue,
      realizedPnl: this.realizedPnl,
      totalCosts: this.totalCosts,
    };
  }
}
