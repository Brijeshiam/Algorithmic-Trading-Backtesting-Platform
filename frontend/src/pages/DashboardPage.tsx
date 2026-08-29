import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, DashboardSummary } from '../services/dashboard.service';

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (err: any) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3 className="empty-state-title">Something went wrong</h3>
        <p className="empty-state-description">{error}</p>
        <button className="btn btn-primary" onClick={loadDashboard}>Retry</button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your strategies and backtests</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-4 gap-6 mb-6">
        <div className="metric-card">
          <div className="metric-card-icon blue">🧩</div>
          <span className="metric-card-label">Total Strategies</span>
          <span className="metric-card-value">{summary?.totalStrategies || 0}</span>
          <span className="metric-card-sub">
            <Link to="/strategies/new" style={{ fontSize: 'inherit' }}>+ Create new</Link>
          </span>
        </div>

        <div className="metric-card">
          <div className="metric-card-icon green">⚡</div>
          <span className="metric-card-label">Total Backtests</span>
          <span className="metric-card-value">{summary?.totalBacktests || 0}</span>
          <span className="metric-card-sub">
            <Link to="/backtests" style={{ fontSize: 'inherit' }}>View all</Link>
          </span>
        </div>

        <div className="metric-card">
          <div className="metric-card-icon yellow">📈</div>
          <span className="metric-card-label">Best Sharpe Ratio</span>
          <span className="metric-card-value">
            {summary?.bestSharpe ? summary.bestSharpe.value.toFixed(2) : '—'}
          </span>
          <span className="metric-card-sub">
            {summary?.bestSharpe ? summary.bestSharpe.strategyName : 'No data yet'}
          </span>
        </div>

        <div className="metric-card">
          <div className="metric-card-icon red">📉</div>
          <span className="metric-card-label">Max Drawdown</span>
          <span className="metric-card-value">
            {summary?.worstDrawdown
              ? `${(summary.worstDrawdown.value).toFixed(1)}%`
              : '—'}
          </span>
          <span className="metric-card-sub">
            {summary?.worstDrawdown ? summary.worstDrawdown.strategyName : 'No data yet'}
          </span>
        </div>
      </div>

      {/* Quick Actions + Recent Backtests */}
      <div className="grid grid-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/strategies/new" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
              🧩 Create New Strategy
            </Link>
            <Link to="/backtests" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              ⚡ Run a Backtest
            </Link>
            <Link to="/market" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              📈 Browse Market Data
            </Link>
            <Link to="/compare" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              ⚖️ Compare Strategies
            </Link>
          </div>
        </div>

        {/* Recent Backtests */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Backtests</h3>
            {(summary?.recentBacktests?.length || 0) > 0 && (
              <Link to="/backtests" className="btn btn-ghost btn-sm">View All</Link>
            )}
          </div>
          
          {!summary?.recentBacktests?.length ? (
            <div className="empty-state" style={{ padding: 'var(--space-8) 0' }}>
              <div className="empty-state-icon">⚡</div>
              <h3 className="empty-state-title" style={{ fontSize: 'var(--font-size-base)' }}>No backtests yet</h3>
              <p className="empty-state-description" style={{ fontSize: 'var(--font-size-sm)' }}>
                Create a strategy and run your first backtest to see results here.
              </p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Strategy</th>
                  <th>Symbol</th>
                  <th>Return</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentBacktests.map((bt) => (
                  <tr key={bt.id}>
                    <td className="font-medium">{bt.strategyName}</td>
                    <td>
                      <span className="badge badge-neutral">{bt.symbol}</span>
                    </td>
                    <td>
                      {bt.totalReturn !== null ? (
                        <span className={bt.totalReturn >= 0 ? 'text-success' : 'text-danger'}>
                          {bt.totalReturn >= 0 ? '+' : ''}{(bt.totalReturn * 100).toFixed(2)}%
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`badge badge-${bt.status === 'COMPLETED' ? 'success' : bt.status === 'FAILED' ? 'danger' : 'warning'}`}>
                        {bt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Average Return Card */}
      {summary?.avgReturn !== null && summary?.avgReturn !== undefined && (
        <div className="card mt-6">
          <div className="card-header">
            <h3 className="card-title">Average Strategy Performance</h3>
          </div>
          <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }} className={summary.avgReturn >= 0 ? 'text-success' : 'text-danger'}>
            {summary.avgReturn >= 0 ? '+' : ''}{(summary.avgReturn * 100).toFixed(2)}%
          </p>
          <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>Average total return across all completed backtests</p>
        </div>
      )}
    </div>
  );
}
