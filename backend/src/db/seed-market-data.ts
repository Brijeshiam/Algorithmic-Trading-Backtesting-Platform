/**
 * Market Data Seeding Script
 * 
 * Generates realistic synthetic OHLCV data for major assets using
 * Geometric Brownian Motion (GBM) — the same model used in Black-Scholes.
 *
 * This gives us ~1200 trading days of data per asset (2020–2024) for testing.
 * 
 * Usage:
 *   npm run db:seed:market
 */

import { query, getClient, closePool } from '../config/database.js';

// ── GBM Parameters by asset ───────────────────────────────────────────────────
const ASSETS: {
  symbol: string;
  startPrice: number;
  annualDrift: number;     // μ — expected annual return (e.g. 0.15 = 15%)
  annualVolatility: number; // σ — annual volatility (e.g. 0.25 = 25%)
  avgDailyVolume: number;
}[] = [
  { symbol: 'AAPL',  startPrice: 75,   annualDrift: 0.28, annualVolatility: 0.32, avgDailyVolume: 85_000_000 },
  { symbol: 'SPY',   startPrice: 320,  annualDrift: 0.15, annualVolatility: 0.18, avgDailyVolume: 70_000_000 },
  { symbol: 'MSFT',  startPrice: 165,  annualDrift: 0.32, annualVolatility: 0.28, avgDailyVolume: 25_000_000 },
  { symbol: 'GOOGL', startPrice: 1370, annualDrift: 0.22, annualVolatility: 0.30, avgDailyVolume: 1_200_000  },
  { symbol: 'TSLA',  startPrice: 90,   annualDrift: 0.40, annualVolatility: 0.65, avgDailyVolume: 50_000_000 },
];

const START_DATE = new Date('2020-01-02');
const END_DATE   = new Date('2024-12-31');

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Standard normal sample via Box-Muller transform */
function randn(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/** Returns all trading days (Mon–Fri) between start and end inclusive */
function getTradingDays(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push(new Date(cur));
    }
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

/**
 * Simulate OHLCV candles using GBM.
 * dt = 1/252 (one trading day as fraction of year)
 */
function generateCandles(
  days: Date[],
  startPrice: number,
  drift: number,
  volatility: number,
  avgVolume: number
): { timestamp: Date; open: number; high: number; low: number; close: number; volume: number }[] {
  const dt = 1 / 252;
  let price = startPrice;
  const candles = [];

  for (const day of days) {
    const open = price;

    // Simulate 4 intra-day ticks to get realistic H/L
    const ticks: number[] = [open];
    for (let i = 0; i < 3; i++) {
      const prev = ticks[ticks.length - 1];
      const change = prev * Math.exp((drift - 0.5 * volatility ** 2) * (dt / 4) + volatility * Math.sqrt(dt / 4) * randn());
      ticks.push(change);
    }

    // GBM step for daily close
    const close = open * Math.exp((drift - 0.5 * volatility ** 2) * dt + volatility * Math.sqrt(dt) * randn());

    const allPrices = [...ticks, close];
    const high = Math.max(...allPrices);
    const low  = Math.min(...allPrices);

    // Volume: lognormal around the average, with occasional spikes
    const volMultiplier = Math.exp(0.3 * randn());
    const volume = Math.round(avgVolume * volMultiplier * (0.7 + Math.random() * 0.6));

    candles.push({
      timestamp: day,
      open:   Math.round(open  * 100) / 100,
      high:   Math.round(high  * 100) / 100,
      low:    Math.round(low   * 100) / 100,
      close:  Math.round(close * 100) / 100,
      volume,
    });

    price = close;
  }

  return candles;
}

// ── Main seeder ───────────────────────────────────────────────────────────────

async function seedMarketData() {
  console.log('📊 Seeding market data...\n');

  const tradingDays = getTradingDays(START_DATE, END_DATE);
  console.log(`  Trading days to generate: ${tradingDays.length} (${START_DATE.toISOString().slice(0,10)} → ${END_DATE.toISOString().slice(0,10)})\n`);

  try {
    for (const assetConfig of ASSETS) {
      console.log(`  ⏳ Generating ${assetConfig.symbol}...`);

      // Look up asset UUID
      const assetRes = await query<{ id: string }>(`SELECT id FROM assets WHERE symbol = $1`, [assetConfig.symbol]);
      if (assetRes.rows.length === 0) {
        console.warn(`    ⚠️  Asset '${assetConfig.symbol}' not found — run db:seed first!`);
        continue;
      }
      const assetId = assetRes.rows[0].id;

      // Check if data already exists
      const countRes = await query<{ count: string }>(`SELECT COUNT(*) as count FROM market_data WHERE asset_id = $1`, [assetId]);
      const existingCount = parseInt(countRes.rows[0].count);
      if (existingCount > 0) {
        console.log(`    ⏭️  ${assetConfig.symbol} already has ${existingCount} candles — skipping.`);
        continue;
      }

      // Generate candles
      const candles = generateCandles(
        tradingDays,
        assetConfig.startPrice,
        assetConfig.annualDrift,
        assetConfig.annualVolatility,
        assetConfig.avgDailyVolume
      );

      // Bulk insert using a transaction with batching (500 rows per batch)
      const client = await getClient();
      try {
        await client.query('BEGIN');
        const batchSize = 500;
        for (let i = 0; i < candles.length; i += batchSize) {
          const batch = candles.slice(i, i + batchSize);
          const values: any[] = [];
          const placeholders = batch.map((c, idx) => {
            const base = idx * 7;
            values.push(assetId, c.timestamp.toISOString(), c.open, c.high, c.low, c.close, c.volume);
            return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`;
          });
          await client.query(
            `INSERT INTO market_data (asset_id, timestamp, open, high, low, close, volume)
             VALUES ${placeholders.join(', ')}
             ON CONFLICT (asset_id, timestamp) DO NOTHING`,
            values
          );
        }
        await client.query('COMMIT');
        console.log(`    ✅ ${assetConfig.symbol}: ${candles.length} candles inserted`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    console.log('\n✅ Market data seeding completed!');
  } catch (err) {
    console.error('❌ Market data seeding failed:', err);
    process.exit(1);
  } finally {
    await closePool();
  }
}

seedMarketData();
