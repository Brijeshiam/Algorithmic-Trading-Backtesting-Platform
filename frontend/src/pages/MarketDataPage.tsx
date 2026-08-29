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
    <div className="market-page">
      {/* Header */}
      <div className="market-header">
        <h1>Market Data</h1>
        <p>Browse available assets and explore historical OHLCV price data.</p>
      </div>

      {/* Controls */}
      <Card className="market-toolbar-card">
        <div className="market-toolbar">
          <div className="market-toolbar-control market-toolbar-control-wide">
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
          <Button
            onClick={handleLoad}
            disabled={!selectedSymbol || isFetchingData}
            className="market-load-button"
          >
            {isFetchingData ? 'Loading...' : 'Load Data'}
          </Button>
        </div>
      </Card>

      {/* Asset Catalog */}
      {!marketData && !isFetchingData && (
        <Card className="market-catalog-card">
          <div className="market-section-head">
            <div>
              <p className="market-kicker">Asset catalog</p>
              <h2>Available Assets</h2>
            </div>
          </div>
          {isLoadingAssets ? <LoadingSpinner /> : (
            <div className="market-table-wrap">
              <table className="data-table market-data-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Exchange</th>
                    <th>Type</th>
                    <th className="market-table-right">Candles</th>
                    <th className="market-table-right">From</th>
                    <th className="market-table-right">To</th>
                    <th className="market-table-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.symbol} className="market-asset-row">
                      <td>
                        <span className="market-symbol-pill">{asset.symbol}</span>
                      </td>
                      <td>{asset.name}</td>
                      <td>{asset.exchange || '—'}</td>
                      <td>
                        <span className="market-type-badge">{asset.asset_type}</span>
                      </td>
                      <td className="market-table-right market-mono">
                        {asset.candle_count ? asset.candle_count.toLocaleString() : '—'}
                      </td>
                      <td className="market-table-right market-small-text">
                        {asset.data_start ? new Date(asset.data_start).toLocaleDateString() : '—'}
                      </td>
                      <td className="market-table-right market-small-text">
                        {asset.data_end ? new Date(asset.data_end).toLocaleDateString() : '—'}
                      </td>
                      <td className="market-table-right">
                        <button
                          className="market-select-button"
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
                <div className="market-empty-state">
                  No assets found. Run <code>npm run db:seed && npm run db:seed:market</code> to populate data.
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Error */}
      {dataError && (
        <div className="market-error-state">
          Failed to load market data. Please try again.
        </div>
      )}

      {/* Loading */}
      {isFetchingData && (
        <Card className="market-loading-card">
          <div className="market-loading-panel">
            <LoadingSpinner />
            <p>Fetching {selectedSymbol} data…</p>
          </div>
        </Card>
      )}

      {/* Chart & Stats */}
      {marketData && !isFetchingData && (
        <>
          {/* Summary Cards */}
          <div className="market-summary-grid">
            <Card className="market-summary-card market-summary-card-primary">
              <p className="market-card-label">Symbol</p>
              <p className="market-card-value market-card-value-highlight">{marketData.symbol}</p>
            </Card>
            <Card className="market-summary-card">
              <p className="market-card-label">Candles</p>
              <p className="market-card-value">{marketData.count.toLocaleString()}</p>
            </Card>
            <Card className="market-summary-card market-summary-card-success">
              <p className="market-card-label">Coverage</p>
              <p className="market-card-value market-card-value-success">{coverageInfo?.coverage ?? '—'}%</p>
            </Card>
            <Card className="market-summary-card">
              <p className="market-card-label">Latest Close</p>
              <p className="market-card-value">
                {marketData.candles.length > 0
                  ? `$${marketData.candles[marketData.candles.length - 1].close.toFixed(2)}`
                  : '—'}
              </p>
            </Card>
          </div>

          {/* Price Chart */}
          <Card className="market-chart-card">
            <div className="market-chart-header">
              <div>
                <p className="market-kicker">Price trend</p>
                <h2>{marketData.symbol} OHLCV Chart</h2>
              </div>
            </div>
            <div className="market-chart-panel">
              <PriceChart candles={marketData.candles} symbol={marketData.symbol} />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
