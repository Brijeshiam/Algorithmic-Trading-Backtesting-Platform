import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AssetSelector } from '../components/market/AssetSelector';
import { DateRangePicker } from '../components/market/DateRangePicker';
import { marketService } from '../services/market.service';
import { strategiesService } from '../services/strategies.service';
import { backtestsService, RunBacktestDTO } from '../services/backtests.service';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function BacktestSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateStrategyId = location.state?.strategyId || '';

  const [strategyId, setStrategyId] = useState(stateStrategyId);
  const [symbol, setSymbol] = useState('AAPL');
  const [from, setFrom] = useState('2023-01-01');
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [capital, setCapital] = useState(100000);
  const [commission, setCommission] = useState(0.1);
  const [slippage, setSlippage] = useState(0.05);

  const { data: assets = [], isLoading: isLoadingAssets } = useQuery({
    queryKey: ['assets'],
    queryFn: marketService.getAssets,
  });

  const { data: strategies = [], isLoading: isLoadingStrategies } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => strategiesService.getStrategies(),
  });

  // Automatically select first strategy if available and none selected
  React.useEffect(() => {
    if (!strategyId && strategies.length > 0) {
      setStrategyId(strategies[0].id);
    }
  }, [strategies, strategyId]);

  const selectedStrategy = strategies.find(s => s.id === strategyId);
  const selectedAsset = assets.find(a => a.symbol === symbol);

  const runMutation = useMutation({
    mutationFn: (payload: RunBacktestDTO) => backtestsService.runBacktest(payload),
    onSuccess: (data) => {
      navigate(`/backtests/${data.id}`);
    },
  });

  const handleRun = () => {
    if (!strategyId || !symbol) return;
    
    runMutation.mutate({
      strategyId,
      symbol,
      dateStart: from,
      dateEnd: to,
      initialCapital: capital,
      commissionRate: commission / 100, // Convert % to decimal
      slippageRate: slippage / 100,     // Convert % to decimal
    });
  };

  // Calculate approximate duration in days
  const startDate = new Date(from);
  const endDate = new Date(to);
  const diffDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-6)',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
      }}>
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
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: 'var(--space-2)',
          }}>
            ⚡ Backtest Engine
          </div>
          <h1 className="page-title">Run Historical Backtest</h1>
          <p className="page-subtitle">Test and validate strategy performance against historical candle data with execution cost modeling.</p>
        </div>

        <Link to="/backtests" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
          📋 View Past Backtests
        </Link>
      </div>

      {/* ── Error Banner ── */}
      {runMutation.isError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          background: 'var(--color-danger-50)',
          color: 'var(--color-danger-700)',
          border: '1px solid var(--color-danger-100)',
          borderLeft: '4px solid var(--color-danger-500)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-6)',
          fontSize: 'var(--font-size-sm)',
        }}>
          <span style={{ fontSize: '1.2rem' }}>❌</span>
          <span>{runMutation.error instanceof Error ? runMutation.error.message : 'Failed to run backtest'}</span>
        </div>
      )}

      {/* ── Two Column Setup ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.6fr) minmax(320px, 1fr)',
        gap: 'var(--space-6)',
        alignItems: 'start',
      }}>

        {/* ── Left Column: Configuration Forms ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Card 1: Strategy & Market Data Selection */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div className="card-header" style={{ marginBottom: 'var(--space-5)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: '1.1rem' }}>🧩</span>
                  <h3 className="card-title" style={{ margin: 0 }}>Strategy & Market Asset</h3>
                </div>
                <p className="card-subtitle">Choose the logic model and the target trading instrument.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              
              {/* Strategy Selector */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="form-label form-required">Strategy Model</label>
                  <Link to="/strategies/new" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-600)', textDecoration: 'none', fontWeight: 600 }}>
                    + Create New Strategy
                  </Link>
                </div>

                {isLoadingStrategies ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-gray-400)', fontSize: 'var(--font-size-sm)' }}>
                    <LoadingSpinner /> Loading your strategies...
                  </div>
                ) : strategies.length === 0 ? (
                  <div style={{
                    padding: 'var(--space-4)',
                    background: 'var(--color-warning-50)',
                    border: '1px solid var(--color-warning-100)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-warning-700)',
                  }}>
                    No strategies created yet. <Link to="/strategies/new" style={{ fontWeight: 'bold', color: 'var(--color-warning-800)' }}>Create one first</Link>.
                  </div>
                ) : (
                  <select
                    className="form-input"
                    value={strategyId}
                    onChange={(e) => setStrategyId(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="" disabled>Select strategy...</option>
                    {strategies.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.status === 'DRAFT' ? '• (Draft)' : '• (Active)'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Asset Selector */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label form-required">Target Asset</label>
                <AssetSelector
                  assets={assets}
                  selectedSymbol={symbol}
                  onSelect={setSymbol}
                  isLoading={isLoadingAssets}
                />
              </div>

              {/* Date Range */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label form-required">Historical Backtest Horizon</label>
                <DateRangePicker
                  from={from}
                  to={to}
                  onFromChange={setFrom}
                  onToChange={setTo}
                />
              </div>

            </div>
          </div>

          {/* Card 2: Capital & Execution Realism */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div className="card-header" style={{ marginBottom: 'var(--space-5)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: '1.1rem' }}>⚙️</span>
                  <h3 className="card-title" style={{ margin: 0 }}>Capital & Transaction Cost Model</h3>
                </div>
                <p className="card-subtitle">Simulate real-world broker fees and execution slippage.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
              
              {/* Initial Capital */}
              <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                <label className="form-label form-required">Starting Capital ($ USD)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: 'var(--space-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 'bold',
                    color: 'var(--color-gray-400)',
                    fontSize: 'var(--font-size-base)',
                  }}>$</span>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    value={capital}
                    onChange={(e) => setCapital(Number(e.target.value))}
                    className="form-input"
                    style={{ paddingLeft: 'var(--space-7)', fontWeight: 'var(--font-weight-bold)' }}
                    placeholder="100000"
                  />
                </div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', marginTop: '4px', display: 'block' }}>
                  Virtual cash allocated at simulation start.
                </span>
              </div>

              {/* Commission */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Commission Rate (%)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.01"
                    value={commission}
                    onChange={(e) => setCommission(Number(e.target.value))}
                    className="form-input"
                    style={{ paddingRight: 'var(--space-7)', fontWeight: 'var(--font-weight-bold)' }}
                  />
                  <span style={{
                    position: 'absolute',
                    right: 'var(--space-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 'bold',
                    color: 'var(--color-gray-400)',
                  }}>%</span>
                </div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', marginTop: '4px', display: 'block' }}>
                  Percentage fee per trade fill.
                </span>
              </div>

              {/* Slippage */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Slippage Rate (%)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.01"
                    value={slippage}
                    onChange={(e) => setSlippage(Number(e.target.value))}
                    className="form-input"
                    style={{ paddingRight: 'var(--space-7)', fontWeight: 'var(--font-weight-bold)' }}
                  />
                  <span style={{
                    position: 'absolute',
                    right: 'var(--space-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 'bold',
                    color: 'var(--color-gray-400)',
                  }}>%</span>
                </div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', marginTop: '4px', display: 'block' }}>
                  Adverse price execution penalty.
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* ── Right Column: Summary Card & Launch ── */}
        <div style={{
          position: 'sticky',
          top: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
        }}>
          
          {/* Summary Card */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div className="card-header" style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: '1.1rem' }}>📋</span>
                <h3 className="card-title" style={{ margin: 0 }}>Simulation Summary</h3>
              </div>
            </div>

            {/* Spec breakdown rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 'var(--space-2) 0',
                borderBottom: '1px solid var(--color-gray-100)',
                fontSize: 'var(--font-size-sm)',
              }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Strategy</span>
                <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-gray-900)', textAlign: 'right' }}>
                  {selectedStrategy?.name || '—'}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 'var(--space-2) 0',
                borderBottom: '1px solid var(--color-gray-100)',
                fontSize: 'var(--font-size-sm)',
              }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Asset & Exchange</span>
                <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary-700)', fontFamily: 'monospace' }}>
                  {symbol} ({selectedAsset?.exchange || 'NASDAQ'})
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 'var(--space-2) 0',
                borderBottom: '1px solid var(--color-gray-100)',
                fontSize: 'var(--font-size-sm)',
              }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Time Horizon</span>
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-gray-800)' }}>
                  ~{diffDays} days
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 'var(--space-2) 0',
                borderBottom: '1px solid var(--color-gray-100)',
                fontSize: 'var(--font-size-sm)',
              }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Starting Capital</span>
                <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-gray-900)' }}>
                  ${capital.toLocaleString()}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 'var(--space-2) 0',
                fontSize: 'var(--font-size-sm)',
              }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Cost Model</span>
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-gray-700)', fontSize: 'var(--font-size-xs)' }}>
                  {commission}% comm / {slippage}% slip
                </span>
              </div>
            </div>

            {/* Launch Button */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRun}
              disabled={!strategyId || !symbol || runMutation.isPending}
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-5)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-bold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
              }}
            >
              {runMutation.isPending ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                  Simulating Market...
                </>
              ) : (
                <>🚀 Run Simulation</>
              )}
            </button>
          </div>

          {/* Engine Highlights Card */}
          <div style={{
            background: 'var(--color-gray-50)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-5)',
          }}>
            <div style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-gray-600)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--space-3)',
            }}>
              📊 Computed Quant Metrics
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-600)' }}>
              <div>✓ Sharpe Ratio</div>
              <div>✓ Max Drawdown</div>
              <div>✓ Win Rate %</div>
              <div>✓ CAGR Return</div>
              <div>✓ Profit Factor</div>
              <div>✓ Trade Execution Log</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
