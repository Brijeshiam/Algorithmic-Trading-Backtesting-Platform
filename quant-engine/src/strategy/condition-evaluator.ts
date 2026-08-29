/**
 * Condition Evaluator
 * 
 * Evaluates individual Conditions and nested ConditionGroups
 * against the current live indicator snapshot.
 * 
 * Handles: >, <, >=, <=, ==, CROSSES_ABOVE, CROSSES_BELOW
 * Handles: numeric values and indicator references (SMA/EMA/RSI/PRICE/VOLUME)
 */

import {
  Condition,
  ConditionGroup,
  ComparisonOp,
  IndicatorName,
  IndicatorRef,
  IndicatorValues,
} from './types.js';

/**
 * Resolve an indicator's current value from the snapshot.
 */
function resolveIndicatorValue(
  name: IndicatorName,
  period: number | undefined,
  values: IndicatorValues
): number | null {
  switch (name) {
    case 'PRICE': return values.PRICE;
    case 'VOLUME': return values.VOLUME;
    case 'SMA': return period !== undefined ? (values.SMA.get(period) ?? null) : null;
    case 'EMA': return period !== undefined ? (values.EMA.get(period) ?? null) : null;
    case 'RSI': return period !== undefined ? (values.RSI.get(period) ?? null) : null;
    case 'MACD': return values.MACD?.macd ?? null;
    case 'BOLLINGER': return values.BOLLINGER?.middle ?? null;
    default: return null;
  }
}

/**
 * Resolve a condition's previous bar value for crossover detection.
 */
function resolvePrevValue(
  name: IndicatorName,
  period: number | undefined,
  values: IndicatorValues
): number | null {
  switch (name) {
    case 'PRICE': return values.prev.PRICE;
    case 'VOLUME': return values.prev.VOLUME;
    case 'SMA': return period !== undefined ? (values.prev.SMA.get(period) ?? null) : null;
    case 'EMA': return period !== undefined ? (values.prev.EMA.get(period) ?? null) : null;
    case 'RSI': return period !== undefined ? (values.prev.RSI.get(period) ?? null) : null;
    default: return null;
  }
}

/**
 * Apply a comparison operator between two values.
 */
function applyComparison(
  op: ComparisonOp,
  lhs: number,
  rhs: number,
  prevLhs: number | null,
  prevRhs: number | null
): boolean {
  switch (op) {
    case '>':  return lhs > rhs;
    case '<':  return lhs < rhs;
    case '>=': return lhs >= rhs;
    case '<=': return lhs <= rhs;
    case '==': return Math.abs(lhs - rhs) < 0.0001; // float tolerance
    case 'CROSSES_ABOVE':
      // Current: lhs > rhs, Previous: lhs <= rhs
      return prevLhs !== null && prevRhs !== null
        ? lhs > rhs && prevLhs <= prevRhs
        : false;
    case 'CROSSES_BELOW':
      // Current: lhs < rhs, Previous: lhs >= rhs
      return prevLhs !== null && prevRhs !== null
        ? lhs < rhs && prevLhs >= prevRhs
        : false;
    default: return false;
  }
}

/**
 * Evaluate a single leaf Condition.
 */
export function evaluateCondition(condition: Condition, values: IndicatorValues): boolean {
  const lhs = resolveIndicatorValue(condition.indicator, condition.period, values);
  if (lhs === null) return false; // insufficient data

  let rhs: number;
  let prevRhs: number | null = null;

  if (typeof condition.value === 'number') {
    rhs = condition.value;
  } else {
    // IndicatorRef
    const ref = condition.value as IndicatorRef;
    const refVal = resolveIndicatorValue(ref.indicator, ref.period, values);
    if (refVal === null) return false;
    rhs = refVal;
    prevRhs = resolvePrevValue(ref.indicator, ref.period, values);
  }

  const prevLhs = resolvePrevValue(condition.indicator, condition.period, values);

  return applyComparison(condition.comparison, lhs, rhs, prevLhs, prevRhs);
}

/**
 * Evaluate a ConditionGroup (AND/OR of conditions or nested groups).
 */
export function evaluateConditionGroup(
  group: ConditionGroup,
  values: IndicatorValues
): boolean {
  if (group.conditions.length === 0) return false;

  if (group.operator === 'AND') {
    return group.conditions.every(c =>
      'operator' in c
        ? evaluateConditionGroup(c as ConditionGroup, values)
        : evaluateCondition(c as Condition, values)
    );
  } else {
    // OR
    return group.conditions.some(c =>
      'operator' in c
        ? evaluateConditionGroup(c as ConditionGroup, values)
        : evaluateCondition(c as Condition, values)
    );
  }
}
