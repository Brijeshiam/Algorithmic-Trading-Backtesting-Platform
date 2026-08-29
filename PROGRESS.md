# AlgoLab — Progress Tracker

> Reference this file to see what's been built so far and what's next.

---

## Phase 1: Foundation ✅ Done

| Component | Status | Notes |
|---|---|---|
| Root workspace (monorepo) | ✅ Done | npm workspaces: frontend, backend, quant-engine |
| Backend scaffolding | ✅ Done | Express + TypeScript + raw SQL |
| Database schema | ✅ Done | PostgreSQL DDL for all tables |
| Auth module | ✅ Done | Register, login, JWT refresh, logout |
| Users module | ✅ Done | Profile, admin list |
| Dashboard API | ✅ Done | Summary aggregation endpoint |
| Middleware | ✅ Done | Auth guard, validation, error handler, rate limit |
| Frontend scaffolding | ✅ Done | Vite + React + TypeScript |
| Design system (CSS) | ✅ Done | Light professional theme |
| UI components | ✅ Done | Layout, Sidebar, Cards, Forms, Tables |
| Auth pages | ✅ Done | Login, Register |
| Landing page | ✅ Done | Hero + features |
| Dashboard page | ✅ Done | Summary cards + recent activity |

**Deliverable:** Register → Login → Dashboard

---

## Phase 2: Strategy Management ✅ Done

| Component | Status | Notes |
|---|---|---|
| Strategy CRUD API | ✅ Done | Create, read, update, delete |
| Strategy versioning | ✅ Done | Immutable version history |
| Strategy JSON validation | ✅ Done | Zod schema for strategy definitions |
| Strategy Builder UI | ✅ Done | No-code visual rule builder |
| Strategy list & detail pages | ✅ Done | Browse, view, edit strategies |

**Deliverable:** Create & save a strategy with versioning

---

## Phase 3: Market Data ✅ Done

| Component | Status | Notes |
|---|---|---|
| Asset management API | ✅ Done | `GET /api/assets`, `GET /api/assets/:symbol` |
| OHLCV ingestion pipeline | ✅ Done | GBM price simulator + bulk insert |
| Sample data seeding | ✅ Done | AAPL, SPY, MSFT, GOOGL, TSLA 2020–2024 |
| Market data page | ✅ Done | Asset browser + candlestick + volume chart |

**Deliverable:** Select asset & date range, view price chart

---

## Phase 4: Backtest Engine 🔲 Not Started

| Component | Status | Notes |
|---|---|---|
| Technical indicators | 🔲 | SMA, EMA, RSI, MACD, Bollinger |
| Strategy evaluator | 🔲 | JSON → signals |
| Backtest loop | 🔲 | Per-candle with look-ahead bias prevention |
| Order manager | 🔲 | Commission, slippage, fills |
| Portfolio simulation | 🔲 | Cash, positions, equity tracking |
| Backtest API | 🔲 | Create, list, detail endpoints |
| Backtest UI | 🔲 | Setup form + results page |

**Deliverable:** Strategy + data → backtest results with trades

---

## Phase 5: Analytics 🔲 In Progress

| Component | Status | Notes |
|---|---|---|
| Performance metrics | ✅ Done | Sharpe, CAGR, Sortino, drawdown, etc. |
| Equity curve chart | ✅ Done | Portfolio value over time |
| Drawdown chart | 🔲 | Peak-to-trough visualization |
| Monthly returns heatmap | 🔲 | Color-coded grid |
| Trade explorer | ✅ Done | Filterable trade table |
| Strategy comparison | ✅ Done | Side-by-side metrics |

**Deliverable:** Professional backtest report with charts

---

## Phase 9: Monte Carlo Analysis ✅ Done

| Component | Status | Notes |
|---|---|---|
| Trade resampling engine | ✅ Done | 1000x random sampling |
| Statistical aggregations | ✅ Done | P5, Median, P95, Probability of profit |
| Results UI | ✅ Done | Metrics grid + Histogram chart |
| Simulation Jobs API | ✅ Done | Synchronous generation & DB storage |

**Deliverable:** Resample historical trades to generate return distribution.

---

## Phase 11: Paper Trading ✅ Done

| Component | Status | Notes |
|---|---|---|
| Paper Account Model | ✅ Done | Initial capital, cash tracking |
| Paper Orders API | ✅ Done | Mock market orders |
| Positions Calculator | ✅ Done | Aggregate filled orders |
| Paper Trading UI | ✅ Done | Dashboard, positions, manual trade form |

**Deliverable:** Initialize a virtual account and place manual simulated trades.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + TypeScript, Vite, Zustand, TanStack Query, ApexCharts |
| Backend | Node.js + Express + TypeScript, raw SQL (pg), Zod, JWT/bcrypt |
| Quant Engine | Pure TypeScript library (zero deps) |
| Database | PostgreSQL 16 |
| Theme | Light professional |
