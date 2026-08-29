import React from 'react';
import { Card } from '../Card';
import { BacktestTrade } from '../../services/backtests.service';

interface TradeLogProps {
  trades: BacktestTrade[];
}

export function TradeLog({ trades }: TradeLogProps) {
  if (trades.length === 0) {
    return (
      <Card>
        <div className="py-12 text-center">
          <p className="text-gray-500">No trades executed in this backtest.</p>
        </div>
      </Card>
    );
  }

  const formatCur = (val: string | null) => val ? `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
  
  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-semibold text-gray-900">Trade Log</h3>
        <span className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded-md border border-gray-200">
          {trades.length} Executions
        </span>
      </div>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-white sticky top-0 shadow-sm z-10">
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Entry Time</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Side</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">Qty</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">Entry Price</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">Exit Time</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">Exit Price</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">Costs</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">Net PnL</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-2.5 px-4 text-gray-600 text-xs whitespace-nowrap">
                  {new Date(t.entry_time).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="py-2.5 px-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                    t.side === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {t.side}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-gray-700">
                  {Number(t.quantity).toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-gray-700">
                  {formatCur(t.entry_price)}
                </td>
                <td className="py-2.5 px-4 text-gray-600 text-xs whitespace-nowrap">
                  {t.exit_time ? new Date(t.exit_time).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-gray-700">
                  {formatCur(t.exit_price)}
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-gray-500">
                  {formatCur(t.costs)}
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-medium">
                  {t.net_pnl ? (
                    <span className={Number(t.net_pnl) >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {Number(t.net_pnl) > 0 ? '+' : ''}{formatCur(t.net_pnl)}
                    </span>
                  ) : (
                    <span className="text-yellow-600 text-xs uppercase tracking-wider font-semibold">Open</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
