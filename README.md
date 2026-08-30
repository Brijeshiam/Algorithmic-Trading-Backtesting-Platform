# AlgoLab — Algorithmic Trading & Quantitative Backtesting Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646cff.svg)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg)](https://www.postgresql.org/)

**AlgoLab** is a full-stack algorithmic trading research, backtesting, and simulation platform designed for quantitative traders. It features a visual strategy builder, candle-level backtesting engine, Monte Carlo stress testing, virtual paper trading, and side-by-side strategy comparisons — wrapped in a clean, modern light-theme user experience.

---

## ✨ Key Features

### 🧩 Visual Strategy Builder
- **No-Code Rule Construction**: Build multi-condition entry and exit rules using indicators (`SMA`, `EMA`, `RSI`, `MACD`, `Bollinger Bands`, `Price`, `Volume`).
- **Flexible Operators**: Crosses Above (`CROSSES_ABOVE`), Crosses Below (`CROSSES_BELOW`), inequalities (`>`, `<`, `>=`, `<=`, `==`).
- **Multi-Level Logic**: Segmented `ALL (AND)` and `ANY (OR)` logic with support for nested condition groups.
- **Position Sizing Models**: Configure capital allocation by Percentage of Portfolio (`%`) or Fixed Dollar Amount (`$`).
- **Live Spec Preview**: Real-time JSON schema inspection with one-click clipboard copying.

### ⚡ Backtesting Engine
- **Look-Ahead Bias Prevention**: Orders triggered on candle close are filled on the subsequent candle open.
- **Transaction Cost Realism**: Configurable broker commission rates and execution slippage penalties.
- **Quantitative Metrics Calculation**:
  - Total Return (%) & Compound Annual Growth Rate (CAGR %)
  - Annualized Volatility & Sharpe Ratio (Risk-Adjusted Return)
  - Sortino Ratio (Downside Deviation Adjusted)
  - Maximum Drawdown (%) & Peak-to-Trough duration
  - Win Rate (%), Profit Factor, Average Win/Loss, and Market Exposure (%)
- **Interactive Visualizations**: Interactive Equity Curve (ApexCharts) with dark visual gridlines, zoom/pan tools, and trade execution logs.

### 🎲 Monte Carlo Analysis & Stress Testing
- **Trade Resampling**: Simulates 100 to 10,000 alternate reality equity paths by randomly sampling historical trade distributions with replacement.
- **Probability of Profit**: Estimates statistical likelihood of strategy profitability.
- **Percentile Distributions**: Comprehensive breakdown of P5 (worst case), P25, Median, P75, and P95 (best case) returns.
- **Histogram Visualization**: Frequency distribution chart across final portfolio returns.

### ⚖️ Side-by-Side Strategy Comparison
- **Multi-Strategy Overlay**: Compare up to 4 backtested strategies simultaneously on a unified timeline.
- **Color-Coded Series**: Distinct visual color palette with highlighted performance matrix winners (`✦ Best Value`).

### 🏦 Virtual Paper Trading
- **Simulated Execution**: Practice execution with a $100,000 virtual capital balance.
- **Live Portfolio Management**: Real-time position tracking, cash reserves, average entry price, and unrealized return.
- **Order Blotter**: Complete audit log of executed simulated buy/sell orders.

### 🏆 Strategy Leaderboard
- **Podium Ranking**: Visual ranking of the top 4 strategies with gold, silver, and bronze podium cards.
- **Risk-Adjusted Standings**: Ranked by Sharpe Ratio, Drawdown, and Win Rate.

---

## 🏛 Architecture & Tech Stack

The repository is structured as an **npm workspaces monorepo**:

```
algorithmic-trading-backtesting-platform/
├── frontend/          # React 18 + Vite SPA (TypeScript, TanStack Query, Zustand, ApexCharts)
├── backend/           # Node.js + Express REST API (TypeScript, pg, Zod, JWT/Bcrypt)
├── quant-engine/      # Zero-dependency, high-throughput TypeScript mathematical core
├── docker-compose.yml # PostgreSQL 15 container definition
└── package.json       # Monorepo root workspace scripts
```

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, TanStack React Query, Zustand, React ApexCharts, Custom Light Theme CSS |
| **Backend** | Node.js, Express, TypeScript, PostgreSQL (`pg`), Zod validation, JWT, Bcrypt |
| **Quant Engine** | Pure TypeScript mathematical indicator library & stateful portfolio simulation loop |
| **Database** | PostgreSQL 15+ (Relational schema with JSONB definitions) |

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **Docker** (or a local PostgreSQL instance running on port `5432`)

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/Brijeshiam/Algorithmic-Trading-Backtesting-Platform.git
cd Algorithmic-Trading-Backtesting-Platform
npm install
```

### 3. Start PostgreSQL Database
Using Docker Compose:
```bash
docker compose up -d
```

### 4. Configure Environment Variables
Copy the `.env.example` in `backend/` and root:
```bash
cp .env.example backend/.env
```

### 5. Run Database Migrations & Seeds
```bash
# Run PostgreSQL schema migrations
npm run db:migrate

# Seed sample users and assets (AAPL, SPY, MSFT, GOOGL, TSLA)
npm run db:seed
```

### 6. Start Development Servers
Run both backend and frontend concurrently from the root directory:
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **API Health Check**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## 🔑 Default Login Credentials

| Role | Email | Password |
|---|---|---|
| **Standard User** | `demo@algolab.dev` | `demo1234` |
| **Administrator** | `admin@algolab.dev` | `admin123` |

*(You can also register a new account directly via the `/register` page).*

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT |
| `GET` | `/api/dashboard/summary` | Fetch live user dashboard metrics |
| `GET` | `/api/strategies` | List user trading strategies |
| `POST` | `/api/strategies` | Create a new visual strategy |
| `GET` | `/api/strategies/leaderboard` | Get ranked strategy leaderboard |
| `GET` | `/api/assets` | Get market data asset catalog |
| `POST` | `/api/backtests` | Execute a historical backtest |
| `GET` | `/api/backtests/:id` | Get backtest performance report & trades |
| `POST` | `/api/simulations/monte-carlo` | Run Monte Carlo resampling simulation |
| `GET` | `/api/paper/account` | Retrieve virtual paper trading portfolio |
| `POST` | `/api/paper/orders` | Place simulated paper market order |

---

## 🧪 Testing & Building

```bash
# Build all workspaces (frontend, backend, quant-engine)
npm run build

# Run unit and integration tests
npm run test
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
