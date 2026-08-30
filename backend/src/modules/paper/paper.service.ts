import { query, getClient } from '../../config/database.js';
import { InitAccountDTO, PlaceOrderDTO } from './paper.dto.js';
import { AppError } from '../../middleware/error-handler.middleware.js';

export class PaperService {
  
  static async getAccount(userId: string) {
    const accRes = await query(`
      SELECT * FROM paper_accounts WHERE user_id = $1 LIMIT 1
    `, [userId]);
    
    if (!accRes.rows[0]) return null;
    const account = accRes.rows[0];

    // Fetch positions based on filled orders
    const posRes = await query(`
      SELECT symbol, 
             SUM(CASE WHEN side = 'BUY' THEN quantity ELSE -quantity END) as quantity,
             SUM(CASE WHEN side = 'BUY' THEN quantity * price ELSE -quantity * price END) as cost_basis
      FROM paper_orders 
      WHERE account_id = $1 AND status = 'FILLED'
      GROUP BY symbol
      HAVING SUM(CASE WHEN side = 'BUY' THEN quantity ELSE -quantity END) > 0
    `, [account.id]);

    const positions = posRes.rows.map(r => ({
      symbol: r.symbol,
      quantity: Number(r.quantity),
      average_entry: Number(r.cost_basis) / Number(r.quantity), // simplified avg entry
    }));

    return {
      ...account,
      cash: Number(account.cash),
      initial_capital: Number(account.initial_capital),
      positions,
    };
  }

  static async initAccount(userId: string, dto: InitAccountDTO) {
    const existing = await this.getAccount(userId);
    if (existing) throw new AppError('Paper account already exists', 400);

    const res = await query(`
      INSERT INTO paper_accounts (user_id, name, initial_capital, cash, status)
      VALUES ($1, $2, $3, $3, 'ACTIVE')
      RETURNING *
    `, [userId, dto.name, dto.initialCapital]);

    return res.rows[0];
  }

  static async placeOrder(userId: string, dto: PlaceOrderDTO) {
    const account = await this.getAccount(userId);
    if (!account) throw new AppError('Paper account not initialized', 404);

    const totalCost = dto.quantity * dto.price;

    const client = await getClient();
    try {
      await client.query('BEGIN');

      if (dto.side === 'BUY') {
        if (account.cash < totalCost) {
          throw new AppError('Insufficient cash for this order', 400);
        }
        // Deduct cash
        await client.query(`
          UPDATE paper_accounts SET cash = cash - $1 WHERE id = $2
        `, [totalCost, account.id]);
      } else {
        // Check if enough quantity
        const position = account.positions.find((p: any) => p.symbol === dto.symbol);
        if (!position || position.quantity < dto.quantity) {
          throw new AppError('Insufficient position quantity to sell', 400);
        }
        // Add cash
        await client.query(`
          UPDATE paper_accounts SET cash = cash + $1 WHERE id = $2
        `, [totalCost, account.id]);
      }

      // Insert filled order
      const orderRes = await client.query(`
        INSERT INTO paper_orders (account_id, symbol, side, quantity, price, order_type, status, filled_at)
        VALUES ($1, $2, $3, $4, $5, $6, 'FILLED', NOW())
        RETURNING *
      `, [account.id, dto.symbol, dto.side, dto.quantity, dto.price, dto.orderType]);

      await client.query('COMMIT');
      return orderRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getOrders(userId: string) {
    const account = await this.getAccount(userId);
    if (!account) return [];

    const res = await query(`
      SELECT * FROM paper_orders 
      WHERE account_id = $1 
      ORDER BY created_at DESC
    `, [account.id]);

    return res.rows;
  }

  static async resetAccount(userId: string) {
    const account = await this.getAccount(userId);
    if (!account) throw new AppError('Paper account not found', 404);

    const client = await getClient();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM paper_orders WHERE account_id = $1', [account.id]);
      await client.query('UPDATE paper_accounts SET cash = initial_capital WHERE id = $1', [account.id]);
      await client.query('COMMIT');
      return this.getAccount(userId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
