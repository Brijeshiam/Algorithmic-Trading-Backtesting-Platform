import React from 'react';
import { Condition, IndicatorRef } from '../../services/strategies.service';

interface ConditionBuilderProps {
  condition: Condition;
  onChange: (condition: Condition) => void;
  onRemove: () => void;
}

const INDICATORS = [
  { value: 'SMA', label: 'SMA (Simple Moving Avg)', hasPeriod: true },
  { value: 'EMA', label: 'EMA (Exponential Moving Avg)', hasPeriod: true },
  { value: 'RSI', label: 'RSI (Relative Strength)', hasPeriod: true },
  { value: 'MACD', label: 'MACD (Moving Avg Convergence)', hasPeriod: false },
  { value: 'BOLLINGER', label: 'Bollinger Bands', hasPeriod: false },
  { value: 'VOLUME', label: 'Volume', hasPeriod: false },
  { value: 'PRICE', label: 'Current Price', hasPeriod: false },
] as const;

const COMPARISONS = [
  { value: 'CROSSES_ABOVE', label: 'Crosses Above ↗', short: 'Crosses Above' },
  { value: 'CROSSES_BELOW', label: 'Crosses Below ↘', short: 'Crosses Below' },
  { value: '>', label: 'Greater Than ( > )', short: '>' },
  { value: '>=', label: 'Greater or Equal ( >= )', short: '>=' },
  { value: '<', label: 'Less Than ( < )', short: '<' },
  { value: '<=', label: 'Less or Equal ( <= )', short: '<=' },
  { value: '==', label: 'Equals ( == )', short: '==' },
] as const;

export function ConditionBuilder({ condition, onChange, onRemove }: ConditionBuilderProps) {
  const isIndicatorRef = typeof condition.value === 'object' && condition.value !== null;
  const leftIndConfig = INDICATORS.find(i => i.value === condition.indicator);
  const rightIndConfig = isIndicatorRef 
    ? INDICATORS.find(i => i.value === (condition.value as IndicatorRef).indicator)
    : null;

  const handleIndicatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ind = e.target.value as any;
    const hasPeriod = ['SMA', 'EMA', 'RSI'].includes(ind);
    onChange({ 
      ...condition, 
      indicator: ind,
      period: hasPeriod ? (condition.period || 14) : undefined
    });
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onChange({ ...condition, period: isNaN(val) ? 1 : Math.max(1, val) });
  };

  const handleComparisonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...condition, comparison: e.target.value as any });
  };

  const handleModeChange = (mode: 'constant' | 'indicator') => {
    if (mode === 'indicator') {
      onChange({
        ...condition,
        value: { type: 'indicator_ref', indicator: 'SMA', period: 50 }
      });
    } else {
      onChange({
        ...condition,
        value: 0
      });
    }
  };

  return (
    <div style={{
      background: 'var(--color-white)',
      border: '1px solid var(--color-gray-200)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-4)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 'var(--space-3)',
      transition: 'all var(--transition-base)',
      position: 'relative',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary-300)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gray-200)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* ── Left Operand Section ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        background: 'var(--color-gray-50)',
        border: '1px solid var(--color-gray-200)',
        borderRadius: 'var(--radius-lg)',
        padding: '6px 10px',
        flex: '1 1 auto',
        minWidth: '220px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-gray-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Indicator
          </span>
          <select 
            value={condition.indicator} 
            onChange={handleIndicatorChange}
            style={{
              background: 'transparent',
              border: 'none',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-gray-900)',
              outline: 'none',
              cursor: 'pointer',
              padding: '0',
            }}
          >
            {INDICATORS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {leftIndConfig?.hasPeriod && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--color-white)',
            border: '1px solid var(--color-gray-300)',
            borderRadius: 'var(--radius-md)',
            padding: '2px 8px',
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-gray-500)', fontWeight: 600 }}>Period</span>
            <input 
              type="number" 
              min="1" 
              value={condition.period || 14} 
              onChange={handlePeriodChange}
              style={{
                width: '45px',
                border: 'none',
                outline: 'none',
                fontWeight: 'var(--font-weight-bold)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-primary-700)',
                textAlign: 'center',
                background: 'transparent',
              }}
            />
          </div>
        )}
      </div>

      {/* ── Comparison Operator ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--color-primary-50)',
        border: '1px solid var(--color-primary-200)',
        borderRadius: 'var(--radius-lg)',
        padding: '6px 12px',
        flexShrink: 0,
      }}>
        <select 
          value={condition.comparison} 
          onChange={handleComparisonChange}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontWeight: 'var(--font-weight-bold)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-primary-700)',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            padding: '0',
          }}
        >
          {COMPARISONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* ── Right Operand Section ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        background: 'var(--color-gray-50)',
        border: '1px solid var(--color-gray-200)',
        borderRadius: 'var(--radius-lg)',
        padding: '6px 10px',
        flex: '1 1 auto',
        minWidth: '240px',
      }}>
        {/* Toggle mode */}
        <div style={{
          display: 'flex',
          background: 'var(--color-gray-200)',
          borderRadius: 'var(--radius-md)',
          padding: '2px',
          marginRight: '4px',
          flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={() => handleModeChange('constant')}
            style={{
              padding: '2px 8px',
              fontSize: '0.65rem',
              fontWeight: 'var(--font-weight-bold)',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              background: !isIndicatorRef ? 'var(--color-white)' : 'transparent',
              color: !isIndicatorRef ? 'var(--color-gray-900)' : 'var(--color-gray-500)',
              boxShadow: !isIndicatorRef ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            123 Value
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('indicator')}
            style={{
              padding: '2px 8px',
              fontSize: '0.65rem',
              fontWeight: 'var(--font-weight-bold)',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              background: isIndicatorRef ? 'var(--color-primary-600)' : 'transparent',
              color: isIndicatorRef ? '#fff' : 'var(--color-gray-500)',
              boxShadow: isIndicatorRef ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            📊 Indicator
          </button>
        </div>

        {/* Right Value Body */}
        {isIndicatorRef ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1 }}>
            <select 
              value={(condition.value as IndicatorRef).indicator} 
              onChange={(e: any) => {
                const ind = e.target.value;
                const hasPeriod = ['SMA', 'EMA', 'RSI'].includes(ind);
                onChange({
                  ...condition,
                  value: {
                    type: 'indicator_ref',
                    indicator: ind,
                    period: hasPeriod ? ((condition.value as IndicatorRef).period || 50) : undefined
                  }
                });
              }}
              style={{
                background: 'transparent',
                border: 'none',
                fontWeight: 'var(--font-weight-bold)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-gray-900)',
                outline: 'none',
                cursor: 'pointer',
                flex: 1,
                padding: '0',
              }}
            >
              {INDICATORS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {rightIndConfig?.hasPeriod && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'var(--color-white)',
                border: '1px solid var(--color-gray-300)',
                borderRadius: 'var(--radius-md)',
                padding: '2px 8px',
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-gray-500)', fontWeight: 600 }}>Period</span>
                <input 
                  type="number" 
                  min="1" 
                  value={(condition.value as IndicatorRef).period || 50} 
                  onChange={(e: any) => {
                    const val = parseInt(e.target.value, 10);
                    onChange({
                      ...condition,
                      value: {
                        ...(condition.value as IndicatorRef),
                        period: isNaN(val) ? 1 : Math.max(1, val)
                      }
                    });
                  }}
                  style={{
                    width: '45px',
                    border: 'none',
                    outline: 'none',
                    fontWeight: 'var(--font-weight-bold)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-primary-700)',
                    textAlign: 'center',
                    background: 'transparent',
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', fontWeight: 'bold' }}>#</span>
            <input 
              type="number" 
              step="any"
              value={condition.value as number} 
              onChange={(e: any) => onChange({ ...condition, value: parseFloat(e.target.value) || 0 })}
              style={{
                width: '100%',
                background: 'var(--color-white)',
                border: '1px solid var(--color-gray-300)',
                borderRadius: 'var(--radius-md)',
                padding: '4px 8px',
                fontWeight: 'var(--font-weight-bold)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-gray-900)',
                outline: 'none',
              }}
              placeholder="e.g. 50"
            />
          </div>
        )}
      </div>

      {/* ── Remove Button ── */}
      <button 
        type="button"
        onClick={onRemove}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid transparent',
          background: 'transparent',
          color: 'var(--color-gray-400)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'var(--color-danger-50)';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-danger-100)';
          (e.currentTarget as HTMLElement).style.color = 'var(--color-danger-600)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
          (e.currentTarget as HTMLElement).style.color = 'var(--color-gray-400)';
        }}
        title="Remove condition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
  );
}
