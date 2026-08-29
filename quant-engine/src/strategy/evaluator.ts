/**
 * Strategy Evaluator
 * 
 * Top-level evaluator: given a strategy definition and the current
 * indicator snapshot, returns BUY | SELL | HOLD.
 * 
 * Priority: EXIT > STOP LOSS > TAKE PROFIT > ENTRY
 */

import { StrategyDefinition, Signal, IndicatorValues } from './types.js';
import { evaluateConditionGroup } from './condition-evaluator.js';

export function evaluateStrategy(
  strategy: StrategyDefinition,
  values: IndicatorValues,
  hasPosition: boolean,
  unrealizedPnlPct: number | null
): Signal {
  // 1. Stop-loss check (if in a position and a stop is configured)
  if (hasPosition && strategy.stopLoss && unrealizedPnlPct !== null) {
    if (unrealizedPnlPct <= -strategy.stopLoss.percentage) {
      return 'SELL';
    }
  }

  // 2. Take-profit check
  if (hasPosition && strategy.takeProfit && unrealizedPnlPct !== null) {
    if (unrealizedPnlPct >= strategy.takeProfit.percentage) {
      return 'SELL';
    }
  }

  // 3. Exit conditions (only relevant if we have a position)
  if (hasPosition && strategy.exitConditions) {
    if (evaluateConditionGroup(strategy.exitConditions, values)) {
      return 'SELL';
    }
  }

  // 4. Entry conditions (only enter if we don't already have a position)
  if (!hasPosition && strategy.entryConditions) {
    if (evaluateConditionGroup(strategy.entryConditions, values)) {
      return 'BUY';
    }
  }

  return 'HOLD';
}
