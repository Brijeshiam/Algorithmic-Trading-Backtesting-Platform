import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketService } from '../services/market.service';
import { AssetSelector } from '../components/market/AssetSelector';
import { DateRangePicker } from '../components/market/DateRangePicker';
import { PriceChart } from '../components/market/PriceChart';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function MarketDataPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [from, setFrom] = useState('2023-01-01');
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Fetch all available assets
  const { data: assets = [], isLoading: isLoadingAssets } = useQuery({
    queryKey: ['assets'],
    queryFn: marketService.getAssets,
  });

  // Fetch OHLCV data when triggered
  const { data: marketData, isFetching: isFetchingData, error: dataError } = useQuery({
    queryKey: ['market-data', selectedSymbol, from, to, fetchTrigger],
    queryFn: () => marketService.getMarketData(selectedSymbol, from, to, 1000),
    enabled: !!selectedSymbol && fetchTrigger > 0,
  });

  const handleLoad = () => {
    if (!selectedSymbol) return;
    setFetchTrigger(t => t + 1);
  };

  // Calculate data coverage
  const coverageInfo = React.useMemo(() => {
    if (!marketData) return null;
    const candles = marketData.candles;
    if (candles.length === 0) return null;
    const startDate = new Date(candles[0].timestamp);
    const endDate = new Date(candles[candles.length - 1].timestamp);
    const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const tradingDaysExpected = Math.round(daysDiff * 5 / 7);
    const coverage = tradingDaysExpected > 0 ? Math.min((candles.length / tradingDaysExpected) * 100, 100) : 0;
    return { startDate, endDate, coverage: coverage.toFixed(1) };
  }, [marketData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Market Data</h1>
        <p className="text-gray-500">Browse available assets and explore historical OHLCV price data.</p>
      </div>

      {/* Controls */}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-48">
            <AssetSelector
              assets={assets}
              selectedSymbol={selectedSymbol}
              onSelect={setSelectedSymbol}
              isLoading={isLoadingAssets}
            />
          </div>
          <DateRangePicker
            from={from}
            to={to}
            onFromChange={setFrom}
            onToChange={setTo}
          />
          <Button onClick={handleLoad} disabled={!selectedSymbol || isFetchingData}>
            {isFetchingData ? 'Loading...' : 'Load Data'}
          </Button>
        </div>
      </Card>

      {/* Asset Catalog */}
      {!marketData && !isFetchingData && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Assets</h2>
          {isLoadingAssets ? <LoadingSpinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Symbol</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Name</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Exchange</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Type</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-600">Candles</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-600">From</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-600">To</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.symbol} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2">
                        <span className="font-mono font-bold text-blue-600">{asset.symbol}</span>
                      </td>
                      <td className="py-3 px-2 text-gray-700">{asset.name}</td>
                      <td className="py-3 px-2 text-gray-500">{asset.exchange || '—'}</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          {asset.asset_type}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-gray-700">
                        {asset.candle_count ? asset.candle_count.toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-2 text-right text-gray-500 text-xs">
                        {asset.data_start ? new Date(asset.data_start).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-2 text-right text-gray-500 text-xs">
                        {asset.data_end ? new Date(asset.data_end).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          onClick={() => {
                            setSelectedSymbol(asset.symbol);
                            setFetchTrigger(t => t + 1);
                          }}
                        >
                          View Chart →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {assets.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No assets found. Run <code className="bg-gray-100 px-1 rounded">npm run db:seed && npm run db:seed:market</code> to populate data.
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Error */}
      {dataError && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          Failed to load market data. Please try again.
        </div>
      )}

      {/* Loading */}
      {isFetchingData && (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <LoadingSpinner />
            <p className="text-gray-500">Fetching {selectedSymbol} data…</p>
          </div>
        </Card>
      )}

      {/* Chart & Stats */}
      {marketData && !isFetchingData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Symbol</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{marketData.symbol}</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Candles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{marketData.count.toLocaleString()}</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Coverage</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{coverageInfo?.coverage ?? '—'}%</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Latest Close</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {marketData.candles.length > 0
                  ? `$${marketData.candles[marketData.candles.length - 1].close.toFixed(2)}`
                  : '—'}
              </p>
            </Card>
          </div>

          {/* Price Chart */}
          <Card className="p-4" style={{ height: '520px' }}>
            <PriceChart candles={marketData.candles} symbol={marketData.symbol} />
          </Card>
        </>
      )}
    </div>
  );
}
