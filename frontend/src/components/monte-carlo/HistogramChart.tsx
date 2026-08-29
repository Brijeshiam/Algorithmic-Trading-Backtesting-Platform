import React from 'react';
import ReactApexChart from 'react-apexcharts';

interface HistogramChartProps {
  histogram: {
    rangeStart: number;
    rangeEnd: number;
    count: number;
  }[];
}

export function HistogramChart({ histogram }: HistogramChartProps) {
  if (!histogram || histogram.length === 0) {
    return <div className="text-gray-500 text-sm p-4 text-center">No histogram data available.</div>;
  }

  // Format data for ApexCharts
  const series = [{
    name: 'Simulations',
    data: histogram.map(bin => ({
      x: `${bin.rangeStart.toFixed(1)}% to ${bin.rangeEnd.toFixed(1)}%`,
      y: bin.count
    }))
  }];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      height: '100%',
      fontFamily: 'inherit',
      toolbar: { show: false },
    },
    colors: ['#3b82f6'],
    plotOptions: {
      bar: {
        columnWidth: '95%', // Make bars touch each other slightly to look like a histogram
      }
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      labels: {
        show: false, // Too many bins to show text labels, rely on tooltip
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      title: {
        text: 'Count',
        style: { fontWeight: 500, color: '#6b7280' }
      },
      labels: {
        style: { colors: '#6b7280', fontSize: '11px' }
      }
    },
    grid: {
      borderColor: '#f3f4f6',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val: number) => `${val} simulations`,
      }
    }
  };

  return (
    <div style={{ height: '350px' }}>
      <ReactApexChart 
        options={options} 
        series={series} 
        type="bar" 
        height="100%" 
      />
    </div>
  );
}
