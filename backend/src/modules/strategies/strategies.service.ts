import { query, getClient } from '../../config/database.js';
import { CreateStrategyDTO, UpdateStrategyDTO } from './strategies.dto.js';
import { StrategyValidator } from './strategies.validator.js';

export class StrategiesService {
  /**
   * Create a new strategy and its initial version
   */
  static async createStrategy(userId: string, data: CreateStrategyDTO) {
    // Validate the JSON structure before inserting
    StrategyValidator.validateDefinition(data.definition_json);

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Insert into strategies
      const strategyRes = await client.query(
        `INSERT INTO strategies (user_id, name, description, status) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, description, status, created_at, updated_at`,
        [userId, data.name, data.description || null, data.status]
      );
      const strategy = strategyRes.rows[0];

      // 2. Insert into strategy_versions
      const versionRes = await client.query(
        `INSERT INTO strategy_versions (strategy_id, version, definition_json, notes) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id as version_id, version, definition_json, notes, created_at`,
        [strategy.id, 1, JSON.stringify(data.definition_json), 'Initial version']
      );
      const version = versionRes.rows[0];

      await client.query('COMMIT');
      return { ...strategy, latest_version: version };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all strategies for a user (with pagination)
   */
  static async getStrategies(userId: string, limit: number = 50, offset: number = 0) {
    const res = await query(
      `SELECT s.id, s.name, s.description, s.status, s.created_at, s.updated_at,
              (SELECT MAX(version) FROM strategy_versions WHERE strategy_id = s.id) as version_count
       FROM strategies s 
       WHERE s.user_id = $1 
       ORDER BY s.updated_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return res.rows;
  }

  /**
   * Get a specific strategy and its latest version
   */
  static async getStrategy(userId: string, strategyId: string) {
    const strategyRes = await query(
      `SELECT id, name, description, status, created_at, updated_at 
       FROM strategies 
       WHERE id = $1 AND user_id = $2`,
      [strategyId, userId]
    );

    if (strategyRes.rows.length === 0) {
      return null;
    }

    const strategy = strategyRes.rows[0];

    const versionRes = await query(
      `SELECT id as version_id, version, definition_json, notes, created_at 
       FROM strategy_versions 
       WHERE strategy_id = $1 
       ORDER BY version DESC LIMIT 1`,
      [strategyId]
    );

    return { ...strategy, latest_version: versionRes.rows[0] };
  }

  /**
   * Update a strategy. If definition_json is provided, creates a new version.
   */
  static async updateStrategy(userId: string, strategyId: string, data: UpdateStrategyDTO) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Verify ownership
      const checkRes = await client.query('SELECT id FROM strategies WHERE id = $1 AND user_id = $2', [strategyId, userId]);
      if (checkRes.rows.length === 0) {
        throw new Error('Strategy not found or unauthorized');
      }

      // Update strategy metadata if provided
      if (data.name || data.description !== undefined || data.status) {
        const fields = [];
        const values = [];
        let i = 1;
        if (data.name) { fields.push(`name = $${i++}`); values.push(data.name); }
        if (data.description !== undefined) { fields.push(`description = $${i++}`); values.push(data.description); }
        if (data.status) { fields.push(`status = $${i++}`); values.push(data.status); }
        
        fields.push(`updated_at = NOW()`);
        
        values.push(strategyId, userId);
        const queryText = `UPDATE strategies SET ${fields.join(', ')} WHERE id = $${i-1} AND user_id = $${i} RETURNING *`;
        await client.query(queryText, values);
      }

      // If definition provided, validate and create new version
      let newVersion = null;
      if (data.definition_json) {
        StrategyValidator.validateDefinition(data.definition_json);
        
        const latestRes = await client.query('SELECT MAX(version) as max_v FROM strategy_versions WHERE strategy_id = $1', [strategyId]);
        const nextVersion = (latestRes.rows[0].max_v || 0) + 1;

        const versionRes = await client.query(
          `INSERT INTO strategy_versions (strategy_id, version, definition_json, notes) 
           VALUES ($1, $2, $3, $4) 
           RETURNING id as version_id, version, definition_json, notes, created_at`,
          [strategyId, nextVersion, JSON.stringify(data.definition_json), 'Updated via builder']
        );
        newVersion = versionRes.rows[0];
        
        // Also update the updated_at timestamp if we only updated definition
        await client.query('UPDATE strategies SET updated_at = NOW() WHERE id = $1', [strategyId]);
      }

      await client.query('COMMIT');
      
      return await this.getStrategy(userId, strategyId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete a strategy
   */
  static async deleteStrategy(userId: string, strategyId: string) {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      // Delete associated backtests first to satisfy foreign key constraints
      await client.query(
        'DELETE FROM backtests WHERE strategy_id = $1 AND user_id = $2',
        [strategyId, userId]
      );
      
      // Delete the strategy itself
      const res = await client.query(
        'DELETE FROM strategies WHERE id = $1 AND user_id = $2 RETURNING id',
        [strategyId, userId]
      );
      
      await client.query('COMMIT');
      return res.rows.length > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all versions of a strategy
   */
  static async getStrategyVersions(userId: string, strategyId: string) {
    // Verify ownership
    const checkRes = await query('SELECT id FROM strategies WHERE id = $1 AND user_id = $2', [strategyId, userId]);
    if (checkRes.rows.length === 0) {
      return null;
    }

    const res = await query(
      `SELECT id as version_id, version, definition_json, notes, created_at 
       FROM strategy_versions 
       WHERE strategy_id = $1 
       ORDER BY version DESC`,
      [strategyId]
    );
    return res.rows;
  }

  static async getLeaderboard(userId: string) {
    const res = await query(`
      WITH RankedBacktests AS (
        SELECT 
          s.id AS strategy_id,
          s.name AS strategy_name,
          s.status AS strategy_status,
          a.symbol,
          b.id AS backtest_id,
          bm.sharpe_ratio,
          bm.max_drawdown,
          bm.total_return,
          bm.win_rate,
          ROW_NUMBER() OVER(PARTITION BY s.id ORDER BY bm.sharpe_ratio DESC NULLS LAST) as rn
        FROM strategies s
        JOIN backtests b ON b.strategy_id = s.id
        JOIN backtest_metrics bm ON bm.backtest_id = b.id
        JOIN assets a ON a.id = b.asset_id
        WHERE s.user_id = $1 AND b.status = 'COMPLETED'
      )
      SELECT 
        strategy_id, strategy_name, strategy_status, symbol, backtest_id,
        sharpe_ratio, max_drawdown, total_return, win_rate
      FROM RankedBacktests
      WHERE rn = 1 AND sharpe_ratio IS NOT NULL
      ORDER BY sharpe_ratio DESC
      LIMIT 100
    `, [userId]);

    return res.rows.map(row => ({
      strategyId: row.strategy_id,
      strategyName: row.strategy_name,
      status: row.strategy_status,
      symbol: row.symbol,
      backtestId: row.backtest_id,
      sharpeRatio: Number(row.sharpe_ratio),
      maxDrawdown: Number(row.max_drawdown),
      totalReturn: Number(row.total_return),
      winRate: Number(row.win_rate),
    }));
  }
}

