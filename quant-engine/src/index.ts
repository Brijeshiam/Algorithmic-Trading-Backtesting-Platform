/**
 * AlgoLab Quant Engine
 * 
 * Pure TypeScript library for technical indicators, strategy evaluation,
 * backtesting, portfolio simulation, and performance analytics.
 * 
 * Zero runtime dependencies — designed for testability and reusability.
 */

export const VERSION = '1.0.0';

// ── Indicators ───────────────────────────────────────────────────────────────
export * from './indicators/index.js';

// ── Strategy ─────────────────────────────────────────────────────────────────
export * from './strategy/types.js';
export { evaluateCondition, evaluateConditionGroup } from './strategy/condition-evaluator.js';
export { evaluateStrategy } from './strategy/evaluator.js';

// ── Portfolio ─────────────────────────────────────────────────────────────────
export { Position } from './portfolio/position.js';
export type { PositionSnapshot } from './portfolio/position.js';
export { Portfolio } from './portfolio/portfolio.js';
export type { PortfolioSnapshot } from './portfolio/portfolio.js';

// ── Costs ────────────────────────────────────────────────────────────────────
export { applySlippage, calculateCommission, calculateTradeCosts } from './costs/costs.js';
export type { CostConfig } from './costs/costs.js';

// ── Backtest Engine ───────────────────────────────────────────────────────────
export { runBacktest } from './backtest/engine.js';
export type { BacktestConfig, BacktestResult, Trade, OHLCVBar, PendingOrder } from './backtest/types.js';

