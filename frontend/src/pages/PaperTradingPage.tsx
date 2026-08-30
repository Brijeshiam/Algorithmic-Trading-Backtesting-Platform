import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { paperService, PaperAccount, PaperOrder, Position } from '../services/paper.service';
import { marketService } from '../services/market.service';
import { strategiesService, Strategy } from '../services/strategies.service';
import { LoadingSpinner } from '../components/LoadingSpinner';

/* ─── Helpers ───────────────────────────────── */
const fmt$ = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtPct = (n: number) =>
  `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

/* ─── Account Stat Tile ─────────────────────── */
function AccountTile({
  label, value, sub, icon, valueColor = 'var(--color-gray-900)',
  bg = 'var(--color-white)', border = 'var(--color-gray-200)',
}: {
  label: string; value: string; sub?: string; icon: string;
  valueColor?: string; bg?: string; border?: string;
}) {
  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-5)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <span style={{
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-gray-500)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {label}
        </span>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      </div>
      <div style={{
        fontSize: 'var(--font-size-2xl)',
        fontWeight: 'var(--font-weight-extrabold)',
        color: valueColor,
        lineHeight: 1.1,
        marginBottom: sub ? 'var(--space-1)' : 0,
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)' }}>{sub}</div>
      )}
    </div>
  );
}

/* ─── No Account Prompt ─────────────────────── */
function NoAccountView({ onInit, isPending }: { onInit: () => void; isPending: boolean }) {
  return (
    <div className="animate-fadeIn" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Paper Trading</h1>
        <p className="page-subtitle">Practice strategies risk-free with a $100,000 virtual portfolio.</p>
      </div>

      <div className="card" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-20)',
        textAlign: 'center',
        borderStyle: 'dashed',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-5)', lineHeight: 1 }}>🏦</div>
        <h3 style={{
          fontSize: 'var(--font-size-2xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-gray-900)',
          marginBottom: 'var(--space-3)',
        }}>
          No Virtual Account Found
        </h3>
        <p style={{
          color: 'var(--color-gray-400)',
          fontSize: 'var(--font-size-base)',
          maxWidth: '400px',
          lineHeight: 'var(--line-height-relaxed)',
          marginBottom: 'var(--space-8)',
        }}>
          Initialise your paper trading account and start placing simulated trades to test your strategies without any real risk.
        </p>

        <div style={{
          display: 'flex',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 'var(--space-8)',
        }}>
          {[
            { icon: '💵', label: '$100,000 Starting Cash' },
            { icon: '📈', label: 'Simulated Order Execution' },
            { icon: '🛡️', label: 'Zero Financial Risk' },
            { icon: '🧩', label: 'Test Your Created Strategies' },
          ].map(f => (
            <div key={f.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              background: 'var(--color-gray-50)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-gray-700)',
              fontWeight: 'var(--font-weight-medium)',
              border: '1px solid var(--color-gray-200)',
            }}>
              <span>{f.icon}</span> {f.label}
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary"
          style={{ minWidth: '220px', fontSize: 'var(--font-size-base)' }}
          onClick={onInit}
          disabled={isPending}
        >
          {isPending ? (
            <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> Initialising...</>
          ) : '🚀 Initialise with $100,000'}
        </button>
      </div>
    </div>
  );
}

/* ─── Manual Trade Panel with Strategy Link ─── */
function ManualTradePanel({ 
  accountId,
  prefillStrategy,
  prefillSymbol,
  prefillSide = 'BUY',
  prefillQuantity,
}: { 
  accountId: string;
  prefillStrategy?: Strategy | null;
  prefillSymbol?: string;
  prefillSide?: 'BUY' | 'SELL';
  prefillQuantity?: string;
}) {
  const queryClient = useQueryClient();
  const [selectedStrategyId, setSelectedStrategyId] = useState(prefillStrategy?.id || '');
  const [symbol, setSymbol] = useState(prefillSymbol || 'AAPL');
  const [side, setSide] = useState<'BUY' | 'SELL'>(prefillSide);
  const [quantity, setQuantity] = useState(prefillQuantity || '50');
  const [price, setPrice] = useState('150.00');

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: marketService.getAssets,
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => strategiesService.getStrategies(),
  });

  // When asset changes, auto-fill current real market price
  useEffect(() => {
    if (symbol && assets.length > 0) {
      const asset = assets.find((a: any) => a.symbol === symbol);
      if (asset?.latest_price) {
        setPrice(Number(asset.latest_price).toFixed(2));
      }
    }
  }, [symbol, assets]);

  // Update when prefill values change
  useEffect(() => {
    if (prefillStrategy) setSelectedStrategyId(prefillStrategy.id);
  }, [prefillStrategy]);

  useEffect(() => {
    if (prefillSymbol) setSymbol(prefillSymbol);
  }, [prefillSymbol]);

  useEffect(() => {
    if (prefillSide) setSide(prefillSide);
  }, [prefillSide]);

  useEffect(() => {
    if (prefillQuantity) setQuantity(prefillQuantity);
  }, [prefillQuantity]);

  const selectedStrategy = strategies.find(s => s.id === selectedStrategyId);

  const orderMutation = useMutation({
    mutationFn: async () => {
      const targetPrice = price ? Number(price) : 100;
      return paperService.placeOrder(symbol, side, Number(quantity), targetPrice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paper-account'] });
      queryClient.invalidateQueries({ queryKey: ['paper-orders'] });
    },
  });

  const canSubmit = !!symbol && !!quantity && Number(quantity) > 0;
  const estimatedValue = quantity && price
    ? Number(quantity) * Number(price)
    : null;

  return (
    <div className="card" style={{ padding: 'var(--space-6)' }}>
      <div className="card-header" style={{ marginBottom: 'var(--space-5)' }}>
        <div>
          <h3 className="card-title">Execute Paper Order</h3>
          <p className="card-subtitle">Execute simulated market orders linked to your strategies.</p>
        </div>
        <span className="badge badge-neutral" style={{
          background: 'var(--color-success-50)',
          color: 'var(--color-success-700)',
          border: '1px solid var(--color-success-100)',
          fontSize: 'var(--font-size-xs)',
        }}>
          🟢 Simulated
        </span>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (canSubmit) orderMutation.mutate(); }}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

        {/* ── Strategy Model Selector ── */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label className="form-label">
              Strategy Model
            </label>
            <Link to="/strategies/new" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-600)', textDecoration: 'none', fontWeight: 600 }}>
              + Build Strategy
            </Link>
          </div>
          <select
            className="form-input"
            value={selectedStrategyId}
            onChange={e => {
              setSelectedStrategyId(e.target.value);
            }}
          >
            <option value="">— Optional: Link to a Strategy —</option>
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.status === 'DRAFT' ? '• (Draft)' : '• (Active)'}
              </option>
            ))}
          </select>
        </div>

        {/* Strategy Context Banner */}
        {selectedStrategy && (
          <div style={{
            background: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-100)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-3) var(--space-4)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-primary-800)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}>
            <span>🧩</span>
            <div>
              Executing simulated trade for <strong>{selectedStrategy.name}</strong>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-primary-600)', marginTop: '2px' }}>
                {selectedStrategy.description || 'Custom multi-indicator trading strategy'}
              </div>
            </div>
          </div>
        )}

        {/* BUY / SELL toggle */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-2)',
          background: 'var(--color-gray-100)',
          padding: '4px',
          borderRadius: 'var(--radius-lg)',
        }}>
          {(['BUY', 'SELL'] as const).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setSide(s)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: 'var(--font-size-sm)',
                transition: 'all var(--transition-base)',
                background: side === s
                  ? (s === 'BUY' ? 'var(--color-success-500)' : 'var(--color-danger-500)')
                  : 'transparent',
                color: side === s ? '#fff' : 'var(--color-gray-500)',
                boxShadow: side === s ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {s === 'BUY' ? '↑ BUY' : '↓ SELL'}
            </button>
          ))}
        </div>

        {/* Asset */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Asset</label>
          <select
            required
            className="form-input"
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
          >
            <option value="">— Select asset —</option>
            {assets.map((a: any) => (
              <option key={a.symbol} value={a.symbol}>
                {a.symbol} — {a.name} (Market: ${Number(a.latest_price || 0).toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Quantity (Shares)</label>
          <input
            type="number"
            required
            min="1"
            step="1"
            className="form-input"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="50"
          />
        </div>

        {/* Price (optional) */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label className="form-label">
              Market Price per Share ($)
            </label>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-primary-600)', fontWeight: 600 }}>
              Live Market Rate
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-gray-400)', fontWeight: 'var(--font-weight-semibold)',
            }}>$</span>
            <input
              type="number"
              min="0.01"
              step="any"
              className="form-input"
              style={{ paddingLeft: 'var(--space-7)' }}
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="150.00"
            />
          </div>
        </div>

        {/* Order summary */}
        {canSubmit && estimatedValue && (
          <div style={{
            background: side === 'BUY' ? 'var(--color-success-50)' : 'var(--color-danger-50)',
            border: `1px solid ${side === 'BUY' ? 'var(--color-success-100)' : 'var(--color-danger-100)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-3) var(--space-4)',
            fontSize: 'var(--font-size-xs)',
            color: side === 'BUY' ? 'var(--color-success-700)' : 'var(--color-danger-700)',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <span>Estimated {side === 'BUY' ? 'Total Cost' : 'Proceeds'}</span>
            <strong>{fmt$(estimatedValue)}</strong>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{
            background: side === 'BUY'
              ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            boxShadow: side === 'BUY'
              ? '0 4px 15px rgba(5,150,105,0.3)'
              : '0 4px 15px rgba(220,38,38,0.3)',
            marginTop: 'var(--space-2)',
          }}
          disabled={!canSubmit || orderMutation.isPending}
        >
          {orderMutation.isPending ? (
            <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> Placing...</>
          ) : `${side === 'BUY' ? '↑ Execute Buy Order' : '↓ Execute Sell Order'} (${quantity || '0'} shares)`}
        </button>

        {orderMutation.isError && (
          <div style={{
            background: 'var(--color-danger-50)',
            color: 'var(--color-danger-700)',
            borderLeft: '3px solid var(--color-danger-500)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-xs)',
          }}>
            {/* @ts-ignore */}
            ❌ {orderMutation.error?.response?.data?.error || orderMutation.error?.message}
          </div>
        )}

        {orderMutation.isSuccess && (
          <div style={{
            background: 'var(--color-success-50)',
            color: 'var(--color-success-700)',
            borderLeft: '3px solid var(--color-success-500)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-xs)',
          }}>
            ✅ Order filled successfully into paper account!
          </div>
        )}
      </form>
    </div>
  );
}

/* ─── Strategies & Signals List Tab ─────────── */
function StrategySignalsTab({ 
  onSelectStrategy 
}: { 
  onSelectStrategy: (strat: Strategy) => void 
}) {
  const { data: strategies = [], isLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => strategiesService.getStrategies(),
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (strategies.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-16)',
        textAlign: 'center',
        color: 'var(--color-gray-400)',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>🧩</div>
        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>No strategies created yet</div>
        <div style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-1)', marginBottom: 'var(--space-4)' }}>
          Build a strategy to forward-trade it in your paper account.
        </div>
        <Link to="/strategies/new" className="btn btn-primary btn-sm">
          + Create New Strategy
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {strategies.map((strat) => (
        <div key={strat.id} style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-200)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4) var(--space-5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
          transition: 'all var(--transition-fast)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
              <span style={{ fontSize: '1rem' }}>🧩</span>
              <strong style={{ color: 'var(--color-gray-900)', fontSize: 'var(--font-size-sm)' }}>
                {strat.name}
              </strong>
              <span className={`badge badge-${strat.status === 'DRAFT' ? 'neutral' : 'success'}`} style={{ fontSize: '0.65rem' }}>
                {strat.status}
              </span>
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', margin: 0 }}>
              {strat.description || 'Custom multi-indicator strategy rules'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Link to={`/strategies/${strat.id}`} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
              View Spec
            </Link>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onSelectStrategy(strat)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              ⚡ Trade in Paper Account
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Positions Table with Live PnL and Quick Sell ─── */
function PositionsTable({ 
  positions, 
  assets,
  onQuickSell,
}: { 
  positions: Position[];
  assets: any[];
  onQuickSell: (symbol: string, quantity: number) => void;
}) {
  if (positions.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-16)',
        textAlign: 'center',
        color: 'var(--color-gray-400)',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>📭</div>
        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>No open positions</div>
        <div style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-1)' }}>Place a BUY order on the right to open a position.</div>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th style={{ textAlign: 'right' }}>Shares</th>
            <th style={{ textAlign: 'right' }}>Avg Entry</th>
            <th style={{ textAlign: 'right' }}>Market Price</th>
            <th style={{ textAlign: 'right' }}>Market Value</th>
            <th style={{ textAlign: 'right' }}>Unrealized PnL</th>
            <th style={{ textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {positions.map(p => {
            const asset = assets.find((a: any) => a.symbol === p.symbol);
            const marketPrice = asset?.latest_price ? Number(asset.latest_price) : Number(p.average_entry);
            const marketValue = Number(p.quantity) * marketPrice;
            const costBasis = Number(p.quantity) * Number(p.average_entry);
            const pnl = marketValue - costBasis;
            const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
            const isProfit = pnl >= 0;

            return (
              <tr key={p.symbol}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{
                      width: '32px', height: '32px',
                      background: 'var(--color-primary-50)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'var(--font-weight-bold)',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-primary-700)',
                      fontFamily: 'monospace',
                      flexShrink: 0,
                    }}>
                      {p.symbol.substring(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-900)', fontFamily: 'monospace' }}>
                        {p.symbol}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--color-gray-400)' }}>
                        {asset?.name || 'Equity'}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-800)' }}>
                  {Number(p.quantity).toLocaleString()}
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--color-gray-600)' }}>
                  {fmt$(p.average_entry)}
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-gray-900)' }}>
                  {fmt$(marketPrice)}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary-700)', fontFamily: 'monospace' }}>
                  {fmt$(marketValue)}
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                  <div style={{
                    color: isProfit ? 'var(--color-success-600)' : 'var(--color-danger-600)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}>
                    {isProfit ? '+' : ''}{fmt$(pnl)}
                  </div>
                  <div style={{
                    fontSize: '0.68rem',
                    color: isProfit ? 'var(--color-success-600)' : 'var(--color-danger-600)',
                  }}>
                    {fmtPct(pnlPct)}
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => onQuickSell(p.symbol, Number(p.quantity))}
                    style={{
                      padding: '2px 10px',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-danger-600)',
                      border: '1px solid var(--color-danger-200)',
                      background: 'var(--color-danger-50)',
                    }}
                  >
                    Sell / Close
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Orders Table ──────────────────────────── */
function OrdersTable({ orders, isLoading }: { orders: PaperOrder[]; isLoading: boolean }) {
  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}><LoadingSpinner /></div>;
  }

  if (orders.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-16)',
        textAlign: 'center',
        color: 'var(--color-gray-400)',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>📋</div>
        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>No orders yet</div>
        <div style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-1)' }}>Orders you place will appear here.</div>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Symbol</th>
            <th>Side</th>
            <th style={{ textAlign: 'right' }}>Qty</th>
            <th style={{ textAlign: 'right' }}>Price</th>
            <th style={{ textAlign: 'right' }}>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', whiteSpace: 'nowrap' }}>
                {new Date(o.created_at).toLocaleString()}
              </td>
              <td>
                <span style={{ fontFamily: 'monospace', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-900)' }}>
                  {o.symbol}
                </span>
              </td>
              <td>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-bold)',
                  background: o.side === 'BUY' ? 'var(--color-success-50)' : 'var(--color-danger-50)',
                  color: o.side === 'BUY' ? 'var(--color-success-700)' : 'var(--color-danger-700)',
                  border: `1px solid ${o.side === 'BUY' ? 'var(--color-success-100)' : 'var(--color-danger-100)'}`,
                }}>
                  {o.side === 'BUY' ? '↑' : '↓'} {o.side}
                </span>
              </td>
              <td style={{ textAlign: 'right', fontWeight: 'var(--font-weight-medium)' }}>
                {Number(o.quantity).toLocaleString()}
              </td>
              <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--color-gray-700)' }}>
                {fmt$(Number(o.price))}
              </td>
              <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-800)' }}>
                {fmt$(Number(o.quantity) * Number(o.price))}
              </td>
              <td>
                <span className="badge badge-success" style={{ fontSize: 'var(--font-size-xs)' }}>
                  {o.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────── */
export function PaperTradingPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'strategies'>('positions');
  const [activeStrategy, setActiveStrategy] = useState<Strategy | null>(null);
  const [prefillSymbol, setPrefillSymbol] = useState<string>('AAPL');
  const [prefillSide, setPrefillSide] = useState<'BUY' | 'SELL'>('BUY');
  const [prefillQty, setPrefillQty] = useState<string>('50');

  const { data: account, isLoading: isLoadingAccount } = useQuery({
    queryKey: ['paper-account'],
    queryFn: paperService.getAccount,
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['paper-orders'],
    queryFn: paperService.getOrders,
    enabled: !!account,
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: marketService.getAssets,
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => strategiesService.getStrategies(),
  });

  const initMutation = useMutation({
    mutationFn: () => paperService.initAccount('My Paper Account', 100000),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['paper-account'] }),
  });

  const resetMutation = useMutation({
    mutationFn: () => paperService.resetAccount(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paper-account'] });
      queryClient.invalidateQueries({ queryKey: ['paper-orders'] });
    },
  });

  if (isLoadingAccount) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <span>Loading account...</span>
      </div>
    );
  }

  if (!account) {
    return <NoAccountView onInit={() => initMutation.mutate()} isPending={initMutation.isPending} />;
  }

  // Calculate live market position value based on current prices
  const totalPositionMarketValue = account.positions.reduce((sum, p) => {
    const asset = assets.find((a: any) => a.symbol === p.symbol);
    const mPrice = asset?.latest_price ? Number(asset.latest_price) : Number(p.average_entry);
    return sum + Number(p.quantity) * mPrice;
  }, 0);

  const totalEquity = account.cash + totalPositionMarketValue;
  const totalReturn = ((totalEquity - account.initial_capital) / account.initial_capital) * 100;
  const investedPct = totalEquity > 0 ? (totalPositionMarketValue / totalEquity) * 100 : 0;

  const tabs = [
    { key: 'positions' as const, label: '📂 Open Positions', count: account.positions.length },
    { key: 'orders' as const, label: '📋 Order History', count: orders.length },
    { key: 'strategies' as const, label: '🧩 My Strategies', count: strategies.length },
  ];

  const handleSelectStrategyToTrade = (strat: Strategy) => {
    setActiveStrategy(strat);
    setActiveTab('positions');
  };

  const handleQuickSell = (sym: string, qty: number) => {
    setPrefillSymbol(sym);
    setPrefillSide('SELL');
    setPrefillQty(qty.toString());
  };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            background: 'var(--color-success-50)',
            color: 'var(--color-success-700)',
            border: '1px solid var(--color-success-100)',
            padding: '3px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.07em',
            marginBottom: 'var(--space-3)',
          }}>
            🟢 Simulated Environment
          </div>
          <h1 className="page-title">Paper Trading</h1>
          <p className="page-subtitle">{account.name} · Practice and forward-test your strategies with zero real risk.</p>
        </div>

        {/* Quick Reset Account Button */}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            if (window.confirm('Reset virtual paper trading account back to $100,000 cash and clear order history?')) {
              resetMutation.mutate();
            }
          }}
          disabled={resetMutation.isPending}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-gray-600)',
            border: '1px solid var(--color-gray-200)',
          }}
        >
          {resetMutation.isPending ? 'Resetting...' : '🔄 Reset Account ($100k)'}
        </button>
      </div>

      {/* ── Stat Tiles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
        <AccountTile
          label="Total Equity"
          value={fmt$(totalEquity)}
          sub="Cash + Live Positions"
          icon="💼"
          valueColor="var(--color-gray-900)"
        />
        <AccountTile
          label="Available Cash"
          value={fmt$(account.cash)}
          sub={`${(100 - investedPct).toFixed(1)}% of equity`}
          icon="💵"
          valueColor="var(--color-primary-700)"
          bg="var(--color-primary-50)"
          border="var(--color-primary-100)"
        />
        <AccountTile
          label="Positions Value"
          value={fmt$(totalPositionMarketValue)}
          sub={`${investedPct.toFixed(1)}% deployed`}
          icon="📦"
          valueColor="var(--color-gray-800)"
        />
        <AccountTile
          label="Simulated Return"
          value={fmtPct(totalReturn)}
          sub={`Initial: ${fmt$(account.initial_capital)}`}
          icon="📈"
          valueColor={totalReturn >= 0 ? 'var(--color-success-600)' : 'var(--color-danger-600)'}
          bg={totalReturn >= 0 ? 'var(--color-success-50)' : 'var(--color-danger-50)'}
          border={totalReturn >= 0 ? 'var(--color-success-100)' : 'var(--color-danger-100)'}
        />
      </div>

      {/* ── Equity Allocation Bar ── */}
      <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Capital Allocation
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-size-xs)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary-500)', display: 'inline-block' }} />
              Positions ({investedPct.toFixed(1)}%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-gray-300)', display: 'inline-block' }} />
              Cash ({(100 - investedPct).toFixed(1)}%)
            </span>
          </div>
        </div>
        <div style={{
          height: '10px',
          background: 'var(--color-gray-200)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${investedPct}%`,
            background: 'linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600))',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(360px, 1fr)',
        gap: 'var(--space-6)',
        alignItems: 'start',
      }}>

        {/* Left Column: Tabbed Views */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          
          {/* Tab bar */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-gray-100)',
            background: 'var(--color-gray-50)',
            padding: 'var(--space-1) var(--space-4) 0',
            gap: 'var(--space-2)',
          }}>
            {tabs.map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  border: 'none',
                  borderBottom: activeTab === t.key ? '2px solid var(--color-primary-600)' : '2px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontWeight: activeTab === t.key ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                  fontSize: 'var(--font-size-sm)',
                  color: activeTab === t.key ? 'var(--color-primary-700)' : 'var(--color-gray-500)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {t.label}
                <span style={{
                  fontSize: 'var(--font-size-xs)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  background: activeTab === t.key ? 'var(--color-primary-100)' : 'var(--color-gray-200)',
                  color: activeTab === t.key ? 'var(--color-primary-700)' : 'var(--color-gray-600)',
                  fontWeight: 'var(--font-weight-semibold)',
                }}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tab body */}
          <div style={{ padding: 'var(--space-5)' }}>
            {activeTab === 'positions' && (
              <PositionsTable 
                positions={account.positions} 
                assets={assets}
                onQuickSell={handleQuickSell}
              />
            )}
            {activeTab === 'orders' && <OrdersTable orders={orders} isLoading={isLoadingOrders} />}
            {activeTab === 'strategies' && <StrategySignalsTab onSelectStrategy={handleSelectStrategyToTrade} />}
          </div>
        </div>

        {/* Right Column: Order Placement Panel */}
        <div style={{ position: 'sticky', top: 'var(--space-6)' }}>
          <ManualTradePanel 
            accountId={account.id} 
            prefillStrategy={activeStrategy}
            prefillSymbol={prefillSymbol}
            prefillSide={prefillSide}
            prefillQuantity={prefillQty}
          />
        </div>

      </div>

    </div>
  );
}
