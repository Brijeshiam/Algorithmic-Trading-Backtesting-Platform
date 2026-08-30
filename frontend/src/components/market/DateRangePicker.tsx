import React from 'react';

interface DateRangePickerProps {
  from: string;
  to: string;
  onFromChange: (val: string) => void;
  onToChange: (val: string) => void;
}

export function DateRangePicker({ from, to, onFromChange, onToChange }: DateRangePickerProps) {
  const setPreset = (months: number) => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    onToChange(end.toISOString().slice(0, 10));
    onFromChange(start.toISOString().slice(0, 10));
  };

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
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className="form-input"
            style={{ width: '100%', padding: '8px 12px', fontSize: 'var(--font-size-sm)' }}
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        {[
          { label: '6 Months', months: 6 },
          { label: '1 Year', months: 12 },
          { label: '2 Years', months: 24 },
          { label: '3 Years', months: 36 },
        ].map(p => (
          <button
            key={p.label}
            type="button"
            onClick={() => setPreset(p.months)}
            style={{
              padding: '2px 8px',
              fontSize: '0.7rem',
              fontWeight: 'var(--font-weight-semibold)',
              background: 'var(--color-gray-100)',
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-gray-600)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-50)';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-primary-700)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary-200)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-gray-100)';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-gray-600)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gray-200)';
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
