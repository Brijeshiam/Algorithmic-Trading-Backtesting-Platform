import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { backtestsService } from '../services/backtests.service';

export function BacktestListPage() {
  const { data: backtests = [], isLoading } = useQuery({
    queryKey: ['backtests'],
    queryFn: backtestsService.listBacktests,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Backtests</h1>
          <p className="page-subtitle">View and analyze your historical strategy performance.</p>
        </div>
        <Link to="/backtests/new">
          <Button>Run New Backtest</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <LoadingSpinner />
        </div>
      ) : backtests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3 className="empty-state-title">No backtests found</h3>
          <p className="empty-state-description">Run a backtest to see your strategy's performance and analyze the results.</p>
          <div>
            <Link to="/backtests/new">
              <Button>Run Backtest</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Strategy</th>
                  <th>Asset</th>
                  <th style={{ textAlign: 'right' }}>Capital</th>
                  <th style={{ textAlign: 'right' }}>Return</th>
                  <th style={{ textAlign: 'right' }}>Max DD</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {backtests.map((bt) => (
                  <tr key={bt.id}>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
                      {new Date(bt.created_at).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-900)' }}>{bt.strategy_name}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--color-primary-600)' }}>{bt.symbol}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--color-gray-700)' }}>
                      ${Number(bt.initial_capital).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'var(--font-weight-semibold)' }}>
                      {bt.total_return ? (
                        <span style={{ color: Number(bt.total_return) >= 0 ? 'var(--color-success-600)' : 'var(--color-danger-600)' }}>
                          {Number(bt.total_return) >= 0 ? '+' : ''}{Number(bt.total_return).toFixed(2)}%
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--color-gray-700)' }}>
                      {bt.max_drawdown ? `${Number(bt.max_drawdown).toFixed(2)}%` : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`badge badge-${
                        bt.status === 'COMPLETED' ? 'success' :
                        bt.status === 'RUNNING' ? 'info' :
                        bt.status === 'FAILED' ? 'danger' :
                        'neutral'
                      }`}>
                        {bt.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/backtests/${bt.id}`} style={{ color: 'var(--color-primary-600)', fontWeight: 'var(--font-weight-semibold)', textDecoration: 'none', fontSize: 'var(--font-size-sm)' }}>
                        View Report →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
