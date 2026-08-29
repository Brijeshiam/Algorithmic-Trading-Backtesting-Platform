-- =====================================================
-- AlgoLab Database Schema
-- All tables for the platform
-- =====================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ─── Refresh Tokens ─────────────────────────────────

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- ─── Strategies ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS strategies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  status      VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_strategies_user ON strategies(user_id);

-- ─── Strategy Versions ──────────────────────────────

CREATE TABLE IF NOT EXISTS strategy_versions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id     UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  version         INTEGER NOT NULL,
  definition_json JSONB NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(strategy_id, version)
);

CREATE INDEX idx_strategy_versions_strategy ON strategy_versions(strategy_id);

-- ─── Assets ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS assets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol      VARCHAR(20) UNIQUE NOT NULL,
  name        VARCHAR(200) NOT NULL,
  exchange    VARCHAR(50),
  asset_type  VARCHAR(30) NOT NULL DEFAULT 'STOCK' CHECK (asset_type IN ('STOCK', 'ETF', 'CRYPTO', 'FOREX', 'INDEX')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_symbol ON assets(symbol);

-- ─── Market Data (OHLCV) ────────────────────────────

CREATE TABLE IF NOT EXISTS market_data (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id  UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  open      NUMERIC(18, 6) NOT NULL,
  high      NUMERIC(18, 6) NOT NULL,
  low       NUMERIC(18, 6) NOT NULL,
  close     NUMERIC(18, 6) NOT NULL,
  volume    BIGINT NOT NULL DEFAULT 0,
  UNIQUE(asset_id, timestamp)
);

CREATE INDEX idx_market_data_asset_time ON market_data(asset_id, timestamp);

-- ─── Backtests ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS backtests (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strategy_id           UUID NOT NULL REFERENCES strategies(id),
  strategy_version_id   UUID NOT NULL REFERENCES strategy_versions(id),
  asset_id              UUID NOT NULL REFERENCES assets(id),
  date_range_start      TIMESTAMPTZ NOT NULL,
  date_range_end        TIMESTAMPTZ NOT NULL,
  initial_capital       NUMERIC(18, 2) NOT NULL,
  commission_rate       NUMERIC(10, 6) NOT NULL DEFAULT 0.001,
  slippage_rate         NUMERIC(10, 6) NOT NULL DEFAULT 0.0005,
  status                VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  error_message         TEXT,
  started_at            TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_backtests_user ON backtests(user_id);
CREATE INDEX idx_backtests_strategy ON backtests(strategy_id);

-- ─── Backtest Metrics ───────────────────────────────

CREATE TABLE IF NOT EXISTS backtest_metrics (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backtest_id     UUID UNIQUE NOT NULL REFERENCES backtests(id) ON DELETE CASCADE,
  total_return    NUMERIC(18, 6),
  cagr            NUMERIC(18, 6),
  volatility      NUMERIC(18, 6),
  sharpe_ratio    NUMERIC(18, 6),
  sortino_ratio   NUMERIC(18, 6),
  max_drawdown    NUMERIC(18, 6),
  win_rate        NUMERIC(10, 6),
  profit_factor   NUMERIC(18, 6),
  trade_count     INTEGER DEFAULT 0,
  avg_win         NUMERIC(18, 6),
  avg_loss        NUMERIC(18, 6),
  largest_win     NUMERIC(18, 6),
  largest_loss    NUMERIC(18, 6),
  exposure        NUMERIC(10, 6),
  avg_holding_days NUMERIC(10, 2),
  gross_profit    NUMERIC(18, 2),
  gross_loss      NUMERIC(18, 2),
  total_costs     NUMERIC(18, 2),
  final_equity    NUMERIC(18, 2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Trades ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS trades (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backtest_id   UUID NOT NULL REFERENCES backtests(id) ON DELETE CASCADE,
  symbol        VARCHAR(20) NOT NULL,
  side          VARCHAR(10) NOT NULL CHECK (side IN ('BUY', 'SELL')),
  quantity      NUMERIC(18, 6) NOT NULL,
  entry_price   NUMERIC(18, 6) NOT NULL,
  entry_time    TIMESTAMPTZ NOT NULL,
  exit_price    NUMERIC(18, 6),
  exit_time     TIMESTAMPTZ,
  gross_pnl     NUMERIC(18, 2),
  costs         NUMERIC(18, 2) DEFAULT 0,
  net_pnl       NUMERIC(18, 2),
  status        VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trades_backtest ON trades(backtest_id);

-- ─── Equity Snapshots (for equity curve) ────────────

CREATE TABLE IF NOT EXISTS equity_snapshots (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backtest_id UUID NOT NULL REFERENCES backtests(id) ON DELETE CASCADE,
  timestamp   TIMESTAMPTZ NOT NULL,
  equity      NUMERIC(18, 2) NOT NULL,
  cash        NUMERIC(18, 2) NOT NULL,
  positions_value NUMERIC(18, 2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_equity_snapshots_backtest ON equity_snapshots(backtest_id, timestamp);

-- ─── Simulation Jobs (Phase 9–10) ───────────────────

CREATE TABLE IF NOT EXISTS simulation_jobs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          VARCHAR(30) NOT NULL CHECK (type IN ('MONTE_CARLO', 'WALK_FORWARD')),
  backtest_id   UUID REFERENCES backtests(id),
  status        VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
  progress      INTEGER DEFAULT 0,
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);

-- ─── Monte Carlo Results (Phase 9) ─────────────────

CREATE TABLE IF NOT EXISTS monte_carlo_results (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backtest_id           UUID NOT NULL REFERENCES backtests(id) ON DELETE CASCADE,
  simulation_count      INTEGER NOT NULL,
  median_return         NUMERIC(18, 6),
  p5_return             NUMERIC(18, 6),
  p25_return            NUMERIC(18, 6),
  p75_return            NUMERIC(18, 6),
  p95_return            NUMERIC(18, 6),
  probability_of_profit NUMERIC(10, 6),
  results_json          JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Paper Accounts (Phase 11) ─────────────────────

CREATE TABLE IF NOT EXISTS paper_accounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(100),
  initial_capital NUMERIC(18, 2) NOT NULL DEFAULT 100000,
  cash            NUMERIC(18, 2) NOT NULL DEFAULT 100000,
  status          VARCHAR(20) NOT NULL DEFAULT 'INACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Paper Orders (Phase 11) ────────────────────────

CREATE TABLE IF NOT EXISTS paper_orders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id    UUID NOT NULL REFERENCES paper_accounts(id) ON DELETE CASCADE,
  strategy_id   UUID REFERENCES strategies(id),
  symbol        VARCHAR(20) NOT NULL,
  side          VARCHAR(10) NOT NULL CHECK (side IN ('BUY', 'SELL')),
  quantity      NUMERIC(18, 6) NOT NULL,
  price         NUMERIC(18, 6),
  order_type    VARCHAR(20) NOT NULL DEFAULT 'MARKET' CHECK (order_type IN ('MARKET', 'LIMIT', 'STOP_LOSS', 'TAKE_PROFIT')),
  status        VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FILLED', 'CANCELLED', 'REJECTED')),
  filled_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Audit Logs ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  action        VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id   UUID,
  metadata      JSONB,
  ip_address    VARCHAR(50),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
