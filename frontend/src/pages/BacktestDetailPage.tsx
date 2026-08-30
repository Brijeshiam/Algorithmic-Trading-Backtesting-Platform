import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { backtestsService } from '../services/backtests.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EquityChart } from '../components/backtest/EquityChart';
import { MetricsGrid } from '../components/backtest/MetricsGrid';
import { TradeLog } from '../components/backtest/TradeLog';

export function BacktestDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['backtest', id],
    queryFn: () => backtestsService.getBacktest(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <span>Loading backtest report...</span>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="empty-state" style={{ maxWidth: '600px', margin: 'var(--space-12) auto' }}>
        <div className="empty-state-icon">⚠️</div>
        <h3 className="empty-state-title">Report Not Found</h3>
        <p className="empty-state-description">
          The requested backtest report could not be loaded. It may have been deleted or the ID is invalid.
        </p>
        <Link to="/backtests" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
          ← Back to Backtest History
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      
      {/* ── Top Navigation & Actions Bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
      }}>
        <div>
          {/* Breadcrumb & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <Link to="/backtests" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-gray-500)',
              textDecoration: 'none',
              fontWeight: 'var(--font-weight-semibold)',
            }}>
              ← Back to History
            </Link>
            <span style={{ color: 'var(--color-gray-300)' }}>•</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-bold)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: report.status === 'COMPLETED' ? 'var(--color-success-50)' : report.status === 'FAILED' ? 'var(--color-danger-50)' : 'var(--color-primary-50)',
              color: report.status === 'COMPLETED' ? 'var(--color-success-700)' : report.status === 'FAILED' ? 'var(--color-danger-700)' : 'var(--color-primary-700)',
              border: `1px solid ${report.status === 'COMPLETED' ? 'var(--color-success-200)' : report.status === 'FAILED' ? 'var(--color-danger-200)' : 'var(--color-primary-200)'}`,
            }}>
              {report.status === 'COMPLETED' ? '✓ Completed' : report.status === 'FAILED' ? '❌ Failed' : '⏳ Running'}
            </span>
          </div>

          {/* Title */}
          <h1 className="page-title" style={{ marginBottom: 'var(--space-2)' }}>
            {report.strategy_name}
          </h1>

          {/* Subtitle Tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
            <span style={{
              fontFamily: 'monospace',
              fontWeight: 'var(--font-weight-bold)',
              background: 'var(--color-primary-50)',
              color: 'var(--color-primary-700)',
              border: '1px solid var(--color-primary-100)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-md)',
            }}>
              {report.symbol}
            </span>
            <span>
              📅 {new Date(report.date_range_start).toLocaleDateString()} &rarr; {new Date(report.date_range_end).toLocaleDateString()}
            </span>
            <span>•</span>
            <span>Executed {new Date(report.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Link to="/simulations/monte-carlo" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            🎲 Monte Carlo
          </Link>
          <Link to="/compare" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            ⚖️ Compare
          </Link>
          <Link to={`/strategies/${report.strategy_id}`} className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            🧩 Strategy Spec
          </Link>
          <Link to="/backtests/new" state={{ strategyId: report.strategy_id }} className="btn btn-primary" style={{ textDecoration: 'none' }}>
            ⚡ Run Again
          </Link>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {report.error_message && (
        <div style={{
          background: 'var(--color-danger-50)',
          color: 'var(--color-danger-700)',
          borderLeft: '4px solid var(--color-danger-500)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          fontSize: 'var(--font-size-sm)',
        }}>
          <strong>Execution Error:</strong> {report.error_message}
        </div>
      )}

      {/* ── Main Content: Metrics + Chart + Trades ── */}
      {report.status === 'COMPLETED' && (
        <>
          {/* Key Quantitative Metrics */}
          <MetricsGrid report={report} />

          {/* Equity Curve Card */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-4)',
              paddingBottom: 'var(--space-3)',
              borderBottom: '1px solid var(--color-gray-100)',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
            }}>
              <div>
                <h3 className="card-title" style={{ margin: 0 }}>Portfolio Equity Curve</h3>
                <p className="card-subtitle">Mark-to-market portfolio value & cash allocation trajectory.</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#2563eb' }} />
                  <span style={{ color: 'var(--color-gray-700)' }}>Total Equity</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#9ca3af' }} />
                  <span style={{ color: 'var(--color-gray-500)' }}>Cash Reserves</span>
                </div>
              </div>
            </div>

            <div style={{ height: '420px' }}>
              <EquityChart snapshots={report.equitySnapshots || []} />
            </div>
          </div>

          {/* Trade Execution Log */}
          <TradeLog trades={report.trades || []} />
        </>
      )}

      {report.status === 'RUNNING' && (
        <div className="card" style={{ padding: 'var(--space-20)', textAlign: 'center' }}>
          <LoadingSpinner />
          <h3 className="card-title" style={{ marginTop: 'var(--space-4)' }}>Simulating Strategy Execution...</h3>
          <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--font-size-sm)' }}>
            Evaluating indicators and simulating order fills. This will take a moment.
          </p>
        </div>
      )}

    </div>
  );
}
