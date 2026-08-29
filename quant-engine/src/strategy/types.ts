/**
 * Strategy Definition Types
 * 
 * These mirror the Zod schemas in backend/src/modules/strategies/strategies.dto.ts
 * but are plain TypeScript interfaces — no Zod dependency in the quant engine.
 */

export type IndicatorName = 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'BOLLINGER' | 'VOLUME' | 'PRICE';
export type ComparisonOp = '>' | '<' | '>=' | '<=' | '==' | 'CROSSES_ABOVE' | 'CROSSES_BELOW';
export type LogicalOp = 'AND' | 'OR';

export interface IndicatorRef {
  type: 'indicator_ref';
  indicator: IndicatorName;
  period?: number;
}

export interface Condition {
  indicator: IndicatorName;
  period?: number;
  comparison: ComparisonOp;
  value: number | IndicatorRef;
}

export interface ConditionGroup {
  operator: LogicalOp;
  conditions: (Condition | ConditionGroup)[];
}

export interface PositionSizing {
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
}

export interface StrategyDefinition {
  entryConditions?: ConditionGroup;
  exitConditions?: ConditionGroup;
  positionSizing?: PositionSizing;
  stopLoss?: { percentage: number };
  takeProfit?: { percentage: number };
}

export type Signal = 'BUY' | 'SELL' | 'HOLD';

/**
 * The live indicator values at a given candle, computed by the engine.
 * The condition evaluator reads from this snapshot.
 */
export interface IndicatorValues {
  PRICE: number;       // current close price
  VOLUME: number;      // current volume
  SMA: Map<number, number | null>;   // period → value
  EMA: Map<number, number | null>;   // period → value
  RSI: Map<number, number | null>;   // period → value
  MACD: { macd: number | null; signal: number | null; histogram: number | null } | null;
  BOLLINGER: { upper: number | null; middle: number | null; lower: number | null } | null;
  // Previous bar values for crossover detection
  prev: {
    SMA: Map<number, number | null>;
    EMA: Map<number, number | null>;
    RSI: Map<number, number | null>;
    PRICE: number;
    VOLUME: number;
  };
}
