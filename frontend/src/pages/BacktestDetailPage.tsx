import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { backtestsService } from '../services/backtests.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EquityChart } from '../components/backtest/EquityChart';
import { MetricsGrid } from '../components/backtest/MetricsGrid';
import { TradeLog } from '../components/backtest/TradeLog';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export function BacktestDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['backtest', id],
    queryFn: () => backtestsService.getBacktest(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-lg border border-red-100">
        <h2 className="text-lg font-bold mb-2">Error Loading Backtest</h2>
        <p>Could not load the backtest report. It may have been deleted or the ID is invalid.</p>
        <Link to="/backtests" className="inline-block mt-4 text-blue-600 font-medium hover:underline">
          &larr; Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link to="/backtests" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{report.strategy_name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              report.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
              report.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' :
              'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {report.status}
            </span>
          </div>
          <p className="text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm pl-8">
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{report.symbol}</span>
            <span>{new Date(report.date_range_start).toLocaleDateString()} &rarr; {new Date(report.date_range_end).toLocaleDateString()}</span>
            <span>Started: {new Date(report.created_at).toLocaleString()}</span>
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link to={`/strategies/${report.strategy_id}`}>
            <Button variant="secondary">View Strategy</Button>
          </Link>
          <Link to={`/backtests/new`} state={{ strategyId: report.strategy_id }}>
            <Button>Run Again</Button>
          </Link>
        </div>
      </div>

      {report.error_message && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
          <span className="font-bold">Execution Error:</span> {report.error_message}
        </div>
      )}

      {/* Main content only visible if completed */}
      {report.status === 'COMPLETED' && (
        <>
          {/* Key Metrics Grid */}
          <MetricsGrid report={report} />

          {/* Equity Curve */}
          <Card className="flex flex-col gap-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-semibold text-gray-900">Equity Curve</h3>
              <div className="flex gap-4 text-sm font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span className="text-gray-600">Total Equity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="text-gray-600">Cash</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-[400px]">
              <EquityChart snapshots={report.equitySnapshots} />
            </div>
          </Card>

          {/* Trade Log */}
          <TradeLog trades={report.trades} />
        </>
      )}

      {report.status === 'RUNNING' && (
        <Card className="py-20 flex flex-col items-center justify-center gap-4">
          <LoadingSpinner />
          <p className="text-gray-600 font-medium animate-pulse">Running Simulation...</p>
        </Card>
      )}
    </div>
  );
}
