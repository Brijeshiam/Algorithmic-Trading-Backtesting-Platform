import { query } from '../../config/database.js';

export class DashboardService {
  /**
   * Get dashboard summary for a user.
   * Returns aggregated counts and highlights across strategies, backtests, and performance.
   */
  async getSummary(userId: string) {
    // Run all queries in parallel for performance
    const [
      strategyCount,
      backtestCount,
      bestSharpe,
      worstDrawdown,
      recentBacktests,
      avgReturn,
    ] = await Promise.all([
      // Total strategies
      query('SELECT COUNT(*) FROM strategies WHERE user_id = $1', [userId]),
      
      // Total backtests
      query('SELECT COUNT(*) FROM backtests WHERE user_id = $1', [userId]),
      
      // Best Sharpe ratio (prioritize backtests with executed trades)
      query(
        `SELECT bm.sharpe_ratio, s.name as strategy_name
         FROM backtest_metrics bm
         JOIN backtests b ON b.id = bm.backtest_id
         JOIN strategies s ON s.id = b.strategy_id
         WHERE b.user_id = $1 AND bm.sharpe_ratio IS NOT NULL
         ORDER BY (CASE WHEN bm.trade_count > 0 THEN 1 ELSE 0 END) DESC, bm.sharpe_ratio DESC LIMIT 1`,
        [userId]
      ),
      
      // Worst max drawdown (highest percentage drawdown among backtests with trades)
      query(
        `SELECT bm.max_drawdown, s.name as strategy_name
         FROM backtest_metrics bm
         JOIN backtests b ON b.id = bm.backtest_id
         JOIN strategies s ON s.id = b.strategy_id
         WHERE b.user_id = $1 AND bm.max_drawdown IS NOT NULL
         ORDER BY (CASE WHEN bm.trade_count > 0 THEN 1 ELSE 0 END) DESC, bm.max_drawdown DESC LIMIT 1`,
        [userId]
      ),
      
      // Recent backtests (last 5)
      query(
        `SELECT b.id, b.status, b.created_at, b.initial_capital,
                s.name as strategy_name, a.symbol,
                bm.total_return, bm.sharpe_ratio
         FROM backtests b
         JOIN strategies s ON s.id = b.strategy_id
         JOIN assets a ON a.id = b.asset_id
         LEFT JOIN backtest_metrics bm ON bm.backtest_id = b.id
         WHERE b.user_id = $1
         ORDER BY b.created_at DESC LIMIT 5`,
        [userId]
      ),
      
      // Average return across all completed backtests
      query(
        `SELECT AVG(bm.total_return) as avg_return
         FROM backtest_metrics bm
         JOIN backtests b ON b.id = bm.backtest_id
         WHERE b.user_id = $1 AND b.status = 'COMPLETED'`,
        [userId]
      ),
    ]);

    return {
      totalStrategies: parseInt(strategyCount.rows[0].count, 10),
      totalBacktests: parseInt(backtestCount.rows[0].count, 10),
      bestSharpe: bestSharpe.rows[0] ? {
        value: parseFloat(bestSharpe.rows[0].sharpe_ratio),
        strategyName: bestSharpe.rows[0].strategy_name,
      } : null,
      worstDrawdown: worstDrawdown.rows[0] ? {
        value: parseFloat(worstDrawdown.rows[0].max_drawdown),
        strategyName: worstDrawdown.rows[0].strategy_name,
      } : null,
      avgReturn: avgReturn.rows[0]?.avg_return
        ? parseFloat(avgReturn.rows[0].avg_return)
        : null,
      recentBacktests: recentBacktests.rows.map((b) => ({
        id: b.id,
        strategyName: b.strategy_name,
        symbol: b.symbol,
        status: b.status,
        initialCapital: parseFloat(b.initial_capital),
        totalReturn: b.total_return ? parseFloat(b.total_return) : null,
        sharpeRatio: b.sharpe_ratio ? parseFloat(b.sharpe_ratio) : null,
        createdAt: b.created_at,
      })),
    };
  }
}

export const dashboardService = new DashboardService();
