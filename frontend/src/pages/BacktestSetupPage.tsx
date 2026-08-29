import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { AssetSelector } from '../components/market/AssetSelector';
import { DateRangePicker } from '../components/market/DateRangePicker';
import { marketService } from '../services/market.service';
import { strategiesService } from '../services/strategies.service';
import { backtestsService, RunBacktestDTO } from '../services/backtests.service';

export function BacktestSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateStrategyId = location.state?.strategyId || '';

  const [strategyId, setStrategyId] = useState(stateStrategyId);
  const [symbol, setSymbol] = useState('');
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

  const runMutation = useMutation({
    mutationFn: (payload: RunBacktestDTO) => backtestsService.runBacktest(payload),
    onSuccess: (data) => {
      // Redirect to the backtest results page once we build it
      // For now, redirect to the backtest list page
      navigate(`/backtests`);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Run Backtest</h1>
        <p className="text-gray-500">Configure parameters to test your strategy on historical data.</p>
      </div>

      <Card>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Strategy
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  value={strategyId}
                  onChange={(e) => setStrategyId(e.target.value)}
                  disabled={isLoadingStrategies}
                >
                  <option value="">Select a strategy...</option>
                  {strategies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.status === 'DRAFT' ? '(Draft)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset
                </label>
                <AssetSelector
                  assets={assets}
                  selectedSymbol={symbol}
                  onSelect={setSymbol}
                  isLoading={isLoadingAssets}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <DateRangePicker
                  from={from}
                  to={to}
                  onFromChange={setFrom}
                  onToChange={setTo}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <Input
                label="Initial Capital ($)"
                type="number"
                min="100"
                step="100"
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
              />

              <Input
                label="Commission Rate (%)"
                type="number"
                min="0"
                max="5"
                step="0.01"
                value={commission}
                onChange={(e) => setCommission(Number(e.target.value))}
                helperText="Percentage fee per trade execution"
              />

              <Input
                label="Slippage Rate (%)"
                type="number"
                min="0"
                max="5"
                step="0.01"
                value={slippage}
                onChange={(e) => setSlippage(Number(e.target.value))}
                helperText="Expected adverse price movement on fill"
              />
            </div>
          </div>

          {runMutation.isError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
              {runMutation.error instanceof Error ? runMutation.error.message : 'Failed to run backtest'}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button
              onClick={handleRun}
              disabled={!strategyId || !symbol || runMutation.isPending}
              isLoading={runMutation.isPending}
            >
              Run Simulation
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
