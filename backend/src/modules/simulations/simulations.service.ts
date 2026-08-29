import { query, getClient } from '../../config/database.js';
import { RunMonteCarloDTO } from './simulations.dto.js';
import { AppError } from '../../middleware/error-handler.middleware.js';

export class SimulationsService {
  static async runMonteCarlo(userId: string, dto: RunMonteCarloDTO) {
    const { backtestId, simulations } = dto;

    // 1. Validate backtest ownership and status
    const btRes = await query(`
      SELECT id, initial_capital, status 
      FROM backtests 
      WHERE id = $1 AND user_id = $2
    `, [backtestId, userId]);

    if (!btRes.rows[0]) throw new AppError('Backtest not found or access denied', 404);
    if (btRes.rows[0].status !== 'COMPLETED') throw new AppError('Cannot run Monte Carlo on incomplete backtest', 400);

    const initialCapital = Number(btRes.rows[0].initial_capital);

    // 2. Fetch trades
    const tradesRes = await query(`
      SELECT net_pnl FROM trades WHERE backtest_id = $1 AND status = 'CLOSED'
    `, [backtestId]);

    const trades = tradesRes.rows.map(r => Number(r.net_pnl || 0));

    if (trades.length < 5) {
      throw new AppError('Not enough closed trades to run a meaningful Monte Carlo simulation (minimum 5 required).', 400);
    }

    // 3. Create simulation job record
    const jobRes = await query(`
      INSERT INTO simulation_jobs (user_id, type, backtest_id, status)
      VALUES ($1, 'MONTE_CARLO', $2, 'RUNNING')
      RETURNING id
    `, [userId, backtestId]);
    const jobId = jobRes.rows[0].id;

    try {
      // 4. Run Simulation
      const finalReturns: number[] = [];
      let winningSims = 0;

      for (let i = 0; i < simulations; i++) {
        let simEquity = initialCapital;
        for (let t = 0; t < trades.length; t++) {
          const randomTradeIndex = Math.floor(Math.random() * trades.length);
          simEquity += trades[randomTradeIndex];
          // Prevent negative balance
          if (simEquity < 0) simEquity = 0; 
        }

        const simReturn = ((simEquity - initialCapital) / initialCapital) * 100;
        finalReturns.push(simReturn);

        if (simReturn > 0) {
          winningSims++;
        }
      }

      // Sort returns for percentiles
      finalReturns.sort((a, b) => a - b);

      const getPercentile = (p: number) => {
        const index = Math.floor(p * (finalReturns.length - 1));
        return finalReturns[index];
      };

      const medianReturn = getPercentile(0.5);
      const p5Return = getPercentile(0.05);
      const p25Return = getPercentile(0.25);
      const p75Return = getPercentile(0.75);
      const p95Return = getPercentile(0.95);
      const probabilityOfProfit = (winningSims / simulations) * 100;

      // 5. Generate Histogram Bins (50 bins)
      const minReturn = finalReturns[0];
      const maxReturn = finalReturns[finalReturns.length - 1];
      const binCount = 50;
      const binSize = (maxReturn - minReturn) / binCount;
      
      const bins = Array.from({ length: binCount }, (_, i) => ({
        rangeStart: minReturn + i * binSize,
        rangeEnd: minReturn + (i + 1) * binSize,
        count: 0
      }));

      for (const r of finalReturns) {
        let binIndex = Math.floor((r - minReturn) / binSize);
        if (binIndex >= binCount) binIndex = binCount - 1; // edge case for max value
        bins[binIndex].count++;
      }

      const resultsJson = {
        histogram: bins,
      };

      const client = await getClient();
      try {
        await client.query('BEGIN');

        // Delete any existing monte_carlo_results for this backtest to keep 1:1 relation
        await client.query(`DELETE FROM monte_carlo_results WHERE backtest_id = $1`, [backtestId]);

        // Insert new results
        await client.query(`
          INSERT INTO monte_carlo_results (
            backtest_id, simulation_count, median_return, p5_return, p25_return, 
            p75_return, p95_return, probability_of_profit, results_json
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          backtestId, simulations, medianReturn, p5Return, p25Return, 
          p75Return, p95Return, probabilityOfProfit, JSON.stringify(resultsJson)
        ]);

        // Update Job
        await client.query(`
          UPDATE simulation_jobs SET status = 'COMPLETED', completed_at = NOW() WHERE id = $1
        `, [jobId]);

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }

      return await this.getMonteCarloResult(userId, backtestId);

    } catch (error: any) {
      await query(`
        UPDATE simulation_jobs SET status = 'FAILED', error_message = $1, completed_at = NOW() WHERE id = $2
      `, [error.message, jobId]);
      throw error;
    }
  }

  static async getMonteCarloResult(userId: string, backtestId: string) {
    // Validate ownership
    const btRes = await query(`SELECT id FROM backtests WHERE id = $1 AND user_id = $2`, [backtestId, userId]);
    if (!btRes.rows[0]) throw new Error('Backtest not found or access denied');

    const res = await query(`
      SELECT * FROM monte_carlo_results WHERE backtest_id = $1 ORDER BY created_at DESC LIMIT 1
    `, [backtestId]);

    return res.rows[0] || null;
  }
}
