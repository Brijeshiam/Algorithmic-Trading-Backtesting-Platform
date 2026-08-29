/**
 * Backtest Engine — The Core Per-Candle Simulation Loop
 * 
 * ┌─────────────────────────────────────────────────────┐
 * │  For each candle (chronological order):             │
 * │  1. Fill any pending order at THIS candle's OPEN    │
 * │     (signal was on the PREVIOUS bar — no lookahead) │
 * │  2. Update indicator buffers with close price       │
 * │  3. Evaluate strategy → BUY | SELL | HOLD signal   │
 * │  4. Queue signal as pending order for next bar      │
 * │  5. Record equity snapshot at close                 │
 * └─────────────────────────────────────────────────────┘
 */

import { BacktestConfig, BacktestResult, Trade, PendingOrder, OHLCVBar } from './types.js';
import { Portfolio } from '../portfolio/portfolio.js';
import { StrategyDefinition, IndicatorValues } from '../strategy/types.js';
import { evaluateStrategy } from '../strategy/evaluator.js';
import { applySlippage, calculateTradeCosts } from '../costs/costs.js';
import { getSMAValue } from '../indicators/sma.js';
import { computeEMAIncremental } from '../indicators/ema.js';
import { computeRSIIncremental, RSIState } from '../indicators/rsi.js';
import { calculateMACD } from '../indicators/macd.js';
import { getBollingerValue } from '../indicators/bollinger.js';

/** Collect all unique indicator periods needed from the strategy */
function collectPeriods(strategy: StrategyDefinition): {
  smaPeriods: Set<number>;
  emaPeriods: Set<number>;
  rsiPeriods: Set<number>;
  needsMacd: boolean;
  needsBollinger: boolean;
} {
  const smaPeriods = new Set<number>();
  const emaPeriods = new Set<number>();
  const rsiPeriods = new Set<number>();
  let needsMacd = false;
  let needsBollinger = false;

  function scan(group: any) {
    if (!group || !group.conditions) return;
    for (const c of group.conditions) {
      if ('operator' in c) {
        scan(c);
      } else {
        const cond = c as any;
        if (cond.indicator === 'SMA' && cond.period) smaPeriods.add(cond.period);
        if (cond.indicator === 'EMA' && cond.period) emaPeriods.add(cond.period);
        if (cond.indicator === 'RSI' && cond.period) rsiPeriods.add(cond.period);
        if (cond.indicator === 'MACD') needsMacd = true;
        if (cond.indicator === 'BOLLINGER') needsBollinger = true;
        // Also check value if it's an indicator ref
        if (typeof cond.value === 'object' && cond.value) {
          const ref = cond.value;
          if (ref.indicator === 'SMA' && ref.period) smaPeriods.add(ref.period);
          if (ref.indicator === 'EMA' && ref.period) emaPeriods.add(ref.period);
          if (ref.indicator === 'RSI' && ref.period) rsiPeriods.add(ref.period);
        }
      }
    }
  }

  scan(strategy.entryConditions);
  scan(strategy.exitConditions);
  return { smaPeriods, emaPeriods, rsiPeriods, needsMacd, needsBollinger };
}

export function runBacktest(config: BacktestConfig): BacktestResult {
  const { symbol, initialCapital, commissionRate, slippageRate, strategy, data } = config;

  if (data.length === 0) {
    throw new Error('No market data provided for backtest');
  }

  const portfolio = new Portfolio(initialCapital);
  const trades: Trade[] = [];
  const snapshotsList: import('../portfolio/portfolio.js').PortfolioSnapshot[] = [];

  const { smaPeriods, emaPeriods, rsiPeriods, needsMacd, needsBollinger } = collectPeriods(strategy);
  const costConfig = { commissionRate, slippageRate };

  // Running buffers
  const closePrices: number[] = [];
  const emaStates: Map<number, number | null> = new Map(); // period → current EMA
  const rsiStates: Map<number, RSIState | null> = new Map(); // period → state

  // Current and previous indicator values
  let currentIndicators: IndicatorValues | null = null;
  let prevIndicators: IndicatorValues | null = null;

  let pendingOrder: PendingOrder | null = null;
  let openTrade: Trade | null = null;
  let barsInMarket = 0;

  for (let i = 0; i < data.length; i++) {
    const bar = data[i];
    const priceMap = new Map([[symbol, bar.open]]);

    // ─── Step 1: Fill pending order at THIS bar's OPEN ────────────────────────
    if (pendingOrder) {
      const side = pendingOrder.side;
      const rawPrice = bar.open;
      const fillPrice = applySlippage(rawPrice, side, slippageRate);

      if (side === 'BUY' && !portfolio.hasPosition(symbol)) {
        // Calculate quantity based on positionSizing
        let qty: number;
        const equityNow = portfolio.equity(priceMap);
        if (strategy.positionSizing?.type === 'FIXED_AMOUNT') {
          qty = Math.floor(strategy.positionSizing.value / fillPrice);
        } else {
          // PERCENTAGE (default 100%)
          const pct = (strategy.positionSizing?.value ?? 100) / 100;
          qty = Math.floor((equityNow * pct) / fillPrice);
        }

        if (qty > 0) {
          const costs = calculateTradeCosts(qty, fillPrice, costConfig);
          const actualQty = portfolio.buy(symbol, qty, fillPrice, costs);
          if (actualQty > 0) {
            openTrade = {
              symbol,
              side: 'BUY',
              quantity: actualQty,
              entryPrice: fillPrice,
              entryTime: bar.timestamp,
              costs,
              status: 'OPEN',
            };
          }
        }
      } else if (side === 'SELL' && portfolio.hasPosition(symbol)) {
        const position = portfolio.getPosition(symbol)!;
        const qty = position.quantity;
        const costs = calculateTradeCosts(qty, fillPrice, costConfig);
        const netPnl = portfolio.sell(symbol, qty, fillPrice, costs);

        if (openTrade) {
          const grossPnl = (fillPrice - openTrade.entryPrice) * qty;
          const entryDate = new Date(openTrade.entryTime);
          const exitDate = new Date(bar.timestamp);
          const holdingDays = Math.round(
            (exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          trades.push({
            ...openTrade,
            exitPrice: fillPrice,
            exitTime: bar.timestamp,
            grossPnl,
            costs: openTrade.costs + costs,
            netPnl,
            status: 'CLOSED',
            holdingDays,
          });
          openTrade = null;
        }
      }

      pendingOrder = null;
    }

    // Track market exposure
    if (portfolio.hasPosition(symbol)) {
      barsInMarket++;
    }

    // ─── Step 2: Update indicator buffers with CLOSE price ────────────────────
    closePrices.push(bar.close);

    // Snapshot previous indicators as a stable typed reference
    const prevSnap: IndicatorValues | null = currentIndicators;
    prevIndicators = prevSnap;

    const smaValues = new Map<number, number | null>();
    const prevSmaValues = prevSnap ? prevSnap.SMA : new Map<number, number | null>();
    for (const p of smaPeriods) {
      smaValues.set(p, getSMAValue(closePrices, p));
    }

    const emaValues = new Map<number, number | null>();
    for (const p of emaPeriods) {
      const prev = emaStates.get(p) ?? null;
      const newEma = computeEMAIncremental(prev, bar.close, p, closePrices.length);
      emaStates.set(p, newEma);
      emaValues.set(p, newEma);
    }

    const rsiValues = new Map<number, number | null>();
    for (const p of rsiPeriods) {
      const state = rsiStates.get(p) ?? null;
      const { value, state: newState } = computeRSIIncremental(state, bar.close, p);
      rsiStates.set(p, newState);
      rsiValues.set(p, value);
    }

    const macdResult = needsMacd && closePrices.length >= 26
      ? (() => {
          const allMacd = calculateMACD(closePrices);
          return allMacd[allMacd.length - 1];
        })()
      : null;

    const bollingerResult = needsBollinger
      ? getBollingerValue(closePrices, 20)
      : null;

    // Extract prev fields into locals to avoid TypeScript narrowing issues
    const prevSMA: Map<number, number | null> = prevSnap !== null ? prevSnap.SMA : new Map<number, number | null>();
    const prevEMA: Map<number, number | null> = prevSnap !== null ? prevSnap.EMA : new Map<number, number | null>();
    const prevRSI: Map<number, number | null> = prevSnap !== null ? prevSnap.RSI : new Map<number, number | null>();
    const prevPRICE: number = prevSnap !== null ? prevSnap.PRICE : bar.close;
    const prevVOLUME: number = prevSnap !== null ? prevSnap.VOLUME : bar.volume;

    currentIndicators = {
      PRICE: bar.close,
      VOLUME: bar.volume,
      SMA: smaValues,
      EMA: emaValues,
      RSI: rsiValues,
      MACD: macdResult,
      BOLLINGER: bollingerResult ? { upper: bollingerResult.upper, middle: bollingerResult.middle, lower: bollingerResult.lower } : null,
      prev: {
        SMA: prevSMA,
        EMA: prevEMA,
        RSI: prevRSI,
        PRICE: prevPRICE,
        VOLUME: prevVOLUME,
      },
    };

    // ─── Step 3: Evaluate strategy ────────────────────────────────────────────
    const hasPosition = portfolio.hasPosition(symbol);
    const position = portfolio.getPosition(symbol);
    const unrealizedPnlPct = position && hasPosition
      ? position.unrealizedPnlPct(bar.close)
      : null;

    const signal = evaluateStrategy(strategy, currentIndicators, hasPosition, unrealizedPnlPct);

    // ─── Step 4: Queue signal for execution on NEXT bar ───────────────────────
    if (signal === 'BUY' && !hasPosition) {
      pendingOrder = { side: 'BUY', signal_timestamp: bar.timestamp };
    } else if (signal === 'SELL' && hasPosition) {
      pendingOrder = { side: 'SELL', signal_timestamp: bar.timestamp };
    }

    // ─── Step 5: Record equity snapshot at close ──────────────────────────────
    const closePriceMap = new Map([[symbol, bar.close]]);
    snapshotsList.push(portfolio.snapshot(bar.timestamp, closePriceMap));
  }

  // Close any open trade at last bar's close
  if (openTrade && portfolio.hasPosition(symbol)) {
    const lastBar = data[data.length - 1];
    const fillPrice = lastBar.close;
    const position = portfolio.getPosition(symbol)!;
    const qty = position.quantity;
    const costs = calculateTradeCosts(qty, fillPrice, costConfig);
    const netPnl = portfolio.sell(symbol, qty, fillPrice, costs);
    const grossPnl = (fillPrice - openTrade.entryPrice) * qty;
    const holdingDays = Math.round(
      (new Date(lastBar.timestamp).getTime() - new Date(openTrade.entryTime).getTime()) / (1000 * 60 * 60 * 24)
    );
    trades.push({
      ...openTrade,
      exitPrice: fillPrice,
      exitTime: lastBar.timestamp,
      grossPnl,
      costs: openTrade.costs + costs,
      netPnl,
      status: 'CLOSED',
      holdingDays,
    });
  }

  const finalEquity = portfolio.equity(new Map([[symbol, data[data.length - 1]?.close ?? 0]]));

  return {
    symbol,
    dateStart: data[0].timestamp,
    dateEnd: data[data.length - 1].timestamp,
    initialCapital,
    finalEquity,
    trades,
    equitySnapshots: snapshotsList,
    totalCosts: portfolio.totalCosts,
    totalBars: data.length,
    barsInMarket,
  };
}
