import React, { useState } from 'react';
import { StrategyDefinition } from '../../services/strategies.service';

interface StrategyPreviewProps {
  definition: StrategyDefinition;
}

export function StrategyPreview({ definition }: StrategyPreviewProps) {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(definition, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const countConditions = (group?: { conditions: any[] }): number => {
    if (!group || !group.conditions) return 0;
    return group.conditions.reduce((acc, c) => {
      return acc + ('operator' in c ? countConditions(c) : 1);
    }, 0);
  };

  const entryCount = countConditions(definition.entryConditions);
  const exitCount = countConditions(definition.exitConditions);

  return (
    <div style={{
      background: 'var(--color-white)',
      border: '1px solid var(--color-gray-200)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-md)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: 'var(--space-4) var(--space-5)',
        borderBottom: '1px solid var(--color-gray-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--color-gray-50)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: '1rem' }}>⚡</span>
          <h3 style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-gray-900)',
            margin: 0,
          }}>
            Strategy Spec Preview
          </h3>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-gray-200)',
            background: copied ? 'var(--color-success-50)' : 'var(--color-white)',
            color: copied ? 'var(--color-success-700)' : 'var(--color-gray-600)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={e => {
            if (!copied) {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-gray-100)';
            }
          }}
          onMouseLeave={e => {
            if (!copied) {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-white)';
            }
          }}
        >
          {copied ? '✓ Copied' : '📋 Copy JSON'}
        </button>
      </div>

      {/* ── Badges Summary ── */}
      <div style={{
        padding: 'var(--space-3) var(--space-5)',
        background: 'var(--color-white)',
        borderBottom: '1px solid var(--color-gray-100)',
        display: 'flex',
        gap: 'var(--space-3)',
        flexWrap: 'wrap',
      }}>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 'var(--font-weight-bold)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-primary-50)',
          color: 'var(--color-primary-700)',
          border: '1px solid var(--color-primary-200)',
        }}>
          Entry Rules: {entryCount}
        </span>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 'var(--font-weight-bold)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          background: exitCount > 0 ? 'var(--color-warning-50)' : 'var(--color-gray-100)',
          color: exitCount > 0 ? 'var(--color-warning-700)' : 'var(--color-gray-500)',
          border: `1px solid ${exitCount > 0 ? 'var(--color-warning-200)' : 'var(--color-gray-200)'}`,
        }}>
          Exit Rules: {exitCount > 0 ? exitCount : 'Default (Stop)'}
        </span>
      </div>

      {/* ── JSON Code Output ── */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 'var(--space-4)',
        background: 'var(--color-gray-900)',
      }}>
        <pre style={{
          fontFamily: "'Fira Code', 'Cascadia Code', Menlo, Monaco, Consolas, monospace",
          fontSize: '0.75rem',
          color: '#a7f3d0',
          margin: 0,
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {jsonString}
        </pre>
      </div>
    </div>
  );
}
