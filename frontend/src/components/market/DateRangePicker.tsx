import React from 'react';

interface DateRangePickerProps {
  from: string;
  to: string;
  onFromChange: (val: string) => void;
  onToChange: (val: string) => void;
}

export function DateRangePicker({ from, to, onFromChange, onToChange }: DateRangePickerProps) {
  const PRESETS = [
    { label: 'Full 5 Years (2020–2024)', start: '2020-01-02', end: '2024-12-31' },
    { label: '3 Years (2022–2024)', start: '2022-01-01', end: '2024-12-31' },
    { label: '2 Years (2023–2024)', start: '2023-01-01', end: '2024-12-31' },
    { label: '1 Year (2024)', start: '2024-01-01', end: '2024-12-31' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            Start Date
          </span>
          <input
            type="date"
            min="2020-01-02"
            max="2024-12-31"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className="form-input"
            style={{ width: '100%', padding: '8px 12px', fontSize: 'var(--font-size-sm)' }}
          />
        </div>
        <div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            End Date
          </span>
          <input
            type="date"
            min="2020-01-02"
            max="2024-12-31"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className="form-input"
            style={{ width: '100%', padding: '8px 12px', fontSize: 'var(--font-size-sm)' }}
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        {PRESETS.map(p => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              onFromChange(p.start);
              onToChange(p.end);
            }}
            style={{
              padding: '3px 10px',
              fontSize: '0.7rem',
              fontWeight: 'var(--font-weight-semibold)',
              background: (from === p.start && to === p.end) ? 'var(--color-primary-50)' : 'var(--color-gray-100)',
              border: `1px solid ${(from === p.start && to === p.end) ? 'var(--color-primary-300)' : 'var(--color-gray-200)'}`,
              borderRadius: 'var(--radius-full)',
              color: (from === p.start && to === p.end) ? 'var(--color-primary-700)' : 'var(--color-gray-600)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-50)';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-primary-700)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary-200)';
            }}
            onMouseLeave={e => {
              const isSel = from === p.start && to === p.end;
              (e.currentTarget as HTMLElement).style.background = isSel ? 'var(--color-primary-50)' : 'var(--color-gray-100)';
              (e.currentTarget as HTMLElement).style.color = isSel ? 'var(--color-primary-700)' : 'var(--color-gray-600)';
              (e.currentTarget as HTMLElement).style.borderColor = isSel ? 'var(--color-primary-300)' : 'var(--color-gray-200)';
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
