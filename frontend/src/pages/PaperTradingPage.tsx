import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paperService, PaperAccount, PaperOrder, Position } from '../services/paper.service';
import { marketService } from '../services/market.service';
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
            { icon: '💰', label: '$100,000 Starting Capital' },
            { icon: '🛡️', label: 'Zero Real Risk' },
            { icon: '📊', label: 'Full Order History' },
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

/* ─── Manual Trade Panel ────────────────────── */
function ManualTradePanel({ accountId }: { accountId: string }) {
  const queryClient = useQueryClient();
  const [symbol, setSymbol] = useState('');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: marketService.getAssets,
  });

  const orderMutation = useMutation({
    mutationFn: async () => {
      const mockPrice = price ? Number(price) : 100 + Math.random() * 100;
      return paperService.placeOrder(symbol, side, Number(quantity), mockPrice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paper-account'] });
      queryClient.invalidateQueries({ queryKey: ['paper-orders'] });
      setQuantity('');
      setPrice('');
    },
  });

  const canSubmit = !!symbol && !!quantity && Number(quantity) > 0;
  const estimatedValue = quantity && price
    ? Number(quantity) * Number(price)
    : null;

  return (
    <div className="card" style={{ padding: 'var(--space-6)' }}>
      <div className="card-header" style={{ marginBottom: 'var(--space-5)' }}>
        <h3 className="card-title">Place Order</h3>
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
        <div className="form-group">
          <label className="form-label">Asset</label>
          <select
            required
            className="form-input"
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
          >
            <option value="">— Select asset —</option>
            {assets.map((a: any) => (
              <option key={a.symbol} value={a.symbol}>{a.symbol} — {a.name}</option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div className="form-group">
          <label className="form-label">Quantity (Shares)</label>
          <input
            type="number"
            required
            min="0.0001"
            step="any"
            className="form-input"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="0"
          />
        </div>

        {/* Price (optional) */}
        <div className="form-group">
          <label className="form-label">
            Price per Share
            <span style={{ color: 'var(--color-gray-400)', fontWeight: 'var(--font-weight-normal)', marginLeft: 'var(--space-2)' }}>
              (optional — uses mock if blank)
            </span>
          </label>
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
              placeholder="0.00"
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
            <span>Estimated {side === 'BUY' ? 'Cost' : 'Proceeds'}</span>
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
          }}
          disabled={!canSubmit || orderMutation.isPending}
        >
          {orderMutation.isPending ? (
            <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> Placing...</>
          ) : `${side === 'BUY' ? '↑ Buy' : '↓ Sell'} ${quantity || '—'} ${symbol || 'shares'}`}
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
            ✅ Order filled successfully!
          </div>
        )}
      </form>
    </div>
  );
}

/* ─── Positions Table ───────────────────────── */
function PositionsTable({ positions }: { positions: Position[] }) {
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
        <div style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-1)' }}>Place a BUY order to open a position.</div>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th style={{ textAlign: 'right' }}>Quantity</th>
            <th style={{ textAlign: 'right' }}>Avg Entry</th>
            <th style={{ textAlign: 'right' }}>Est. Value</th>
          </tr>
        </thead>
        <tbody>
          {positions.map(p => (
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
                  </div>
                </div>
              </td>
              <td style={{ textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-800)' }}>
                {Number(p.quantity).toLocaleString()}
              </td>
              <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--color-gray-700)' }}>
                {fmt$(p.average_entry)}
              </td>
              <td style={{ textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary-700)', fontFamily: 'monospace' }}>
                {fmt$(p.quantity * p.average_entry)}
              </td>
            </tr>
          ))}
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
  const [activeTab, setActiveTab] = useState<'positions' | 'orders'>('positions');

  const { data: account, isLoading: isLoadingAccount } = useQuery({
    queryKey: ['paper-account'],
    queryFn: paperService.getAccount,
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['paper-orders'],
    queryFn: paperService.getOrders,
    enabled: !!account,
  });

  const initMutation = useMutation({
    mutationFn: () => paperService.initAccount('My Paper Account', 100000),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['paper-account'] }),
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

  const totalPositionValue = account.positions.reduce(
    (sum, p) => sum + Number(p.quantity) * Number(p.average_entry), 0
  );
  const totalEquity = account.cash + totalPositionValue;
  const totalReturn = ((totalEquity - account.initial_capital) / account.initial_capital) * 100;
  const investedPct = totalEquity > 0 ? (totalPositionValue / totalEquity) * 100 : 0;

  const tabs = [
    { key: 'positions' as const, label: '📂 Positions', count: account.positions.length },
    { key: 'orders' as const, label: '📋 Order History', count: orders.length },
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
          <p className="page-subtitle">{account.name} · Practice with virtual capital, zero real risk.</p>
        </div>
      </div>

      {/* ── Stat Tiles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
        <AccountTile
          label="Total Equity"
          value={fmt$(totalEquity)}
          sub="Cash + Positions"
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
          value={fmt$(totalPositionValue)}
          sub={`${investedPct.toFixed(1)}% deployed`}
          icon="📦"
          valueColor="var(--color-gray-800)"
        />
        <AccountTile
          label="Total Return"
          value={fmtPct(totalReturn)}
          sub={`Initial: ${fmt$(account.initial_capital)}`}
          icon={totalReturn >= 0 ? '📈' : '📉'}
          valueColor={totalReturn >= 0 ? 'var(--color-success-600)' : 'var(--color-danger-600)'}
          bg={totalReturn >= 0 ? 'var(--color-success-50)' : 'var(--color-danger-50)'}
          border={totalReturn >= 0 ? 'var(--color-success-100)' : 'var(--color-danger-100)'}
        />
      </div>

      {/* ── Equity bar ── */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', marginBottom: 'var(--space-1)' }}>
          <span>Cash ({(100 - investedPct).toFixed(1)}%)</span>
          <span>Invested ({investedPct.toFixed(1)}%)</span>
        </div>
        <div style={{ height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--color-gray-200)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${investedPct}%`,
            background: 'linear-gradient(90deg, var(--color-primary-400), var(--color-primary-600))',
            borderRadius: 'var(--radius-full)',
            transition: 'width var(--transition-smooth)',
          }} />
        </div>
      </div>

      {/* ── Main layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>

        {/* Left: Trade Form */}
        <ManualTradePanel accountId={account.id} />

        {/* Right: Positions / Orders */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {/* Tab bar */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-gray-100)',
            padding: '0 var(--space-6)',
            background: 'var(--color-gray-50)',
          }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: 'var(--space-4) var(--space-3)',
                  marginRight: 'var(--space-4)',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === tab.key ? 'var(--color-primary-600)' : 'transparent'}`,
                  color: activeTab === tab.key ? 'var(--color-primary-700)' : 'var(--color-gray-500)',
                  fontWeight: activeTab === tab.key ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                  fontSize: 'var(--font-size-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    background: activeTab === tab.key ? 'var(--color-primary-100)' : 'var(--color-gray-200)',
                    color: activeTab === tab.key ? 'var(--color-primary-700)' : 'var(--color-gray-500)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.65rem',
                    fontWeight: 'var(--font-weight-bold)',
                    padding: '1px 7px',
                    lineHeight: '1.4',
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'positions' && <PositionsTable positions={account.positions} />}
          {activeTab === 'orders' && <OrdersTable orders={orders} isLoading={isLoadingOrders} />}
        </div>
      </div>
    </div>
  );
}
