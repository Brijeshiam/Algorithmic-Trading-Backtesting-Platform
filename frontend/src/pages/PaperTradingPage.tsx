import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paperService } from '../services/paper.service';
import { marketService } from '../services/market.service';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function PaperTradingPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders'>('dashboard');

  // Fetch Paper Account
  const { data: account, isLoading: isLoadingAccount } = useQuery({
    queryKey: ['paper-account'],
    queryFn: paperService.getAccount,
  });

  // Fetch Orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['paper-orders'],
    queryFn: paperService.getOrders,
    enabled: !!account,
  });

  // Initialize Account Mutation
  const initMutation = useMutation({
    mutationFn: () => paperService.initAccount('My Paper Account', 100000),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paper-account'] });
    }
  });

  if (isLoadingAccount) {
    return <div className="py-24 flex justify-center"><LoadingSpinner /></div>;
  }

  if (!account) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paper Trading</h1>
          <p className="text-gray-500">Practice your strategies with a $100,000 virtual account.</p>
        </div>
        <Card className="flex flex-col items-center justify-center py-24 bg-gray-50 border-dashed">
          <div className="text-5xl mb-4">🏦</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Paper Account Found</h3>
          <p className="text-gray-500 mb-6 max-w-md text-center">
            Initialize your virtual paper trading account to start placing simulated trades and tracking your portfolio.
          </p>
          <Button onClick={() => initMutation.mutate()} isLoading={initMutation.isPending}>
            Initialize with $100,000
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate total equity
  const totalPositionValue = account.positions.reduce((sum, p) => sum + (p.quantity * p.average_entry), 0);
  const totalEquity = account.cash + totalPositionValue;
  const totalReturn = ((totalEquity - account.initial_capital) / account.initial_capital) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paper Trading</h1>
          <p className="text-gray-500">{account.name} &bull; Simulated Environment</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Total Equity" value={`$${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <MetricCard label="Available Cash" value={`$${account.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <MetricCard 
          label="Total Return" 
          value={`${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}%`} 
          isPositive={totalReturn >= 0}
          isNegative={totalReturn < 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Manual Trade */}
        <div className="lg:col-span-1">
          <ManualTradeCard accountId={account.id} />
        </div>

        {/* Right Column: Dashboard & Orders */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-6">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'dashboard'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Positions
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'orders'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Order History
                </button>
              </nav>
            </div>

            {activeTab === 'dashboard' && (
              <div>
                {account.positions.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 text-sm">No open positions.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700">
                      <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                          <th className="px-4 py-3">Symbol</th>
                          <th className="px-4 py-3 text-right">Quantity</th>
                          <th className="px-4 py-3 text-right">Avg Entry</th>
                          <th className="px-4 py-3 text-right">Value (Est)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {account.positions.map(p => (
                          <tr key={p.symbol} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono font-medium text-gray-900">{p.symbol}</td>
                            <td className="px-4 py-3 text-right">{p.quantity}</td>
                            <td className="px-4 py-3 text-right">${p.average_entry.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-4 py-3 text-right">${(p.quantity * p.average_entry).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                {isLoadingOrders ? (
                  <div className="py-12 flex justify-center"><LoadingSpinner /></div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 text-sm">No order history.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700">
                      <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                          <th className="px-4 py-3">Time</th>
                          <th className="px-4 py-3">Symbol</th>
                          <th className="px-4 py-3">Side</th>
                          <th className="px-4 py-3 text-right">Quantity</th>
                          <th className="px-4 py-3 text-right">Price</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.map(o => (
                          <tr key={o.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{new Date(o.created_at).toLocaleString()}</td>
                            <td className="px-4 py-3 font-mono font-medium text-gray-900">{o.symbol}</td>
                            <td className={`px-4 py-3 font-semibold ${o.side === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>{o.side}</td>
                            <td className="px-4 py-3 text-right">{Number(o.quantity)}</td>
                            <td className="px-4 py-3 text-right font-mono">${Number(o.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-4 py-3">
                              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, isPositive, isNegative }: { label: string, value: string, isPositive?: boolean, isNegative?: boolean }) {
  return (
    <Card className="p-5 flex flex-col justify-center">
      <span className="text-sm font-medium text-gray-500 mb-1">{label}</span>
      <span className={`text-2xl font-bold ${
        isPositive ? 'text-green-600' : 
        isNegative ? 'text-red-600' : 
        'text-gray-900'
      }`}>
        {value}
      </span>
    </Card>
  );
}

function ManualTradeCard({ accountId }: { accountId: string }) {
  const queryClient = useQueryClient();
  const [symbol, setSymbol] = useState('');
  const [side, setSide] = useState<'BUY'|'SELL'>('BUY');
  const [quantity, setQuantity] = useState('');

  // Fetch available assets
  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: marketService.getAssets,
  });

  const orderMutation = useMutation({
    mutationFn: async () => {
      // For paper trading mock, we need a price. We'll just fetch the latest price randomly or mock it.
      // In a real system we'd get live price. Here we generate a mock price between 100-200.
      const mockPrice = 100 + Math.random() * 100;
      return paperService.placeOrder(symbol, side, Number(quantity), mockPrice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paper-account'] });
      queryClient.invalidateQueries({ queryKey: ['paper-orders'] });
      setQuantity('');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !quantity || Number(quantity) <= 0) return;
    orderMutation.mutate();
  };

  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-4">Manual Trade</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asset</label>
          <select 
            required
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
          >
            <option value="">-- Select Asset --</option>
            {assets.map(a => (
              <option key={a.symbol} value={a.symbol}>{a.symbol} - {a.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`py-2 rounded border font-medium text-sm transition-colors ${
              side === 'BUY' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`py-2 rounded border font-medium text-sm transition-colors ${
              side === 'SELL' 
                ? 'bg-red-50 text-red-700 border-red-200' 
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            SELL
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input 
            type="number" 
            required
            min="0.0001"
            step="0.0001"
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={!symbol || !quantity || Number(quantity) <= 0}
          isLoading={orderMutation.isPending}
        >
          Place {side} Order
        </Button>
        
        {orderMutation.isError && (
          <p className="text-red-500 text-xs text-center mt-2">
            {/* @ts-ignore */}
            {orderMutation.error?.response?.data?.error || orderMutation.error?.message}
          </p>
        )}
        {orderMutation.isSuccess && (
          <p className="text-green-600 text-xs text-center mt-2">
            Order filled successfully!
          </p>
        )}
      </form>
    </Card>
  );
}
