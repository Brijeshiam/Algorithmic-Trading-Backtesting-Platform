import React, { useState } from 'react';
import { BacktestTrade } from '../../services/backtests.service';

interface TradeLogProps {
  trades: BacktestTrade[];
}

export function TradeLog({ trades }: TradeLogProps) {
  const [filter, setFilter] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');

  if (trades.length === 0) {
    return (
      <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>📭</div>
        <h3 className="card-title" style={{ marginBottom: 'var(--space-1)' }}>No Trades Executed</h3>
        <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--font-size-sm)' }}>
          Strategy conditions did not trigger any buy/sell entries during the backtest timeframe.
        </p>
      </div>
    );
  }

  const formatCur = (val: string | number | null) => 
    val !== null && val !== undefined ? `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

  const winningTrades = trades.filter(t => Number(t.net_pnl || 0) > 0);
  const losingTrades = trades.filter(t => Number(t.net_pnl || 0) <= 0);

  const filteredTrades = filter === 'WIN' 
    ? winningTrades 
    : filter === 'LOSS' 
    ? losingTrades 
    : trades;

  return (
    <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
      {/* ── Table Header Strip ── */}
      <div style={{
        padding: 'var(--space-4) var(--space-6)',
        borderBottom: '1px solid var(--color-gray-100)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--color-gray-50)',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: '1.2rem' }}>📜</span>
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>Trade Execution Log</h3>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
              {trades.length} Total Executions ({winningTrades.length} Win / {losingTrades.length} Loss)
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-300)',
          borderRadius: 'var(--radius-full)',
          padding: '2px',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            style={{
              padding: '3px 10px',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-semibold)',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              background: filter === 'ALL' ? 'var(--color-gray-800)' : 'transparent',
              color: filter === 'ALL' ? '#fff' : 'var(--color-gray-600)',
              transition: 'all var(--transition-fast)',
            }}
          >
            All ({trades.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('WIN')}
            style={{
              padding: '3px 10px',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-semibold)',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              background: filter === 'WIN' ? 'var(--color-success-600)' : 'transparent',
              color: filter === 'WIN' ? '#fff' : 'var(--color-gray-600)',
              transition: 'all var(--transition-fast)',
            }}
          >
            Wins ({winningTrades.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('LOSS')}
            style={{
              padding: '3px 10px',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-semibold)',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              background: filter === 'LOSS' ? 'var(--color-danger-600)' : 'transparent',
              color: filter === 'LOSS' ? '#fff' : 'var(--color-gray-600)',
              transition: 'all var(--transition-fast)',
            }}
          >
            Losses ({losingTrades.length})
          </button>
        </div>
      </div>

      {/* ── Trades Table ── */}
      <div style={{ overflowX: 'auto', maxHeight: '550px', overflowY: 'auto' }}>
        <table className="data-table">
          <thead style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--color-white)' }}>
            <tr>
              <th>Entry Date</th>
              <th>Side</th>
              <th style={{ textAlign: 'right' }}>Shares</th>
              <th style={{ textAlign: 'right' }}>Entry Price</th>
              <th>Exit Date</th>
              <th style={{ textAlign: 'right' }}>Exit Price</th>
              <th style={{ textAlign: 'right' }}>Duration</th>
              <th style={{ textAlign: 'right' }}>Costs</th>
              <th style={{ textAlign: 'right' }}>Net PnL</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades.map((t) => {
              const netPnl = Number(t.net_pnl || 0);
              const isProfit = netPnl > 0;

              return (
                <tr key={t.id} style={{ transition: 'background var(--transition-fast)' }}>
                  {/* Entry Date */}
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-600)', whiteSpace: 'nowrap' }}>
                    {new Date(t.entry_time).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>

                  {/* Side */}
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.7rem',
                      fontWeight: 'var(--font-weight-bold)',
                      background: t.side === 'BUY' ? 'var(--color-success-50)' : 'var(--color-danger-50)',
                      color: t.side === 'BUY' ? 'var(--color-success-700)' : 'var(--color-danger-700)',
                      border: `1px solid ${t.side === 'BUY' ? 'var(--color-success-200)' : 'var(--color-danger-200)'}`,
                    }}>
                      {t.side === 'BUY' ? '↑ BUY' : '↓ SELL'}
                    </span>
                  </td>

                  {/* Quantity */}
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-800)' }}>
                    {Number(t.quantity).toLocaleString()}
                  </td>

                  {/* Entry Price */}
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--color-gray-700)' }}>
                    {formatCur(t.entry_price)}
                  </td>

                  {/* Exit Date */}
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-600)', whiteSpace: 'nowrap' }}>
                    {t.exit_time ? new Date(t.exit_time).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </td>

                  {/* Exit Price */}
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--color-gray-700)' }}>
                    {t.exit_price ? formatCur(t.exit_price) : '—'}
                  </td>

                  {/* Holding Duration */}
                  <td style={{ textAlign: 'right', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                    {t.exit_time ? `${Math.max(1, Math.round((new Date(t.exit_time).getTime() - new Date(t.entry_time).getTime()) / (1000 * 60 * 60 * 24)))}d` : '—'}
                  </td>

                  {/* Costs */}
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)' }}>
                    {formatCur(t.costs)}
                  </td>

                  {/* Net PnL */}
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'var(--font-weight-bold)' }}>
                    {t.net_pnl ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-md)',
                        background: isProfit ? 'var(--color-success-50)' : 'var(--color-danger-50)',
                        color: isProfit ? 'var(--color-success-700)' : 'var(--color-danger-700)',
                        border: `1px solid ${isProfit ? 'var(--color-success-200)' : 'var(--color-danger-200)'}`,
                      }}>
                        {isProfit ? '+' : ''}{formatCur(t.net_pnl)}
                      </span>
                    ) : (
                      <span className="badge badge-warning">OPEN</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
