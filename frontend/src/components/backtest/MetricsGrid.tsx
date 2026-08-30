import React from 'react';
import { BacktestDetails } from '../../services/backtests.service';

interface MetricsGridProps {
  report: BacktestDetails;
}

export function MetricsGrid({ report }: MetricsGridProps) {
  const formatPct = (val: string | number | null) => 
    val !== null && val !== undefined ? `${Number(val) >= 0 ? '+' : ''}${Number(val).toFixed(2)}%` : '—';
  const formatNum = (val: string | number | null, decimals = 2) => 
    val !== null && val !== undefined ? Number(val).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : '—';
  const formatCur = (val: string | number | null) => 
    val !== null && val !== undefined ? `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

  const totalReturn = Number(report.total_return || 0);
  const sharpe = Number(report.sharpe_ratio || 0);
  const mdd = Number(report.max_drawdown || 0);
  const winRate = Number(report.win_rate || 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      
      {/* ── Top Hero Stat Cards (Primary KPIs) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-4)',
      }}>
        
        {/* Card 1: Total Return */}
        <div style={{
          background: totalReturn >= 0 ? 'var(--color-success-50)' : 'var(--color-danger-50)',
          border: `1px solid ${totalReturn >= 0 ? 'var(--color-success-100)' : 'var(--color-danger-100)'}`,
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Return
            </span>
            <span style={{ fontSize: '1.2rem' }}>{totalReturn >= 0 ? '📈' : '📉'}</span>
          </div>
          <div style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-extrabold)',
            color: totalReturn >= 0 ? 'var(--color-success-600)' : 'var(--color-danger-600)',
            lineHeight: 1.1,
          }}>
            {formatPct(report.total_return)}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
            Initial: {formatCur(report.initial_capital)} → Final: {formatCur(report.final_equity)}
          </div>
        </div>

        {/* Card 2: Sharpe Ratio */}
        <div style={{
          background: 'var(--color-primary-50)',
          border: '1px solid var(--color-primary-100)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sharpe Ratio
            </span>
            <span style={{ fontSize: '1.2rem' }}>⚖️</span>
          </div>
          <div style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-extrabold)',
            color: 'var(--color-primary-700)',
            lineHeight: 1.1,
          }}>
            {formatNum(report.sharpe_ratio)}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-600)' }}>
            Sortino: {formatNum(report.sortino_ratio)} (Downside Risk)
          </div>
        </div>

        {/* Card 3: Max Drawdown */}
        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Max Drawdown
            </span>
            <span style={{ fontSize: '1.2rem' }}>🛡️</span>
          </div>
          <div style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-extrabold)',
            color: mdd > 20 ? 'var(--color-danger-600)' : 'var(--color-gray-900)',
            lineHeight: 1.1,
          }}>
            {mdd ? `-${mdd.toFixed(2)}%` : '0.00%'}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)' }}>
            Peak-to-trough capital dip
          </div>
        </div>

        {/* Card 4: Win Rate & Profit Factor */}
        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Win Rate
            </span>
            <span style={{ fontSize: '1.2rem' }}>🎯</span>
          </div>
          <div style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-extrabold)',
            color: winRate >= 50 ? 'var(--color-success-600)' : 'var(--color-gray-900)',
            lineHeight: 1.1,
          }}>
            {formatPct(report.win_rate).replace('+', '')}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
            Profit Factor: <strong>{formatNum(report.profit_factor)}</strong>
          </div>
        </div>

      </div>

      {/* ── Detailed Breakdown Table ── */}
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-4)',
          paddingBottom: 'var(--space-3)',
          borderBottom: '1px solid var(--color-gray-100)',
        }}>
          <span style={{ fontSize: '1.1rem' }}>📊</span>
          <h3 className="card-title" style={{ margin: 0 }}>Detailed Quantitative Breakdown</h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--space-4)',
        }}>
          {[
            { label: 'CAGR (Annualized)', value: formatPct(report.cagr), sub: 'Annual growth rate', color: Number(report.cagr) >= 0 ? 'var(--color-success-600)' : 'var(--color-danger-600)' },
            { label: 'Annual Volatility', value: formatPct(report.volatility).replace('+', ''), sub: 'Std dev of returns', color: 'var(--color-gray-800)' },
            { label: 'Market Exposure', value: formatPct(report.exposure).replace('+', ''), sub: 'Time in position', color: 'var(--color-gray-800)' },
            { label: 'Total Executions', value: `${report.trade_count || 0} trades`, sub: 'Closed positions', color: 'var(--color-primary-700)' },
            { label: 'Avg Holding Days', value: `${formatNum(report.avg_holding_days, 1)} days`, sub: 'Per trade duration', color: 'var(--color-gray-800)' },
            { label: 'Gross Profit', value: formatCur(report.gross_profit), sub: 'Winning trades', color: 'var(--color-success-600)' },
            { label: 'Gross Loss', value: formatCur(report.gross_loss), sub: 'Losing trades', color: 'var(--color-danger-600)' },
            { label: 'Total Friction Costs', value: formatCur(report.total_costs), sub: 'Commission + Slippage', color: 'var(--color-gray-500)' },
          ].map((item, idx) => (
            <div key={idx} style={{
              background: 'var(--color-gray-50)',
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-3) var(--space-4)',
            }}>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                {item.label}
              </div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: item.color }}>
                {item.value}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-gray-400)', marginTop: '2px' }}>
                {item.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
