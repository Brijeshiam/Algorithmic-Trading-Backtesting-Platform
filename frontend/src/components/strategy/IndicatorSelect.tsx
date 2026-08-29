import React from 'react';

const INDICATORS = ['SMA', 'EMA', 'RSI', 'MACD', 'BOLLINGER', 'VOLUME', 'PRICE'] as const;
type Indicator = typeof INDICATORS[number];

interface IndicatorSelectProps {
  value: Indicator;
  onChange: (value: Indicator) => void;
  className?: string;
}

export function IndicatorSelect({ value, onChange, className = '' }: IndicatorSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Indicator)}
      className={`border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {INDICATORS.map(ind => (
        <option key={ind} value={ind}>{ind}</option>
      ))}
    </select>
  );
}
