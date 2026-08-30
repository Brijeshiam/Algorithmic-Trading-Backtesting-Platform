import { query } from '../../config/database.js';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  exchange: string | null;
  asset_type: string;
  created_at: string;
  // enriched fields
  data_start?: string;
  data_end?: string;
  candle_count?: number;
  latest_price?: number;
}

export interface OHLCVCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class MarketDataService {
  /**
   * Fetch all available assets, enriched with their data coverage info.
   */
  static async getAssets(): Promise<Asset[]> {
    const res = await query<Asset>(`
      SELECT 
        a.id, a.symbol, a.name, a.exchange, a.asset_type, a.created_at,
        MIN(md.timestamp) AS data_start,
        MAX(md.timestamp) AS data_end,
        COUNT(md.id)::int AS candle_count,
        (
          SELECT close::float 
          FROM market_data 
          WHERE asset_id = a.id 
          ORDER BY timestamp DESC 
          LIMIT 1
        ) AS latest_price
      FROM assets a
      LEFT JOIN market_data md ON md.asset_id = a.id
      GROUP BY a.id
      ORDER BY a.symbol ASC
    `);
    return res.rows;
  }

  /**
   * Fetch a single asset by symbol.
   */
  static async getAsset(symbol: string): Promise<Asset | null> {
    const res = await query<Asset>(`
      SELECT 
        a.id, a.symbol, a.name, a.exchange, a.asset_type, a.created_at,
        MIN(md.timestamp) AS data_start,
        MAX(md.timestamp) AS data_end,
        COUNT(md.id)::int AS candle_count
      FROM assets a
      LEFT JOIN market_data md ON md.asset_id = a.id
      WHERE UPPER(a.symbol) = UPPER($1)
      GROUP BY a.id
    `, [symbol]);
    return res.rows[0] || null;
  }

  /**
   * Fetch OHLCV candles for a symbol in a date range.
   */
  static async getMarketData(
    symbol: string,
    from?: string,
    to?: string,
    limit: number = 1000
  ): Promise<OHLCVCandle[]> {
    const params: any[] = [symbol];
    let whereClauses = `WHERE UPPER(a.symbol) = UPPER($1)`;

    if (from) {
      params.push(from);
      whereClauses += ` AND md.timestamp >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      whereClauses += ` AND md.timestamp <= $${params.length}`;
    }

    params.push(limit);

    const res = await query<OHLCVCandle>(`
      SELECT 
        md.timestamp,
        md.open::float,
        md.high::float,
        md.low::float,
        md.close::float,
        md.volume
      FROM market_data md
      JOIN assets a ON a.id = md.asset_id
      ${whereClauses}
      ORDER BY md.timestamp ASC
      LIMIT $${params.length}
    `, params);

    return res.rows;
  }
}
