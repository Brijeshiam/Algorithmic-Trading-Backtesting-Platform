import React from 'react';
import { Card } from '../Card';
import { BacktestDetails } from '../../services/backtests.service';

interface MetricsGridProps {
  report: BacktestDetails;
}

export function MetricsGrid({ report }: MetricsGridProps) {
  const formatPct = (val: string | null) => val ? `${Number(val).toFixed(2)}%` : '—';
  const formatNum = (val: string | null, decimals = 2) => val ? Number(val).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : '—';
  const formatCur = (val: string | null) => val ? `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

  const metrics = [
    { label: 'Total Return', value: formatPct(report.total_return), color: Number(report.total_return) >= 0 ? 'text-green-600' : 'text-red-600' },
    { label: 'CAGR', value: formatPct(report.cagr), color: 'text-gray-900' },
    { label: 'Max Drawdown', value: formatPct(report.max_drawdown), color: 'text-red-600' },
    { label: 'Sharpe Ratio', value: formatNum(report.sharpe_ratio), color: 'text-gray-900' },
    { label: 'Sortino Ratio', value: formatNum(report.sortino_ratio), color: 'text-gray-900' },
    { label: 'Win Rate', value: formatPct(report.win_rate), color: 'text-gray-900' },
    { label: 'Profit Factor', value: formatNum(report.profit_factor), color: 'text-gray-900' },
    { label: 'Total Trades', value: report.trade_count?.toString() || '0', color: 'text-gray-900' },
    { label: 'Avg Holding Days', value: formatNum(report.avg_holding_days, 1), color: 'text-gray-900' },
    { label: 'Market Exposure', value: formatPct(report.exposure), color: 'text-gray-900' },
    { label: 'Gross Profit', value: formatCur(report.gross_profit), color: 'text-green-600' },
    { label: 'Gross Loss', value: formatCur(report.gross_loss), color: 'text-red-600' },
    { label: 'Total Costs', value: formatCur(report.total_costs), color: 'text-gray-500' },
    { label: 'Final Equity', value: formatCur(report.final_equity), color: 'text-blue-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {metrics.map((m, i) => (
        <Card key={i} className="p-4 flex flex-col justify-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
            {m.label}
          </p>
          <p className={`text-lg font-bold ${m.color}`}>
            {m.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
