import React, { useState } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { backtestsService } from '../services/backtests.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CompareChart } from '../components/compare/CompareChart';

/* ─── Colour palette for each selected backtest ── */
const SERIES_COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed'];
const SERIES_BG     = ['#eff6ff', '#ecfdf5', '#fffbeb', '#f5f3ff'];
const SERIES_BORDER = ['#bfdbfe', '#a7f3d0', '#fde68a', '#ddd6fe'];

/* ─── Comparison metric row ─────────────────── */
function ComparisonRow({
  label, icon, data, field, format, higherIsBetter,
}: {
  label: string; icon: string; data: any[]; field: string;
  format: (v: number) => string; higherIsBetter: boolean | null;
}) {
  const values = data.map(d => Number(d[field]) || 0);

  let bestIdx: number | null = null;
  if (higherIsBetter !== null && values.length > 1) {
    const best = higherIsBetter ? Math.max(...values) : Math.min(...values);
    bestIdx = values.indexOf(best);
  }

  return (
    <tr style={{ borderBottom: '1px solid var(--color-gray-100)' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-gray-50)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
    >
      {/* Label cell */}
      <td style={{
        padding: 'var(--space-3) var(--space-5)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--color-gray-600)',
        whiteSpace: 'nowrap',
      }}>
        <span style={{ marginRight: 'var(--space-2)' }}>{icon}</span>{label}
      </td>

      {/* Value cells */}
      {values.map((val, i) => {
        const isBest = bestIdx !== null && i === bestIdx;
        return (
          <td key={i} style={{
            padding: 'var(--space-3) var(--space-5)',
            textAlign: 'center',
            fontFamily: 'monospace',
            fontWeight: isBest ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
            color: isBest ? SERIES_COLORS[i] : 'var(--color-gray-800)',
            position: 'relative',
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: isBest ? '2px 10px' : undefined,
              background: isBest ? SERIES_BG[i] : undefined,
              border: isBest ? `1px solid ${SERIES_BORDER[i]}` : undefined,
              borderRadius: isBest ? 'var(--radius-full)' : undefined,
            }}>
              {isBest && <span style={{ fontSize: '0.7rem' }}>✦</span>}
              {format(val)}
            </span>
          </td>
        );
      })}

      {/* Empty cells for unselected columns (up to 4) */}
      {Array.from({ length: 4 - data.length }).map((_, i) => (
        <td key={`empty-${i}`} />
      ))}
    </tr>
  );
}

/* ─── Backtest selection card ───────────────── */
function BacktestPickerItem({
  bt, isSelected, colorIdx, onToggle,
}: {
  bt: any; isSelected: boolean; colorIdx: number; onToggle: () => void;
}) {
  const ret = Number(bt.total_return);

  return (
    <div
      onClick={onToggle}
      style={{
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-lg)',
        border: `2px solid ${isSelected ? SERIES_COLORS[colorIdx] : 'var(--color-gray-200)'}`,
        background: isSelected ? SERIES_BG[colorIdx] : 'var(--color-white)',
        cursor: 'pointer',
        transition: 'all var(--transition-base)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.borderColor = SERIES_COLORS[colorIdx];
          (e.currentTarget as HTMLElement).style.background = SERIES_BG[colorIdx];
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gray-200)';
          (e.currentTarget as HTMLElement).style.background = 'var(--color-white)';
        }
      }}
    >
      {/* Colour dot / checkbox */}
      <div style={{
        width: '16px',
        height: '16px',
        borderRadius: '4px',
        border: `2px solid ${SERIES_COLORS[isSelected ? colorIdx : 0]}`,
        background: isSelected ? SERIES_COLORS[colorIdx] : 'transparent',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all var(--transition-fast)',
      }}>
        {isSelected && (
          <svg width="9" height="9" viewBox="0 0 10 10" fill="white">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-semibold)',
          color: isSelected ? SERIES_COLORS[colorIdx] : 'var(--color-gray-800)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {bt.strategy_name}
        </div>
        <div style={{
          display: 'flex',
          gap: 'var(--space-2)',
          marginTop: '2px',
          alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '0.7rem',
            background: 'var(--color-gray-100)',
            color: 'var(--color-gray-600)',
            padding: '1px 6px',
            borderRadius: 'var(--radius-full)',
          }}>
            {bt.symbol}
          </span>
          <span style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            color: ret >= 0 ? 'var(--color-success-600)' : 'var(--color-danger-600)',
          }}>
            {ret >= 0 ? '+' : ''}{ret.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────── */
export function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: allBacktests = [], isLoading: isLoadingList } = useQuery({
    queryKey: ['backtests'],
    queryFn: backtestsService.listBacktests,
  });

  const completedBacktests = allBacktests.filter((bt: any) => bt.status === 'COMPLETED');

  const backtestQueries = useQueries({
    queries: selectedIds.map(id => ({
      queryKey: ['backtest', id],
      queryFn: () => backtestsService.getBacktest(id),
      staleTime: Infinity,
    })),
  });

  const isLoadingDetails = backtestQueries.some(q => q.isLoading);
  const selectedData = backtestQueries.map(q => q.data).filter(Boolean) as any[];

  const handleToggle = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 4) return prev; // silently cap at 4
      return [...prev, id];
    });
  };

  const METRICS = [
    { label: 'Total Return',     icon: '📈', field: 'total_return',     format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`, higherIsBetter: true  },
    { label: 'CAGR',             icon: '📅', field: 'cagr',             format: (v: number) => `${v.toFixed(2)}%`,                     higherIsBetter: true  },
    { label: 'Sharpe Ratio',     icon: '⚖️',  field: 'sharpe_ratio',    format: (v: number) => v.toFixed(2),                           higherIsBetter: true  },
    { label: 'Win Rate',         icon: '🎯', field: 'win_rate',         format: (v: number) => `${v.toFixed(1)}%`,                     higherIsBetter: true  },
    { label: 'Profit Factor',    icon: '💹', field: 'profit_factor',    format: (v: number) => v.toFixed(2),                           higherIsBetter: true  },
    { label: 'Max Drawdown',     icon: '📉', field: 'max_drawdown',     format: (v: number) => `${v.toFixed(2)}%`,                     higherIsBetter: false },
    { label: 'Volatility',       icon: '〰️', field: 'volatility',       format: (v: number) => `${v.toFixed(2)}%`,                     higherIsBetter: false },
    { label: 'Trade Count',      icon: '🔢', field: 'trade_count',      format: (v: number) => v.toString(),                           higherIsBetter: null  },
    { label: 'Avg Holding Days', icon: '🗓️', field: 'avg_holding_days', format: (v: number) => `${v.toFixed(1)}d`,                    higherIsBetter: null  },
    { label: 'Exposure',         icon: '📊', field: 'exposure',         format: (v: number) => `${v.toFixed(1)}%`,                     higherIsBetter: null  },
  ];

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            background: '#f5f3ff',
            color: '#6d28d9',
            border: '1px solid #ddd6fe',
            padding: '3px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.07em',
            marginBottom: 'var(--space-3)',
          }}>
            ⚖️ Side-by-Side Analysis
          </div>
          <h1 className="page-title">Compare Strategies</h1>
          <p className="page-subtitle">Select up to 4 completed backtests and compare their performance metrics side by side.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>

        {/* ── Left: Picker ── */}
        <div className="card" style={{ padding: 'var(--space-5)', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)',
          }}>
            <h3 style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-gray-900)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}>
              📋 Select Backtests
            </h3>
            <span style={{
              background: selectedIds.length === 4 ? 'var(--color-warning-50)' : 'var(--color-gray-100)',
              color: selectedIds.length === 4 ? 'var(--color-warning-600)' : 'var(--color-gray-500)',
              fontSize: '0.65rem',
              fontWeight: 'var(--font-weight-bold)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              border: selectedIds.length === 4 ? '1px solid var(--color-warning-100)' : 'none',
            }}>
              {selectedIds.length}/4
            </span>
          </div>

          {/* Colour legend */}
          {selectedIds.length > 0 && (
            <div style={{
              display: 'flex',
              gap: 'var(--space-2)',
              flexWrap: 'wrap',
              marginBottom: 'var(--space-4)',
              padding: 'var(--space-3)',
              background: 'var(--color-gray-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-gray-200)',
            }}>
              {selectedIds.map((id, i) => {
                const bt = completedBacktests.find((b: any) => b.id === id);
                return (
                  <div key={id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: 'var(--font-size-xs)',
                    color: SERIES_COLORS[i],
                    fontWeight: 'var(--font-weight-semibold)',
                  }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: SERIES_COLORS[i], flexShrink: 0 }} />
                    {bt?.strategy_name?.split(' ')[0] || `Series ${i+1}`}
                  </div>
                );
              })}
            </div>
          )}

          {isLoadingList ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-8)' }}>
              <LoadingSpinner />
            </div>
          ) : completedBacktests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-gray-400)', fontSize: 'var(--font-size-sm)' }}>
              No completed backtests yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {completedBacktests.map((bt: any) => {
                const selIdx = selectedIds.indexOf(bt.id);
                const isSelected = selIdx !== -1;
                const colorIdx = isSelected ? selIdx : Math.min(selectedIds.length, 3);
                return (
                  <BacktestPickerItem
                    key={bt.id}
                    bt={bt}
                    isSelected={isSelected}
                    colorIdx={colorIdx}
                    onToggle={() => handleToggle(bt.id)}
                  />
                );
              })}
            </div>
          )}

          {selectedIds.length > 0 && (
            <button
              onClick={() => setSelectedIds([])}
              style={{
                marginTop: 'var(--space-4)',
                width: '100%',
                padding: 'var(--space-2)',
                background: 'none',
                border: '1px solid var(--color-gray-200)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-gray-500)',
                fontSize: 'var(--font-size-xs)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-danger-300)';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-danger-600)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gray-200)';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-gray-500)';
              }}
            >
              ✕ Clear all
            </button>
          )}
        </div>

        {/* ── Right: Comparison area ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {selectedIds.length === 0 ? (
            <div className="card" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-20)',
              textAlign: 'center',
              borderStyle: 'dashed',
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-4)', lineHeight: 1 }}>⚖️</div>
              <h3 style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-gray-900)',
                marginBottom: 'var(--space-2)',
              }}>
                Nothing selected yet
              </h3>
              <p style={{
                color: 'var(--color-gray-400)',
                fontSize: 'var(--font-size-sm)',
                maxWidth: '340px',
                lineHeight: 'var(--line-height-relaxed)',
              }}>
                Pick 2 to 4 completed backtests from the list on the left to see their equity curves and metrics side by side.
              </p>
            </div>
          ) : (
            <>
              {/* ── Selected strategy header pills ── */}
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                {selectedData.map((bt, i) => (
                  <div key={bt.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-4)',
                    background: SERIES_BG[i],
                    border: `1.5px solid ${SERIES_BORDER[i]}`,
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: SERIES_COLORS[i],
                  }}>
                    <div style={{
                      width: '10px', height: '10px',
                      borderRadius: '3px',
                      background: SERIES_COLORS[i],
                      flexShrink: 0,
                    }} />
                    {bt.strategy_name}
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: 'var(--font-size-xs)',
                      opacity: 0.7,
                    }}>
                      {bt.symbol}
                    </span>
                  </div>
                ))}
              </div>

              {/* ── Equity Curve ── */}
              <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
                  <div>
                    <h3 style={{
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-gray-900)',
                      marginBottom: '2px',
                    }}>
                      Equity Curve Comparison
                    </h3>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)' }}>
                      Portfolio value over time for each selected strategy
                    </p>
                  </div>
                  <span style={{
                    background: 'var(--color-gray-100)',
                    color: 'var(--color-gray-500)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'var(--font-weight-semibold)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    {selectedData.length} series
                  </span>
                </div>

                {isLoadingDetails ? (
                  <div style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LoadingSpinner />
                  </div>
                ) : (
                  <CompareChart backtests={selectedData} />
                )}
              </div>

              {/* ── Metrics table ── */}
              <div className="card" style={{ overflow: 'hidden' }}>
                {/* Table header */}
                <div style={{
                  padding: 'var(--space-4) var(--space-5)',
                  borderBottom: '1px solid var(--color-gray-100)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                }}>
                  <span style={{ fontSize: '1.1rem' }}>📊</span>
                  <h3 style={{
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-gray-900)',
                    margin: 0,
                  }}>Performance Metrics</h3>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-gray-400)',
                  }}>
                    ✦ Best value highlighted
                  </span>
                </div>

                {isLoadingDetails ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-gray-100)' }}>
                          <th style={{
                            padding: 'var(--space-3) var(--space-5)',
                            textAlign: 'left',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--color-gray-500)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            whiteSpace: 'nowrap',
                            width: '180px',
                          }}>
                            Metric
                          </th>
                          {selectedData.map((bt, i) => (
                            <th key={bt.id} style={{
                              padding: 'var(--space-3) var(--space-5)',
                              textAlign: 'center',
                            }}>
                              <div style={{
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 'var(--font-weight-semibold)',
                                color: SERIES_COLORS[i],
                                marginBottom: '2px',
                              }}>
                                {bt.strategy_name}
                              </div>
                              <div style={{
                                fontSize: '0.68rem',
                                fontFamily: 'monospace',
                                color: 'var(--color-gray-400)',
                                background: SERIES_BG[i],
                                padding: '1px 8px',
                                borderRadius: 'var(--radius-full)',
                                display: 'inline-block',
                              }}>
                                {bt.symbol}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {METRICS.map(m => (
                          <ComparisonRow key={m.field} {...m} data={selectedData} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
