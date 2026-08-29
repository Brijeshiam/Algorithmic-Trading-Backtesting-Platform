import React from 'react';

interface DateRangePickerProps {
  from: string;
  to: string;
  onFromChange: (val: string) => void;
  onToChange: (val: string) => void;
}

export function DateRangePicker({ from, to, onFromChange, onToChange }: DateRangePickerProps) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">From</label>
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">To</label>
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
