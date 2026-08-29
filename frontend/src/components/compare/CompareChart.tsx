import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { EquitySnapshot } from '../../services/backtests.service';

interface BacktestData {
  id: string;
  strategy_name: string;
  symbol: string;
  equitySnapshots: EquitySnapshot[];
}

interface CompareChartProps {
  backtests: BacktestData[];
}

export function CompareChart({ backtests }: CompareChartProps) {
  if (backtests.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-400 text-sm">Select backtests to compare</p>
      </div>
    );
  }

  // Create a series for each backtest's equity curve
  const series = backtests.map((bt) => {
    const snapshots = bt.equitySnapshots || [];
    return {
      name: `${bt.strategy_name} (${bt.symbol})`,
      data: snapshots.map(s => ({
        x: new Date(s.timestamp).getTime(),
        y: Number(s.equity)
      }))
    };
  });

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      height: '100%',
      fontFamily: 'inherit',
      toolbar: {
        show: true,
      },
      animations: {
        enabled: false, 
      },
    },
    colors: ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#9333ea'], // Distinct colors
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'straight',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.2,
        opacityTo: 0.0,
        stops: [0, 100],
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: { colors: '#6b7280', fontSize: '11px' },
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: { colors: '#6b7280', fontSize: '11px' },
        formatter: (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      },
    },
    grid: {
      borderColor: '#f3f4f6',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      },
      x: {
        format: 'dd MMM yyyy',
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
  };

  return (
    <div style={{ height: '400px' }}>
      <ReactApexChart
        options={options}
        series={series}
        type="line" // line looks better for multiple overlapping curves than thick area
        height="100%"
      />
    </div>
  );
}
