import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backtestsService } from '../services/backtests.service';
import { simulationsService } from '../services/simulations.service';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { HistogramChart } from '../components/monte-carlo/HistogramChart';

export function MonteCarloPage() {
  const queryClient = useQueryClient();
  const [selectedBacktestId, setSelectedBacktestId] = useState<string>('');
  
  const [simCount, setSimCount] = useState<number>(1000);

  // 1. Fetch available backtests
  const { data: allBacktests = [], isLoading: isLoadingBacktests } = useQuery({
    queryKey: ['backtests'],
    queryFn: backtestsService.listBacktests,
  });

  const completedBacktests = allBacktests.filter(bt => bt.status === 'COMPLETED');

  // 2. Fetch existing Monte Carlo result if selected
  const { data: mcResult, isLoading: isLoadingMc } = useQuery({
    queryKey: ['monte-carlo', selectedBacktestId],
    queryFn: () => simulationsService.getMonteCarlo(selectedBacktestId),
    enabled: !!selectedBacktestId,
  });

  // 3. Mutation to run Monte Carlo
  const runMutation = useMutation({
    mutationFn: (sims: number) => simulationsService.runMonteCarlo(selectedBacktestId, sims),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monte-carlo', selectedBacktestId] });
    }
  });

  const handleRun = () => {
    if (!selectedBacktestId) return;
    runMutation.mutate(simCount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monte Carlo Analysis</h1>
          <p className="text-gray-500">Test strategy robustness by resampling historical trades.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Selection */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Select Strategy</h3>
            
            {isLoadingBacktests ? (
              <div className="flex justify-center py-4"><LoadingSpinner /></div>
            ) : completedBacktests.length === 0 ? (
              <div className="text-sm text-gray-500">No completed backtests available.</div>
            ) : (
              <select 
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={selectedBacktestId}
                onChange={e => setSelectedBacktestId(e.target.value)}
              >
                <option value="">-- Choose a backtest --</option>
                {completedBacktests.map(bt => (
                  <option key={bt.id} value={bt.id}>
                    {bt.strategy_name} ({bt.symbol})
                  </option>
                ))}
              </select>
            )}

            {selectedBacktestId && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Simulations
                  </label>
                  <select 
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    value={simCount}
                    onChange={e => setSimCount(Number(e.target.value))}
                  >
                    <option value={100}>100 Simulations</option>
                    <option value={1000}>1,000 Simulations (Recommended)</option>
                    <option value={5000}>5,000 Simulations</option>
                    <option value={10000}>10,000 Simulations</option>
                  </select>
                </div>
                
                <Button 
                  onClick={handleRun} 
                  isLoading={runMutation.isPending}
                  className="w-full"
                >
                  Run {simCount.toLocaleString()} Simulations
                </Button>
                
                {runMutation.isError && (
                  <p className="text-red-500 text-xs mt-2">
                    {/* @ts-ignore */}
                    Error: {runMutation.error?.response?.data?.error || runMutation.error?.message}
                  </p>
                )}
              </div>
            )}
          </Card>
          
          <Card className="bg-blue-50 border-blue-100">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">How it works</h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              Monte Carlo analysis takes the closed trades from your backtest and randomly samples them (with replacement) to create 1,000 alternative reality equity curves. This helps identify the true probability of profit and expected variations in return and drawdown.
            </p>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {!selectedBacktestId ? (
            <Card className="flex flex-col items-center justify-center py-24 bg-gray-50 border-dashed">
              <div className="text-4xl mb-4">🎲</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No strategy selected</h3>
              <p className="text-gray-500 max-w-sm text-center">
                Select a completed backtest from the sidebar to view or run Monte Carlo analysis.
              </p>
            </Card>
          ) : isLoadingMc ? (
            <Card className="flex flex-col items-center justify-center py-24">
              <LoadingSpinner />
              <p className="mt-4 text-gray-500 animate-pulse">Loading results...</p>
            </Card>
          ) : !mcResult ? (
            <Card className="flex flex-col items-center justify-center py-24 bg-gray-50 border-dashed">
              <p className="text-gray-500">No Monte Carlo results found for this backtest.</p>
              <p className="text-gray-500 text-sm mt-1">Click "Run Simulations" to generate data.</p>
            </Card>
          ) : (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <MetricCard label="Prob. of Profit" value={`${Number(mcResult.probability_of_profit).toFixed(1)}%`} highlight={true} />
                <MetricCard label="Median Return" value={`${Number(mcResult.median_return).toFixed(2)}%`} />
                <MetricCard label="Bottom 5% (P5)" value={`${Number(mcResult.p5_return).toFixed(2)}%`} isNegative={Number(mcResult.p5_return) < 0} />
                <MetricCard label="Bottom 25% (P25)" value={`${Number(mcResult.p25_return).toFixed(2)}%`} isNegative={Number(mcResult.p25_return) < 0} />
                <MetricCard label="Top 25% (P75)" value={`${Number(mcResult.p75_return).toFixed(2)}%`} />
                <MetricCard label="Top 5% (P95)" value={`${Number(mcResult.p95_return).toFixed(2)}%`} />
              </div>

              {/* Histogram */}
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-gray-900">Distribution of Final Returns</h3>
                  <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                    n = {mcResult.simulation_count.toLocaleString()}
                  </span>
                </div>
                <HistogramChart histogram={mcResult.results_json?.histogram || []} />
                <p className="text-center text-xs text-gray-500 mt-4">
                  Final Portfolio Return (%)
                </p>
              </Card>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

function MetricCard({ label, value, highlight, isNegative }: { label: string, value: string, highlight?: boolean, isNegative?: boolean }) {
  return (
    <Card className={`p-4 flex flex-col justify-center items-center text-center ${highlight ? 'bg-blue-50 border-blue-200 shadow-sm' : ''}`}>
      <span className="text-xs font-medium text-gray-500 mb-1">{label}</span>
      <span className={`text-lg font-bold ${
        highlight ? 'text-blue-700' : 
        isNegative ? 'text-red-600' : 
        'text-gray-900'
      }`}>
        {value}
      </span>
    </Card>
  );
}
