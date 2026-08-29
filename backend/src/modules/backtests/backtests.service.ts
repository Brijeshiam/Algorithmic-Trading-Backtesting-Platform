/**
 * Backtests Service
 * 
 * Orchestrates:
 * 1. Load strategy definition from DB
 * 2. Load OHLCV data from DB
 * 3. Run the quant engine backtest
 * 4. Persist results (backtest record, metrics, trades, equity snapshots)
 */

import { query, getClient } from '../../config/database.js';
import { RunBacktestDTO } from './backtests.dto.js';

// ── Types returned from DB ────────────────────────────────────────────────────
interface DBStrategy {
  id: string;
  name: string;
  definition_json: any;
  version: number;
  version_id: string;
}

interface DBMarketData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ── Performance Metrics Calculator ────────────────────────────────────────────

interface Metrics {
  totalReturn: number;
  cagr: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  tradeCount: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  exposure: number;
  avgHoldingDays: number;
  grossProfit: number;
  grossLoss: number;
  totalCosts: number;
  finalEquity: number;
}

function calculateMetrics(result: any): Metrics {
  const { initialCapital, finalEquity, trades, equitySnapshots, totalBars, barsInMarket, totalCosts } = result;

  const totalReturn = ((finalEquity - initialCapital) / initialCapital) * 100;

  // CAGR: years from first to last snapshot
  const firstDate = new Date(equitySnapshots[0]?.timestamp ?? Date.now());
  const lastDate = new Date(equitySnapshots[equitySnapshots.length - 1]?.timestamp ?? Date.now());
  const years = (lastDate.getTime() - firstDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const cagr = years > 0 ? ((finalEquity / initialCapital) ** (1 / years) - 1) * 100 : 0;

  // Daily returns from equity curve
  const equityValues: number[] = equitySnapshots.map((s: any) => s.equity);
  const dailyReturns: number[] = [];
  for (let i = 1; i < equityValues.length; i++) {
    if (equityValues[i - 1] > 0) {
      dailyReturns.push((equityValues[i] - equityValues[i - 1]) / equityValues[i - 1]);
    }
  }

  // Volatility (annualized daily std dev)
  const meanReturn = dailyReturns.reduce((a, b) => a + b, 0) / (dailyReturns.length || 1);
  const variance = dailyReturns.reduce((acc, r) => acc + (r - meanReturn) ** 2, 0) / (dailyReturns.length || 1);
  const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100;

  // Sharpe (risk-free rate = 0 for simplicity)
  const sharpeRatio = volatility > 0 ? (cagr / volatility) : 0;

  // Sortino (downside deviation only)
  const downside = dailyReturns.filter(r => r < 0);
  const downsideVar = downside.reduce((acc, r) => acc + r ** 2, 0) / (downside.length || 1);
  const downsideStd = Math.sqrt(downsideVar) * Math.sqrt(252) * 100;
  const sortinoRatio = downsideStd > 0 ? (cagr / downsideStd) : 0;

  // Max Drawdown
  let peak = equityValues[0] ?? initialCapital;
  let maxDD = 0;
  for (const eq of equityValues) {
    if (eq > peak) peak = eq;
    const dd = (peak - eq) / peak;
    if (dd > maxDD) maxDD = dd;
  }

  // Trade stats
  const closedTrades = trades.filter((t: any) => t.status === 'CLOSED' && t.netPnl !== undefined);
  const winners = closedTrades.filter((t: any) => (t.netPnl ?? 0) > 0);
  const losers = closedTrades.filter((t: any) => (t.netPnl ?? 0) < 0);

  const winRate = closedTrades.length > 0 ? (winners.length / closedTrades.length) * 100 : 0;
  const grossProfit = winners.reduce((s: number, t: any) => s + (t.grossPnl ?? 0), 0);
  const grossLoss = Math.abs(losers.reduce((s: number, t: any) => s + (t.grossPnl ?? 0), 0));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : (grossProfit > 0 ? 99.99 : 0);

  const avgWin = winners.length > 0 ? grossProfit / winners.length : 0;
  const avgLoss = losers.length > 0 ? grossLoss / losers.length : 0;
  const largestWin = winners.length > 0 ? Math.max(...winners.map((t: any) => t.grossPnl ?? 0)) : 0;
  const largestLoss = losers.length > 0 ? Math.max(...losers.map((t: any) => Math.abs(t.grossPnl ?? 0))) : 0;

  const exposure = totalBars > 0 ? (barsInMarket / totalBars) * 100 : 0;
  const avgHoldingDays = closedTrades.length > 0
    ? closedTrades.reduce((s: number, t: any) => s + (t.holdingDays ?? 0), 0) / closedTrades.length
    : 0;

  return {
    totalReturn, cagr, volatility, sharpeRatio, sortinoRatio,
    maxDrawdown: maxDD * 100, winRate, profitFactor,
    tradeCount: closedTrades.length, avgWin, avgLoss, largestWin, largestLoss,
    exposure, avgHoldingDays, grossProfit, grossLoss, totalCosts, finalEquity,
  };
}

export class BacktestsService {
  static async listBacktests(userId: string) {
    const res = await query(`
      SELECT 
        b.id, b.status, b.initial_capital, b.created_at,
        b.date_range_start, b.date_range_end,
        s.name AS strategy_name,
        a.symbol,
        bm.total_return, bm.sharpe_ratio, bm.max_drawdown, bm.trade_count,
        bm.final_equity
      FROM backtests b
      JOIN strategies s ON s.id = b.strategy_id
      JOIN assets a ON a.id = b.asset_id
      LEFT JOIN backtest_metrics bm ON bm.backtest_id = b.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
      LIMIT 100
    `, [userId]);
    return res.rows;
  }

  static async getBacktest(userId: string, backtestId: string) {
    const res = await query(`
      SELECT 
        b.*,
        s.name AS strategy_name,
        a.symbol,
        bm.*
      FROM backtests b
      JOIN strategies s ON s.id = b.strategy_id
      JOIN assets a ON a.id = b.asset_id
      LEFT JOIN backtest_metrics bm ON bm.backtest_id = b.id
      WHERE b.id = $1 AND b.user_id = $2
    `, [backtestId, userId]);

    if (!res.rows[0]) return null;

    // Get trades
    const tradesRes = await query(`
      SELECT * FROM trades WHERE backtest_id = $1 ORDER BY entry_time ASC
    `, [backtestId]);

    // Get equity snapshots (sampled to max 500 points)
    const snapshotsRes = await query(`
      SELECT timestamp, equity, cash, positions_value
      FROM equity_snapshots
      WHERE backtest_id = $1
      ORDER BY timestamp ASC
    `, [backtestId]);

    return {
      ...res.rows[0],
      trades: tradesRes.rows,
      equitySnapshots: snapshotsRes.rows,
    };
  }

  static async runBacktest(userId: string, dto: RunBacktestDTO): Promise<string> {
    // ── 1. Load strategy ───────────────────────────────────────────────────────
    const stratRes = await query<DBStrategy>(`
      SELECT s.id, s.name, sv.definition_json, sv.version, sv.id AS version_id
      FROM strategies s
      JOIN strategy_versions sv ON sv.strategy_id = s.id
      WHERE s.id = $1 AND s.user_id = $2
      ORDER BY sv.version DESC
      LIMIT 1
    `, [dto.strategyId, userId]);

    if (!stratRes.rows[0]) throw new Error('Strategy not found or access denied');
    const strategy = stratRes.rows[0];

    // ── 2. Load asset ──────────────────────────────────────────────────────────
    const assetRes = await query<{ id: string }>(`
      SELECT id FROM assets WHERE UPPER(symbol) = UPPER($1)
    `, [dto.symbol]);
    if (!assetRes.rows[0]) throw new Error(`Asset '${dto.symbol}' not found`);
    const assetId = assetRes.rows[0].id;

    // ── 3. Load OHLCV data ─────────────────────────────────────────────────────
    const dataRes = await query<DBMarketData>(`
      SELECT 
        timestamp, 
        open::float, high::float, low::float, close::float, volume
      FROM market_data
      WHERE asset_id = $1
        AND timestamp >= $2
        AND timestamp <= $3
      ORDER BY timestamp ASC
    `, [assetId, dto.dateStart, dto.dateEnd]);

    if (dataRes.rows.length < 30) {
      throw new Error(`Insufficient data: only ${dataRes.rows.length} candles found (minimum 30 required)`);
    }

    // ── 4. Create backtest record ──────────────────────────────────────────────
    const btRes = await query<{ id: string }>(`
      INSERT INTO backtests (user_id, strategy_id, strategy_version_id, asset_id, 
        date_range_start, date_range_end, initial_capital, commission_rate, slippage_rate, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'RUNNING')
      RETURNING id
    `, [
      userId, dto.strategyId, strategy.version_id, assetId,
      dto.dateStart, dto.dateEnd, dto.initialCapital,
      dto.commissionRate, dto.slippageRate
    ]);
    const backtestId = btRes.rows[0].id;

    try {
      await query(`UPDATE backtests SET started_at = NOW() WHERE id = $1`, [backtestId]);

      // ── 5. Run the engine ────────────────────────────────────────────────────
      const { runBacktest } = await import('../../../../quant-engine/dist/index.js' as any);
      const engineResult = runBacktest({
        symbol: dto.symbol,
        initialCapital: dto.initialCapital,
        commissionRate: dto.commissionRate,
        slippageRate: dto.slippageRate,
        strategy: strategy.definition_json,
        data: dataRes.rows,
      });

      // ── 6. Calculate metrics ─────────────────────────────────────────────────
      const metrics = calculateMetrics(engineResult);

      // ── 7. Persist results ───────────────────────────────────────────────────
      const client = await getClient();
      try {
        await client.query('BEGIN');

        // Update backtest status
        await client.query(`
          UPDATE backtests SET status = 'COMPLETED', completed_at = NOW() WHERE id = $1
        `, [backtestId]);

        // Upsert metrics
        await client.query(`
          INSERT INTO backtest_metrics (
            backtest_id, total_return, cagr, volatility, sharpe_ratio, sortino_ratio,
            max_drawdown, win_rate, profit_factor, trade_count, avg_win, avg_loss,
            largest_win, largest_loss, exposure, avg_holding_days, gross_profit,
            gross_loss, total_costs, final_equity
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
        `, [
          backtestId,
          metrics.totalReturn, metrics.cagr, metrics.volatility,
          metrics.sharpeRatio, metrics.sortinoRatio, metrics.maxDrawdown,
          metrics.winRate, metrics.profitFactor, metrics.tradeCount,
          metrics.avgWin, metrics.avgLoss, metrics.largestWin, metrics.largestLoss,
          metrics.exposure, metrics.avgHoldingDays, metrics.grossProfit,
          metrics.grossLoss, metrics.totalCosts, metrics.finalEquity,
        ]);

        // Insert trades
        for (const trade of engineResult.trades) {
          await client.query(`
            INSERT INTO trades (backtest_id, symbol, side, quantity, entry_price, entry_time,
              exit_price, exit_time, gross_pnl, costs, net_pnl, status)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
          `, [
            backtestId, trade.symbol, trade.side, trade.quantity,
            trade.entryPrice, trade.entryTime, trade.exitPrice ?? null,
            trade.exitTime ?? null, trade.grossPnl ?? null,
            trade.costs, trade.netPnl ?? null, trade.status,
          ]);
        }

        // Insert equity snapshots (sample to max 500 for performance)
        const snapshots = engineResult.equitySnapshots;
        const step = Math.max(1, Math.floor(snapshots.length / 500));
        for (let i = 0; i < snapshots.length; i += step) {
          const s = snapshots[i];
          await client.query(`
            INSERT INTO equity_snapshots (backtest_id, timestamp, equity, cash, positions_value)
            VALUES ($1, $2, $3, $4, $5)
          `, [backtestId, s.timestamp, s.equity, s.cash, s.positionsValue]);
        }

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }

      return backtestId;

    } catch (err: any) {
      await query(`
        UPDATE backtests SET status = 'FAILED', error_message = $1 WHERE id = $2
      `, [err.message, backtestId]);
      throw err;
    }
  }
}
