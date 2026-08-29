import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { OHLCVCandle } from '../../services/market.service';

interface PriceChartProps {
  candles: OHLCVCandle[];
  symbol: string;
}

export function PriceChart({ candles, symbol }: PriceChartProps) {
  if (candles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-400 text-sm">No data to display</p>
      </div>
    );
  }

  // Format for ApexCharts candlestick: {x: Date, y: [O, H, L, C]}
  const seriesData = candles.map((c) => ({
    x: new Date(c.timestamp),
    y: [c.open, c.high, c.low, c.close],
  }));

  // Volume bars
  const volumeData = candles.map((c) => ({
    x: new Date(c.timestamp),
    y: c.volume,
  }));

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'candlestick',
      height: '100%',
      id: 'price-chart',
      toolbar: { show: true, tools: { download: true, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true } },
      background: 'transparent',
    },
    title: {
      text: `${symbol} — Price Chart`,
      align: 'left',
      style: { fontSize: '15px', fontWeight: 600, color: '#111827' },
    },
    xaxis: {
      type: 'datetime',
      labels: { style: { colors: '#6b7280', fontSize: '11px' } },
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        style: { colors: '#6b7280', fontSize: '11px' },
        formatter: (val: number) => `$${val.toFixed(2)}`,
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#10b981',
          downward: '#ef4444',
        },
        wick: { useFillColor: true },
      },
    },
    grid: {
      borderColor: '#f3f4f6',
    },
    tooltip: {
      theme: 'light',
    },
  };

  const volumeOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      height: '100%',
      id: 'volume-chart',
      brush: { target: 'price-chart', enabled: true },
      selection: { enabled: true, xaxis: { min: seriesData[0]?.x.getTime(), max: seriesData[seriesData.length - 1]?.x.getTime() } },
      toolbar: { show: false },
      background: 'transparent',
    },
    xaxis: {
      type: 'datetime',
      labels: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#6b7280', fontSize: '10px' },
        formatter: (val: number) => {
          if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
          if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
          return `${val}`;
        },
      },
    },
    plotOptions: {
      bar: {
        columnWidth: '80%',
        colors: {
          ranges: [{ from: 0, to: Number.MAX_VALUE, color: '#93c5fd' }],
        },
      },
    },
    grid: { borderColor: '#f3f4f6' },
    tooltip: { theme: 'light' },
    fill: { opacity: 0.8 },
  };

  return (
    <div className="flex flex-col h-full gap-1">
      <div style={{ flex: '1 1 80%' }}>
        <ReactApexChart
          type="candlestick"
          series={[{ data: seriesData }]}
          options={options}
          height="100%"
        />
      </div>
      <div style={{ flex: '1 1 20%' }}>
        <ReactApexChart
          type="bar"
          series={[{ name: 'Volume', data: volumeData }]}
          options={volumeOptions}
          height="100%"
        />
      </div>
    </div>
  );
}
