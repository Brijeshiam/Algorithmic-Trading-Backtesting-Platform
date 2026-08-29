import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { EquitySnapshot } from '../../services/backtests.service';

interface EquityChartProps {
  snapshots: EquitySnapshot[];
}

export function EquityChart({ snapshots }: EquityChartProps) {
  if (snapshots.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-400 text-sm">No equity data available</p>
      </div>
    );
  }

  const equitySeries = snapshots.map((s) => ({
    x: new Date(s.timestamp).getTime(),
    y: Number(s.equity),
  }));

  const cashSeries = snapshots.map((s) => ({
    x: new Date(s.timestamp).getTime(),
    y: Number(s.cash),
  }));

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      height: '100%',
      fontFamily: 'inherit',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      animations: {
        enabled: false, // Performance optimization for dense data
      },
    },
    colors: ['#2563eb', '#9ca3af'], // Blue for equity, gray for cash
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'straight',
      width: [2, 1],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
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
        series={[
          { name: 'Total Equity', data: equitySeries },
          { name: 'Cash', data: cashSeries },
        ]}
        type="area"
        height="100%"
      />
    </div>
  );
}
