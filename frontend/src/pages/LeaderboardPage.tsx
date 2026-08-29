import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { strategiesService } from '../services/strategies.service';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function LeaderboardPage() {
  const { data: leaderboard = [], isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: strategiesService.getLeaderboard,
  });

  if (isLoading) {
    return <div className="py-24 flex justify-center"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon text-red-500">⚠️</div>
        <h3 className="empty-state-title">Failed to load leaderboard</h3>
        <p className="empty-state-description">Please try refreshing the page.</p>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🏆</div>
        <h3 className="empty-state-title">No rankings yet</h3>
        <p className="empty-state-description">Run backtests on your strategies to see them on the leaderboard.</p>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return <span className="bg-yellow-100 text-yellow-800 font-bold px-3 py-1 rounded-full text-sm shadow-sm ring-1 ring-yellow-400">🥇 1st Place</span>;
      case 2: return <span className="bg-gray-200 text-gray-800 font-bold px-3 py-1 rounded-full text-sm shadow-sm ring-1 ring-gray-400">🥈 2nd Place</span>;
      case 3: return <span className="bg-orange-100 text-orange-800 font-bold px-3 py-1 rounded-full text-sm shadow-sm ring-1 ring-orange-400">🥉 3rd Place</span>;
      default: return <span className="text-gray-500 font-semibold w-8 text-center block">#{rank}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center py-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Strategy Leaderboard</h1>
        <p className="text-gray-500 text-lg">Ranked by Risk-Adjusted Returns (Best Sharpe Ratio)</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {top3.map((entry, idx) => (
          <Link key={entry.strategyId} to={`/backtests/${entry.backtestId}`} className={`block group transform transition-transform hover:-translate-y-1 ${idx === 0 ? 'md:-mt-6' : ''}`}>
            <Card className={`h-full flex flex-col items-center text-center p-6 border-2 transition-shadow hover:shadow-lg ${
              idx === 0 ? 'border-yellow-400 bg-gradient-to-b from-yellow-50 to-white' :
              idx === 1 ? 'border-gray-300 bg-gradient-to-b from-gray-50 to-white' :
              'border-orange-300 bg-gradient-to-b from-orange-50 to-white'
            }`}>
              <div className="mb-4">{getRankBadge(idx + 1)}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{entry.strategyName}</h3>
              <p className="text-xs font-mono text-gray-500 mb-6 bg-gray-100 px-2 py-0.5 rounded">{entry.symbol}</p>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Sharpe</p>
                  <p className="text-2xl font-black text-gray-900">{entry.sharpeRatio.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Max Drawdown</p>
                  <p className="text-2xl font-black text-red-600">{entry.maxDrawdown.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Return</p>
                  <p className={`text-lg font-bold ${entry.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.totalReturn >= 0 ? '+' : ''}{entry.totalReturn.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Win Rate</p>
                  <p className="text-lg font-bold text-gray-900">{entry.winRate.toFixed(1)}%</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Rest of the leaderboard */}
      {rest.length > 0 && (
        <Card className="max-w-5xl mx-auto overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Strategy</th>
                  <th className="px-6 py-4 text-right">Sharpe Ratio</th>
                  <th className="px-6 py-4 text-right">Max Drawdown</th>
                  <th className="px-6 py-4 text-right">Total Return</th>
                  <th className="px-6 py-4 text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rest.map((entry, idx) => (
                  <tr key={entry.strategyId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">{getRankBadge(idx + 4)}</td>
                    <td className="px-6 py-4">
                      <Link to={`/backtests/${entry.backtestId}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {entry.strategyName}
                      </Link>
                      <div className="text-xs font-mono text-gray-500 mt-0.5">{entry.symbol}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">{entry.sharpeRatio.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-medium text-red-600">{entry.maxDrawdown.toFixed(1)}%</td>
                    <td className={`px-6 py-4 text-right font-medium ${entry.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.totalReturn >= 0 ? '+' : ''}{entry.totalReturn.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-700">{entry.winRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
