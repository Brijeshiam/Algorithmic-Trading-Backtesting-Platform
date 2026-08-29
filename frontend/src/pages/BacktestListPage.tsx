import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { backtestsService } from '../services/backtests.service';

export function BacktestListPage() {
  const { data: backtests = [], isLoading } = useQuery({
    queryKey: ['backtests'],
    queryFn: backtestsService.listBacktests,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backtests</h1>
          <p className="text-gray-500">View and analyze your historical strategy performance.</p>
        </div>
        <Link to="/backtests/new">
          <Button>Run New Backtest</Button>
        </Link>
      </div>

      <Card>
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : backtests.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No backtests found</h3>
            <p className="mt-2 text-sm text-gray-500">Run a backtest to see your strategy's performance.</p>
            <div className="mt-6">
              <Link to="/backtests/new">
                <Button>Run Backtest</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Strategy</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Asset</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Capital</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Return</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Max DD</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {backtests.map((bt) => (
                  <tr key={bt.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {new Date(bt.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{bt.strategy_name}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{bt.symbol}</td>
                    <td className="py-3 px-4 text-right font-mono text-gray-700">
                      ${Number(bt.initial_capital).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium">
                      {bt.total_return ? (
                        <span className={Number(bt.total_return) >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {Number(bt.total_return) >= 0 ? '+' : ''}{Number(bt.total_return).toFixed(2)}%
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-700">
                      {bt.max_drawdown ? `${Number(bt.max_drawdown).toFixed(2)}%` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${bt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          bt.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
                          bt.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {bt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/backtests/${bt.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                        View Report →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
