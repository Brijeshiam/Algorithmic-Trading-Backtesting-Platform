# Project Explanation: AlgoLab Algorithmic Trading Platform

---

## 1. What is this Project?

**AlgoLab** is a complete, web-based **algorithmic trading and backtesting platform**.

In simple terms, it allows users to:
1. **Create trading strategies visually** without writing code (e.g., "Buy when the 14-day average price crosses above the 50-day average price").
2. **Test those strategies on historical stock market data** to see if they would have made or lost money in the past (Backtesting).
3. **Simulate real-world trading costs** such as broker commissions and slippage (price delays).
4. **Stress-test strategies using Monte Carlo simulations** (running 1,000 to 10,000 random market variations to see the probability of profit).
5. **Practice live trading in a simulated environment** (Paper Trading with $100,000 virtual cash).
6. **Compare multiple strategies side-by-side** and view a **global leaderboard** of the best strategies.

---

## 2. Why was this Project Built? (The Problem It Solves)

Most retail traders lose money because they trade on emotions rather than data. 

To trade systematically with algorithms:
- **Existing tools are too complicated**: They require writing complex Python code (Backtrader, Zipline).
- **Simple tools are unrealistic**: They ignore real-world fees and fill prices at the closing price rather than the opening price of the next candle (Look-ahead bias).
- **Past performance does not guarantee future results**: Strategies can be "lucky" on past data. Without stress testing (Monte Carlo), traders cannot know the true risk.

**AlgoLab solves all these problems** by offering a visual builder, institutional-grade calculation engine, and statistical stress testing in one platform.

---

## 3. How Does the System Work? (Step-by-Step Flow)

```
[ User in Browser ] 
        │
        ▼
1. Visual Strategy Builder ──► Creates rules (e.g. SMA 14 crosses above SMA 50)
        │
        ▼
2. Strategy Stored in Database ──► Saved as JSON in PostgreSQL with version control
        │
        ▼
3. Run Backtest ──► User picks Asset (e.g. AAPL) and Date Range (2020 - 2024)
        │
        ▼
4. Quantitative Engine ──► Reads candle data, computes technical indicators,
                           evaluates rules bar-by-bar, simulates buy/sell orders
        │
        ▼
5. Analytics & Charts ──► Displays Equity Curve, Sharpe Ratio, Max Drawdown, Win Rate
        │
        ▼
6. Monte Carlo Stress Test ──► Resamples trades 1,000x to calculate true Probability of Profit
        │
        ▼
7. Virtual Paper Trading ──► User tests strategy live with $100,000 virtual capital
```

---

## 4. Key Modules & Features Explained

### 🧩 A. Visual Strategy Builder
- Users build logic using dropdowns and inputs rather than writing code.
- Supports indicators: **SMA**, **EMA**, **RSI**, **MACD**, **Bollinger Bands**, **Price**, and **Volume**.
- Supports operators: **Crosses Above**, **Crosses Below**, `>`, `<`, `>=`, `<=`, `==`.
- Supports **Nested AND / OR Groups** for complex multi-indicator logic.
- Configures **Position Sizing** (% of portfolio or fixed dollar amount).
- Generates and previews the underlying JSON rule specification live.

### ⚡ B. Quantitative Backtesting Engine
- **Look-Ahead Bias Prevention**: A signal generated at candle close is only executed at the next candle's open price.
- **Cost Realism**: Subtracts commission fees and slippage from every trade.
- **Automatic Metrics Calculation**:
  - **Total Return (%) & CAGR (%)**: How much the money grew annually.
  - **Sharpe Ratio**: How much return was earned per unit of risk.
  - **Sortino Ratio**: Risk-adjusted return considering only downside risk.
  - **Maximum Drawdown (%)**: The biggest drop from peak to trough.
  - **Win Rate (%) & Profit Factor**: Ratio of winning trades to losing trades.
  - **Trade Log**: Full list of every buy/sell order with exact entry/exit prices and profit.

### 🎲 C. Monte Carlo Stress Testing
- Takes all closed trades from a backtest and randomly shuffles/resamples them thousands of times.
- Calculates:
  - **Probability of Profit**: % of times the strategy ended positive.
  - **Worst Case (P5)**: What happens in the worst 5% of market conditions.
  - **Median Return**: The expected middle-ground outcome.
  - **Best Case (P95)**: The top 5% outcome.
- Renders a **Return Distribution Histogram** chart.

### ⚖️ D. Strategy Comparison
- Lets users select up to **4 strategies** at once.
- Overlays their equity curves on a single chart with distinct colors.
- Generates a side-by-side performance matrix highlighting the winner for each metric (`✦ Best Value`).

### 🏦 E. Virtual Paper Trading
- Provides a simulated **$100,000 virtual account**.
- Allows users to place manual simulated Buy/Sell market orders.
- Automatically tracks live open positions, average entry prices, available cash, and total return.

### 🏆 F. Strategy Leaderboard
- A visual podium (1st Gold, 2nd Silver, 3rd Bronze, 4th Blue) ranking the top-performing strategies on the platform based on Sharpe Ratio and risk metrics.

---

## 5. Technical Architecture (How the Code is Organized)

The project is a **Monorepo** consisting of 3 main parts:

### 1. `frontend/` (User Interface)
- **Framework**: React 18 with TypeScript and Vite.
- **Data Management**: `@tanstack/react-query` (handles live API caching and auto-refreshing) and `Zustand` (authentication state).
- **Charts**: `React-ApexCharts` for candlestick and equity charts.
- **Styling**: Custom modern light-theme CSS with clean cards, smooth transitions, and responsive layout.

### 2. `backend/` (API Server)
- **Framework**: Node.js with Express and TypeScript.
- **Database**: PostgreSQL (relational tables for users, strategies, backtests, trades, and paper accounts).
- **Security**: JWT authentication, bcrypt password hashing, and Zod schema validation.
- **Performance**: PostgreSQL Common Table Expressions (CTEs) and Window Functions for fast dashboard & leaderboard queries.

### 3. `quant-engine/` (Mathematical Core)
- **Design**: Pure, zero-dependency TypeScript calculation engine.
- **Responsibilities**: Computes technical indicators, executes the bar-by-bar backtest simulation loop, and calculates quantitative risk formulas.

---

## 6. How to Explain This Project in 1 Minute (Elevator Pitch)

> *"AlgoLab is a full-stack algorithmic trading platform where users can visually build trading strategies with technical indicators like moving averages and RSI without writing code. The platform backtests these strategies against historical market data with realistic execution fees, performs Monte Carlo stress testing across thousands of simulations to calculate the true probability of profit, and provides virtual paper trading with $100,000 in simulated capital. It is built with React 18, Node.js, Express, a custom TypeScript quant engine, and PostgreSQL."*

---

## 7. How to Run the Platform

```bash
# 1. Start the PostgreSQL Database
docker compose up -d

# 2. Run Database Migrations & Seed Sample Market Data
npm run db:migrate
npm run db:seed

# 3. Start Frontend & Backend Development Servers
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`
- **Demo Login**: `demo@algolab.dev` / `demo1234`
