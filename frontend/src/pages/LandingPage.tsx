import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const features = [
  {
    icon: '🧩',
    iconBg: 'background: var(--color-primary-50); color: var(--color-primary-600);',
    title: 'Strategy Builder',
    description: 'Build rule-based strategies with technical indicators like SMA, EMA, RSI, MACD, and Bollinger Bands — no code required.',
  },
  {
    icon: '⚡',
    iconBg: 'background: var(--color-warning-50); color: var(--color-warning-600);',
    title: 'Backtesting Engine',
    description: 'Test strategies against historical data with realistic transaction costs, slippage, and look-ahead bias prevention.',
  },
  {
    icon: '📊',
    iconBg: 'background: var(--color-success-50); color: var(--color-success-600);',
    title: 'Performance Analytics',
    description: 'Sharpe ratio, CAGR, max drawdown, win rate, equity curves, and trade-level breakdowns — all calculated automatically.',
  },
  {
    icon: '🎲',
    iconBg: 'background: var(--color-danger-50); color: var(--color-danger-600);',
    title: 'Monte Carlo Simulation',
    description: 'Run thousands of simulations to understand the probability distribution of your strategy\'s outcomes.',
  },
  {
    icon: '🔍',
    iconBg: 'background: var(--color-info-50); color: var(--color-primary-600);',
    title: 'Walk-Forward Validation',
    description: 'Rolling train/test analysis to detect overfitting before you commit capital.',
  },
  {
    icon: '📝',
    iconBg: 'background: #faf5ff; color: #7c3aed;',
    title: 'Paper Trading',
    description: 'Run your strategies against live data with virtual capital — same engine, zero risk.',
  },
];

export function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div>
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="flex items-center gap-3">
          <div className="sidebar-brand-logo">A</div>
          <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-gray-900)' }}>AlgoLab</span>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div>
          <h1 className="landing-hero-title">
            Build, Test & Validate<br />
            <span>Trading Strategies</span>
          </h1>
          <p className="landing-hero-subtitle">
            A professional research platform for building rule-based trading strategies,
            backtesting on historical data, and analyzing risk — all without writing code.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Building →
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>
          <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)' }}>
            Educational simulation tool — not financial advice.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-3)' }}>
            Everything you need for strategy research
          </h2>
          <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-gray-500)', maxWidth: '600px', margin: '0 auto' }}>
            From idea to validated strategy — build, backtest, analyze, and validate with confidence.
          </p>
        </div>
        <div className="landing-features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-card-icon" style={{ ...parseStyle(f.iconBg) }}>
                {f.icon}
              </div>
              <h3 className="feature-card-title">{f.title}</h3>
              <p className="feature-card-description">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-8)', borderTop: '1px solid var(--color-gray-200)', color: 'var(--color-gray-400)', fontSize: 'var(--font-size-sm)' }}>
        <p>AlgoLab — Algorithmic Trading Research Platform</p>
        <p style={{ marginTop: 'var(--space-1)' }}>Educational simulation tool. Not financial advice.</p>
      </footer>
    </div>
  );
}

// Helper to parse inline style string to object
function parseStyle(styleStr: string): React.CSSProperties {
  const style: Record<string, string> = {};
  styleStr.split(';').forEach((rule) => {
    const [key, value] = rule.split(':').map((s) => s.trim());
    if (key && value) {
      const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      style[camelKey] = value;
    }
  });
  return style as React.CSSProperties;
}
