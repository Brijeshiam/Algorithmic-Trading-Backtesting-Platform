import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backtestsService } from '../services/backtests.service';
import { simulationsService, MonteCarloResult } from '../services/simulations.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { HistogramChart } from '../components/monte-carlo/HistogramChart';

/* ─── Stat Card ─────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  description?: string;
}

function StatCard({ label, value, icon, color, bg, border, description }: StatCardProps) {
  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-gray-500)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {label}
        </span>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      </div>
      <div style={{
        fontSize: 'var(--font-size-2xl)',
        fontWeight: 'var(--font-weight-extrabold)',
        color,
        lineHeight: 1.1,
      }}>
        {value}
      </div>
      {description && (
        <div style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-gray-400)',
        }}>
          {description}
        </div>
      )}
    </div>
  );
}

/* ─── Results Panel ─────────────────────────── */
function ResultsPanel({ mcResult }: { mcResult: MonteCarloResult }) {
  const prob = Number(mcResult.probability_of_profit);
  const median = Number(mcResult.median_return);
  const p5 = Number(mcResult.p5_return);
  const p25 = Number(mcResult.p25_return);
  const p75 = Number(mcResult.p75_return);
  const p95 = Number(mcResult.p95_return);

  const pct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

      {/* Top metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-4)',
      }}>
        <StatCard
          label="Probability of Profit"
          value={`${prob.toFixed(1)}%`}
          icon="🎯"
          color={prob >= 50 ? 'var(--color-success-600)' : 'var(--color-danger-600)'}
          bg={prob >= 50 ? 'var(--color-success-50)' : 'var(--color-danger-50)'}
          border={prob >= 50 ? 'var(--color-success-100)' : 'var(--color-danger-100)'}
          description={`${mcResult.simulation_count.toLocaleString()} simulations run`}
        />
        <StatCard
          label="Median Return"
          value={pct(median)}
          icon="📊"
          color={median >= 0 ? 'var(--color-success-600)' : 'var(--color-danger-600)'}
          bg="var(--color-gray-50)"
          border="var(--color-gray-200)"
          description="50th percentile outcome"
        />
        <StatCard
          label="Best Case (P95)"
          value={pct(p95)}
          icon="🚀"
          color="var(--color-primary-700)"
          bg="var(--color-primary-50)"
          border="var(--color-primary-100)"
          description="Top 5% of simulations"
        />
      </div>

      {/* Percentile range bar */}
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-5)',
        }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-900)', marginBottom: '2px' }}>
              Return Percentile Range
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)' }}>
              Expected return spread across all simulations
            </p>
          </div>
          <span style={{
            background: 'var(--color-gray-100)',
            color: 'var(--color-gray-500)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            fontFamily: 'monospace',
          }}>
            n = {mcResult.simulation_count.toLocaleString()}
          </span>
        </div>

        {/* Range bar */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          {/* Labels row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            {[
              { label: 'P5', value: pct(p5), bad: p5 < 0 },
              { label: 'P25', value: pct(p25), bad: p25 < 0 },
              { label: 'Median', value: pct(median), bad: median < 0 },
              { label: 'P75', value: pct(p75), bad: false },
              { label: 'P95', value: pct(p95), bad: false },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-gray-400)',
                  marginBottom: '2px',
                  fontWeight: 'var(--font-weight-semibold)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: item.bad ? 'var(--color-danger-600)' : 'var(--color-success-600)',
                }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Segmented bar */}
          <div style={{
            height: '12px',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            display: 'flex',
            gap: '2px',
          }}>
            <div style={{ flex: 1, background: '#FCA5A5' }} title={`P5: ${pct(p5)}`} />
            <div style={{ flex: 1, background: '#FCD34D' }} title={`P25: ${pct(p25)}`} />
            <div style={{ flex: 1, background: '#6EE7B7' }} title={`Median: ${pct(median)}`} />
            <div style={{ flex: 1, background: '#34D399' }} title={`P75: ${pct(p75)}`} />
            <div style={{ flex: 1, background: '#059669' }} title={`P95: ${pct(p95)}`} />
          </div>

          {/* Legend */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-5)',
            marginTop: 'var(--space-3)',
          }}>
            {[
              { color: '#FCA5A5', label: 'Worst 25%' },
              { color: '#FCD34D', label: 'Below Median' },
              { color: '#6EE7B7', label: 'Above Median' },
              { color: '#059669', label: 'Best 25%' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: l.color }} />
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom 2 stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-4)',
          borderTop: '1px solid var(--color-gray-100)',
          paddingTop: 'var(--space-5)',
        }}>
          <div style={{
            padding: 'var(--space-4)',
            background: 'var(--color-danger-50)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-danger-100)',
          }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>
              📉 Worst Case (P5)
            </div>
            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--color-danger-600)' }}>
              {pct(p5)}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', marginTop: '2px' }}>Bottom 5% of outcomes</div>
          </div>
          <div style={{
            padding: 'var(--space-4)',
            background: 'var(--color-gray-50)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-gray-200)',
          }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>
              📈 Upper Quartile (P75)
            </div>
            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--color-success-600)' }}>
              {pct(p75)}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', marginTop: '2px' }}>Top 25% of outcomes</div>
          </div>
        </div>
      </div>

      {/* Histogram */}
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <h3 style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-gray-900)',
            marginBottom: '2px',
          }}>
            Return Distribution Histogram
          </h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)' }}>
            Frequency of final portfolio returns across all {mcResult.simulation_count.toLocaleString()} simulated paths
          </p>
        </div>
        <HistogramChart histogram={mcResult.results_json?.histogram || []} />
        <p style={{ textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', marginTop: 'var(--space-3)' }}>
          Final Portfolio Return (%)
        </p>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────── */
export function MonteCarloPage() {
  const queryClient = useQueryClient();
  const [selectedBacktestId, setSelectedBacktestId] = useState<string>('');
  const [simCount, setSimCount] = useState<number>(1000);

  const { data: allBacktests = [], isLoading: isLoadingBacktests } = useQuery({
    queryKey: ['backtests'],
    queryFn: backtestsService.listBacktests,
  });

  const completedBacktests = allBacktests.filter((bt: any) => bt.status === 'COMPLETED');

  const { data: mcResult, isLoading: isLoadingMc } = useQuery({
    queryKey: ['monte-carlo', selectedBacktestId],
    queryFn: () => simulationsService.getMonteCarlo(selectedBacktestId),
    enabled: !!selectedBacktestId,
  });

  const runMutation = useMutation({
    mutationFn: (sims: number) => simulationsService.runMonteCarlo(selectedBacktestId, sims),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monte-carlo', selectedBacktestId] });
    },
  });

  const handleRun = () => {
    if (!selectedBacktestId) return;
    runMutation.mutate(simCount);
  };

  const SIM_OPTIONS = [
    { value: 100, label: '100 simulations', note: 'Fast' },
    { value: 1000, label: '1,000 simulations', note: 'Recommended' },
    { value: 5000, label: '5,000 simulations', note: 'Precise' },
    { value: 10000, label: '10,000 simulations', note: 'High precision' },
  ];

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            background: 'var(--color-primary-50)',
            color: 'var(--color-primary-700)',
            border: '1px solid var(--color-primary-100)',
            padding: '3px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.07em',
            marginBottom: 'var(--space-3)',
          }}>
            🎲 Stress Testing
          </div>
          <h1 className="page-title">Monte Carlo Analysis</h1>
          <p className="page-subtitle">
            Resample historical trades to model thousands of alternate futures and measure strategy robustness.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>

        {/* ── Left Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* Strategy selector */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-gray-900)',
              marginBottom: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}>
              📋 Select Backtest
            </h3>

            {isLoadingBacktests ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-6)' }}>
                <LoadingSpinner />
              </div>
            ) : completedBacktests.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'var(--space-6)',
                background: 'var(--color-gray-50)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--color-gray-500)',
                fontSize: 'var(--font-size-sm)',
              }}>
                No completed backtests yet.
              </div>
            ) : (
              <select
                className="form-input"
                style={{ width: '100%' }}
                value={selectedBacktestId}
                onChange={e => setSelectedBacktestId(e.target.value)}
              >
                <option value="">— Choose a backtest —</option>
                {completedBacktests.map((bt: any) => (
                  <option key={bt.id} value={bt.id}>
                    {bt.strategy_name} ({bt.symbol})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Simulation count + Run button */}
          {selectedBacktestId && (
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h3 style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-gray-900)',
                marginBottom: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}>
                ⚙️ Configuration
              </h3>

              <label className="form-label" style={{ marginBottom: 'var(--space-2)', display: 'block' }}>
                Simulation Count
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
                {SIM_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-lg)',
                      border: `2px solid ${simCount === opt.value ? 'var(--color-primary-400)' : 'var(--color-gray-200)'}`,
                      background: simCount === opt.value ? 'var(--color-primary-50)' : 'var(--color-white)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-base)',
                    }}
                  >
                    <input
                      type="radio"
                      name="simCount"
                      value={opt.value}
                      checked={simCount === opt.value}
                      onChange={() => setSimCount(opt.value)}
                      style={{ accentColor: 'var(--color-primary-600)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: simCount === opt.value ? 'var(--color-primary-800)' : 'var(--color-gray-700)',
                      }}>
                        {opt.label}
                      </div>
                    </div>
                    {opt.note === 'Recommended' && (
                      <span style={{
                        fontSize: '0.6rem',
                        fontWeight: 'var(--font-weight-bold)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        background: 'var(--color-primary-100)',
                        color: 'var(--color-primary-700)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-full)',
                      }}>
                        {opt.note}
                      </span>
                    )}
                  </label>
                ))}
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={handleRun}
                disabled={runMutation.isPending}
              >
                {runMutation.isPending ? (
                  <>
                    <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                    Running...
                  </>
                ) : (
                  `🎲 Run ${simCount.toLocaleString()} Simulations`
                )}
              </button>

              {runMutation.isError && (
                <div style={{
                  marginTop: 'var(--space-3)',
                  background: 'var(--color-danger-50)',
                  color: 'var(--color-danger-700)',
                  borderLeft: '3px solid var(--color-danger-500)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-xs)',
                }}>
                  {/* @ts-ignore */}
                  ❌ {runMutation.error?.response?.data?.error || runMutation.error?.message}
                </div>
              )}
            </div>
          )}

          {/* Info card */}
          <div style={{
            background: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-100)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-5)',
          }}>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-primary-800)',
              marginBottom: 'var(--space-3)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}>
              💡 How it works
            </div>
            <p style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-primary-700)',
              lineHeight: 'var(--line-height-relaxed)',
            }}>
              Monte Carlo analysis randomly resamples your closed trades (with replacement) to simulate thousands of
              alternative equity paths. This reveals the <strong>true probability of profit</strong> and expected range
              of returns — without relying on a single historical sequence.
            </p>
          </div>
        </div>

        {/* ── Right: Results ── */}
        <div>
          {!selectedBacktestId ? (
            <div className="card" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-20)',
              textAlign: 'center',
              borderStyle: 'dashed',
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-4)', lineHeight: 1 }}>🎲</div>
              <h3 style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-gray-900)',
                marginBottom: 'var(--space-2)',
              }}>
                Select a strategy to begin
              </h3>
              <p style={{
                color: 'var(--color-gray-400)',
                fontSize: 'var(--font-size-sm)',
                maxWidth: '320px',
                lineHeight: 'var(--line-height-relaxed)',
              }}>
                Choose a completed backtest from the panel on the left, configure simulations, and run the analysis.
              </p>
            </div>
          ) : isLoadingMc ? (
            <div className="card" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-20)',
            }}>
              <LoadingSpinner />
              <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-gray-500)', fontSize: 'var(--font-size-sm)' }}>
                Loading results...
              </p>
            </div>
          ) : runMutation.isPending ? (
            <div className="card" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-20)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)', animation: 'spin 1s linear infinite' }}>🎲</div>
              <h3 style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-gray-900)',
                marginBottom: 'var(--space-2)',
              }}>
                Running {simCount.toLocaleString()} simulations...
              </h3>
              <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--font-size-sm)' }}>
                This may take a few seconds.
              </p>
            </div>
          ) : !mcResult ? (
            <div className="card" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-20)',
              textAlign: 'center',
              borderStyle: 'dashed',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📊</div>
              <h3 style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-gray-900)',
                marginBottom: 'var(--space-2)',
              }}>
                No results yet
              </h3>
              <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--font-size-sm)' }}>
                Click <strong>Run Simulations</strong> on the left to generate your Monte Carlo analysis.
              </p>
            </div>
          ) : (
            <ResultsPanel mcResult={mcResult} />
          )}
        </div>
      </div>
    </div>
  );
}
