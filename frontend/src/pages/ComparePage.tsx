import React, { useState } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { backtestsService } from '../services/backtests.service';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CompareChart } from '../components/compare/CompareChart';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';

export function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 1. Fetch all backtests for selection
  const { data: allBacktests = [], isLoading: isLoadingList } = useQuery({
    queryKey: ['backtests'],
    queryFn: backtestsService.listBacktests,
  });

  const completedBacktests = allBacktests.filter(bt => bt.status === 'COMPLETED');

  // 2. Fetch full details for selected backtests
  const backtestQueries = useQueries({
    queries: selectedIds.map(id => ({
      queryKey: ['backtest', id],
      queryFn: () => backtestsService.getBacktest(id),
      staleTime: Infinity,
    }))
  });

  const isLoadingDetails = backtestQueries.some(q => q.isLoading);
  const selectedData = backtestQueries.map(q => q.data).filter(Boolean) as any[];

  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 backtests at a time.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const clearSelection = () => setSelectedIds([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compare Strategies</h1>
          <p className="text-gray-500">Select up to 4 backtests to compare their performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Selection */}
        <Card className="lg:col-span-1 h-fit max-h-[calc(100vh-120px)] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Select Backtests</h3>
            {selectedIds.length > 0 && (
              <button onClick={clearSelection} className="text-xs text-blue-600 hover:underline">
                Clear all
              </button>
            )}
          </div>

          {isLoadingList ? (
            <div className="py-8 flex justify-center"><LoadingSpinner /></div>
          ) : completedBacktests.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              No completed backtests available.
            </div>
          ) : (
            <div className="space-y-2">
              {completedBacktests.map(bt => {
                const isSelected = selectedIds.includes(bt.id);
                return (
                  <div 
                    key={bt.id} 
                    onClick={() => handleToggleSelection(bt.id)}
                    className={`p-3 rounded-md border cursor-pointer transition-colors text-sm ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-medium text-gray-900 line-clamp-1" title={bt.strategy_name}>
                        {bt.strategy_name}
                      </div>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {}} // handled by parent onClick
                        className="mt-1"
                      />
                    </div>
                    <div className="text-gray-500 text-xs mt-1 flex justify-between">
                      <span className="font-mono bg-white px-1 rounded">{bt.symbol}</span>
                      <span>{Number(bt.total_return).toFixed(2)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Main Content: Comparison */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {selectedIds.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-20 bg-gray-50 border-dashed">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No backtests selected</h3>
              <p className="text-gray-500 max-w-sm text-center">
                Select 2 or more backtests from the list on the left to compare their metrics and equity curves.
              </p>
            </Card>
          ) : (
            <>
              {/* Equity Curve Comparison */}
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Equity Curve Comparison</h3>
                {isLoadingDetails ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <CompareChart backtests={selectedData} />
                )}
              </Card>

              {/* Metrics Table */}
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                {isLoadingDetails ? (
                  <div className="py-12 flex justify-center"><LoadingSpinner /></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-4 text-gray-500 font-semibold w-1/4">Metric</th>
                          {selectedData.map((bt, i) => (
                            <th key={bt.id} className="py-3 px-4 font-semibold">
                              <div className="text-gray-900">{bt.strategy_name}</div>
                              <div className="text-xs text-blue-600 font-mono mt-0.5">{bt.symbol}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <ComparisonRow label="Total Return" data={selectedData} field="total_return" format={v => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`} higherIsBetter={true} />
                        <ComparisonRow label="CAGR" data={selectedData} field="cagr" format={v => `${v.toFixed(2)}%`} higherIsBetter={true} />
                        <ComparisonRow label="Win Rate" data={selectedData} field="win_rate" format={v => `${v.toFixed(1)}%`} higherIsBetter={true} />
                        <ComparisonRow label="Profit Factor" data={selectedData} field="profit_factor" format={v => v.toFixed(2)} higherIsBetter={true} />
                        <ComparisonRow label="Max Drawdown" data={selectedData} field="max_drawdown" format={v => `${v.toFixed(2)}%`} higherIsBetter={false} />
                        <ComparisonRow label="Sharpe Ratio" data={selectedData} field="sharpe_ratio" format={v => v.toFixed(2)} higherIsBetter={true} />
                        <ComparisonRow label="Volatility" data={selectedData} field="volatility" format={v => `${v.toFixed(2)}%`} higherIsBetter={false} />
                        <ComparisonRow label="Trade Count" data={selectedData} field="trade_count" format={v => v.toString()} higherIsBetter={null} />
                        <ComparisonRow label="Avg Holding Days" data={selectedData} field="avg_holding_days" format={v => v.toFixed(1)} higherIsBetter={null} />
                        <ComparisonRow label="Exposure" data={selectedData} field="exposure" format={v => `${v.toFixed(1)}%`} higherIsBetter={null} />
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to render a comparison row and highlight the best value
function ComparisonRow({ 
  label, 
  data, 
  field, 
  format, 
  higherIsBetter 
}: { 
  label: string, 
  data: any[], 
  field: string, 
  format: (val: number) => string,
  higherIsBetter: boolean | null
}) {
  const values = data.map(d => Number(d[field]) || 0);
  
  let bestValue: number | null = null;
  if (higherIsBetter !== null && values.length > 1) {
    bestValue = higherIsBetter ? Math.max(...values) : Math.min(...values);
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-3 px-4 font-medium text-gray-700">{label}</td>
      {values.map((val, i) => {
        const isBest = bestValue !== null && val === bestValue;
        return (
          <td key={i} className={`py-3 px-4 font-mono ${isBest ? 'text-green-600 font-bold bg-green-50/50' : 'text-gray-900'}`}>
            {format(val)}
          </td>
        );
      })}
    </tr>
  );
}
