import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { strategiesService, LeaderboardEntry } from '../services/strategies.service';

/* ─── Medal config ─────────────────────────── */
const MEDALS = [
  {
    rank: 1,
    emoji: '🥇',
    label: '1st Place',
    accent: '#B7791F',       // deep gold
    bg: '#FFFBEB',
    border: '#F6D860',
    headerBg: 'linear-gradient(135deg, #F6D860 0%, #EAB308 100%)',
    textAccent: '#92400E',
    badgeBg: '#FEF3C7',
    badgeBorder: '#FDE68A',
  },
  {
    rank: 2,
    emoji: '🥈',
    label: '2nd Place',
    accent: '#4B5563',
    bg: '#F9FAFB',
    border: '#D1D5DB',
    headerBg: 'linear-gradient(135deg, #E5E7EB 0%, #9CA3AF 100%)',
    textAccent: '#374151',
    badgeBg: '#F3F4F6',
    badgeBorder: '#D1D5DB',
  },
  {
    rank: 3,
    emoji: '🥉',
    label: '3rd Place',
    accent: '#B45309',
    bg: '#FFFAF0',
    border: '#FDBA74',
    headerBg: 'linear-gradient(135deg, #FDBA74 0%, #F97316 100%)',
    textAccent: '#7C2D12',
    badgeBg: '#FFF7ED',
    badgeBorder: '#FED7AA',
  },
  {
    rank: 4,
    emoji: '4️⃣',
    label: '4th Place',
    accent: '#1D4ED8',
    bg: '#EFF6FF',
    border: '#93C5FD',
    headerBg: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)',
    textAccent: '#1E3A8A',
    badgeBg: '#DBEAFE',
    badgeBorder: '#BFDBFE',
  },
];

/* ─── Mini stat pill inside podium card ─────── */
function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px',
      padding: 'var(--space-3) var(--space-4)',
      background: 'rgba(255,255,255,0.7)',
      borderRadius: 'var(--radius-lg)',
      backdropFilter: 'blur(4px)',
      border: '1px solid rgba(255,255,255,0.9)',
      flex: 1,
    }}>
      <span style={{
        fontSize: '1.2rem',
        fontWeight: 'var(--font-weight-extrabold)',
        color: color || 'var(--color-gray-900)',
        lineHeight: 1.2,
      }}>
        {value}
      </span>
      <span style={{
        fontSize: '0.625rem',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--color-gray-500)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    </div>
  );
}

/* ─── Podium Card ───────────────────────────── */
function PodiumCard({ entry, medalIdx }: { entry: LeaderboardEntry; medalIdx: number }) {
  const medal = MEDALS[medalIdx];
  const isFirst = medalIdx === 0;

  return (
    <Link
      to={`/backtests/${entry.backtestId}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div style={{
        background: medal.bg,
        border: `2px solid ${medal.border}`,
        borderRadius: 'var(--radius-2xl)',
        overflow: 'hidden',
        boxShadow: isFirst
          ? `0 8px 32px rgba(234,179,8,0.2), 0 2px 8px rgba(0,0,0,0.06)`
          : 'var(--shadow-md)',
        transform: isFirst ? 'translateY(-12px)' : 'none',
        transition: 'all var(--transition-smooth)',
        position: 'relative',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = isFirst ? 'translateY(-18px)' : 'translateY(-6px)';
          (e.currentTarget as HTMLElement).style.boxShadow = isFirst
            ? '0 16px 48px rgba(234,179,8,0.28), 0 4px 16px rgba(0,0,0,0.10)'
            : 'var(--shadow-xl)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = isFirst ? 'translateY(-12px)' : 'none';
          (e.currentTarget as HTMLElement).style.boxShadow = isFirst
            ? '0 8px 32px rgba(234,179,8,0.2), 0 2px 8px rgba(0,0,0,0.06)'
            : 'var(--shadow-md)';
        }}
      >
        {/* Coloured header strip */}
        <div style={{
          background: medal.headerBg,
          padding: 'var(--space-5) var(--space-5) var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-2)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Shimmer overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.35) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />

          <div style={{ fontSize: '2.5rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>
            {medal.emoji}
          </div>
          <div style={{
            background: medal.badgeBg,
            border: `1px solid ${medal.badgeBorder}`,
            color: medal.textAccent,
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-bold)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '2px 10px',
            borderRadius: 'var(--radius-full)',
            position: 'relative',
            zIndex: 1,
          }}>
            {medal.label}
          </div>
        </div>

        {/* Body */}
        <div style={{
          padding: 'var(--space-5)',
          marginTop: '-24px',
          position: 'relative',
        }}>
          {/* Name card overlapping header */}
          <div style={{
            background: 'var(--color-white)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-4) var(--space-5)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-gray-100)',
            marginBottom: 'var(--space-4)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-gray-900)',
              marginBottom: 'var(--space-1)',
              lineHeight: 1.3,
            }}>
              {entry.strategyName}
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              background: 'var(--color-gray-100)',
              color: 'var(--color-gray-600)',
              fontFamily: 'monospace',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-semibold)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
            }}>
              📊 {entry.symbol}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <StatPill
              label="Sharpe"
              value={entry.sharpeRatio.toFixed(2)}
              color={medal.accent}
            />
            <StatPill
              label="Drawdown"
              value={`-${Math.abs(entry.maxDrawdown).toFixed(1)}%`}
              color="var(--color-danger-600)"
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <StatPill
              label="Total Return"
              value={`${entry.totalReturn >= 0 ? '+' : ''}${entry.totalReturn.toFixed(1)}%`}
              color={entry.totalReturn >= 0 ? 'var(--color-success-600)' : 'var(--color-danger-600)'}
            />
            <StatPill
              label="Win Rate"
              value={`${entry.winRate.toFixed(1)}%`}
              color="var(--color-gray-800)"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Main Page ─────────────────────────────── */
export function LeaderboardPage() {
  const { data: leaderboard = [], isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: strategiesService.getLeaderboard,
  });

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <span>Loading leaderboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3 className="empty-state-title">Failed to load leaderboard</h3>
        <p className="empty-state-description">Please try refreshing the page.</p>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🏆</div>
        <h3 className="empty-state-title">No rankings yet</h3>
        <p className="empty-state-description">
          Run backtests on your strategies to earn a spot on the leaderboard.
        </p>
        <Link to="/backtests" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
          ⚡ Run a Backtest
        </Link>
      </div>
    );
  }

  const top4 = leaderboard.slice(0, 4);
  const rest = leaderboard.slice(4);

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1000px', margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div style={{ textAlign: 'center', paddingBottom: 'var(--space-8)' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          background: 'var(--color-warning-50)',
          color: 'var(--color-warning-600)',
          border: '1px solid var(--color-warning-100)',
          padding: '4px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'var(--font-weight-semibold)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 'var(--space-4)',
        }}>
          🏆 Strategy Rankings
        </div>
        <h1 style={{
          fontSize: 'var(--font-size-4xl)',
          fontWeight: 'var(--font-weight-extrabold)',
          color: 'var(--color-gray-900)',
          letterSpacing: '-0.03em',
          marginBottom: 'var(--space-3)',
          lineHeight: 1.15,
        }}>
          Leaderboard
        </h1>
        <p style={{
          color: 'var(--color-gray-500)',
          fontSize: 'var(--font-size-md)',
          maxWidth: '480px',
          margin: '0 auto',
          lineHeight: 'var(--line-height-relaxed)',
        }}>
          Strategies ranked by best risk-adjusted return.
          Each row shows the top-performing backtest for that strategy.
        </p>
      </div>

      {/* ── Podium ── */}
      {(() => {
        // Build a reorder map so 1st is always visually centred/tallest.
        // e.g. 4 items → [1,0,2,3], 3 → [1,0,2], 2 → [1,0], 1 → [0]
        const reorderMap: number[] = top4.length === 1
          ? [0]
          : top4.length === 2
            ? [1, 0]
            : top4.length === 3
              ? [1, 0, 2]
              : [1, 0, 2, 3];

        return (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${top4.length}, 1fr)`,
            gap: 'var(--space-5)',
            alignItems: 'flex-end',
            paddingBottom: 'var(--space-4)',
          }}>
            {reorderMap.map(medalIdx => (
              <PodiumCard
                key={leaderboard[medalIdx].strategyId}
                entry={leaderboard[medalIdx]}
                medalIdx={medalIdx}
              />
            ))}
          </div>
        );
      })()}

      {/* ── Rest of leaderboard table ── */}
      {rest.length > 0 && (
        <div className="card" style={{ overflow: 'hidden', marginTop: 'var(--space-6)' }}>
          {/* Table header strip */}
          <div style={{
            padding: 'var(--space-4) var(--space-6)',
            borderBottom: '1px solid var(--color-gray-100)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}>
            <span style={{ fontSize: '1.1rem' }}>📋</span>
            <h3 className="card-title" style={{ margin: 0 }}>All Other Rankings</h3>
            <span style={{
              marginLeft: 'auto',
              background: 'var(--color-gray-100)',
              color: 'var(--color-gray-500)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-semibold)',
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
            }}>
              {rest.length} {rest.length === 1 ? 'strategy' : 'strategies'}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>#</th>
                  <th>Strategy</th>
                  <th style={{ textAlign: 'right' }}>Sharpe Ratio</th>
                  <th style={{ textAlign: 'right' }}>Max Drawdown</th>
                  <th style={{ textAlign: 'right' }}>Total Return</th>
                  <th style={{ textAlign: 'right' }}>Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((entry, idx) => {
                  const rank = idx + 5;
                  return (
                    <tr key={entry.strategyId}>
                      <td>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--color-gray-100)',
                          color: 'var(--color-gray-500)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'var(--font-weight-bold)',
                          fontSize: 'var(--font-size-xs)',
                        }}>
                          {rank}
                        </div>
                      </td>
                      <td>
                        <Link
                          to={`/backtests/${entry.backtestId}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <div style={{
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--color-gray-800)',
                            marginBottom: '2px',
                            transition: 'color var(--transition-fast)',
                          }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary-600)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-gray-800)'}
                          >
                            {entry.strategyName}
                          </div>
                        </Link>
                        <span className="badge badge-neutral" style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                          {entry.symbol}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{
                          fontWeight: 'var(--font-weight-bold)',
                          color: 'var(--color-gray-900)',
                          fontSize: 'var(--font-size-base)',
                        }}>
                          {entry.sharpeRatio.toFixed(2)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{
                          color: 'var(--color-danger-600)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}>
                          -{Math.abs(entry.maxDrawdown).toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{
                          color: entry.totalReturn >= 0
                            ? 'var(--color-success-600)'
                            : 'var(--color-danger-600)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}>
                          {entry.totalReturn >= 0 ? '+' : ''}
                          {entry.totalReturn.toFixed(2)}%
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                          {/* Mini bar */}
                          <div style={{
                            width: '48px',
                            height: '4px',
                            background: 'var(--color-gray-200)',
                            borderRadius: 'var(--radius-full)',
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${Math.min(entry.winRate, 100)}%`,
                              height: '100%',
                              background: entry.winRate >= 50
                                ? 'var(--color-success-500)'
                                : 'var(--color-warning-500)',
                              borderRadius: 'var(--radius-full)',
                            }} />
                          </div>
                          <span style={{
                            fontWeight: 'var(--font-weight-medium)',
                            color: 'var(--color-gray-700)',
                            fontSize: 'var(--font-size-sm)',
                          }}>
                            {entry.winRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Footer note ── */}
      <p style={{
        textAlign: 'center',
        color: 'var(--color-gray-400)',
        fontSize: 'var(--font-size-xs)',
        marginTop: 'var(--space-8)',
        lineHeight: 'var(--line-height-relaxed)',
      }}>
        Rankings reflect the single best-performing completed backtest per strategy, ordered by Sharpe Ratio.
      </p>
    </div>
  );
}
