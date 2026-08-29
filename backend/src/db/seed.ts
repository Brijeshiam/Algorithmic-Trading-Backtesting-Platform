import bcrypt from 'bcryptjs';
import { query, closePool } from '../config/database.js';

async function seed() {
  console.log('🌱 Seeding database...\n');
  
  try {
    // ── Seed admin user ──────────────────────────────
    const adminPassword = await bcrypt.hash('admin123', 12);
    await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      ['Admin', 'admin@algolab.dev', adminPassword, 'ADMIN']
    );
    console.log('  ✅ Admin user seeded (admin@algolab.dev / admin123)');

    // ── Seed demo user ───────────────────────────────
    const demoPassword = await bcrypt.hash('demo1234', 12);
    await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      ['Demo User', 'demo@algolab.dev', demoPassword, 'USER']
    );
    console.log('  ✅ Demo user seeded (demo@algolab.dev / demo1234)');

    // ── Seed assets ──────────────────────────────────
    const assets = [
      { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'STOCK' },
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', exchange: 'NYSE', type: 'ETF' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', type: 'STOCK' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', type: 'STOCK' },
      { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', type: 'STOCK' },
    ];

    for (const asset of assets) {
      await query(
        `INSERT INTO assets (symbol, name, exchange, asset_type)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (symbol) DO NOTHING`,
        [asset.symbol, asset.name, asset.exchange, asset.type]
      );
    }
    console.log(`  ✅ ${assets.length} assets seeded`);

    console.log('\n✅ Database seeding completed!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    await closePool();
  }
}

seed();
