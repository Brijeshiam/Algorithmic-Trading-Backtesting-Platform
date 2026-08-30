import React from 'react';
import { ConditionGroup as IConditionGroup, Condition } from '../../services/strategies.service';
import { ConditionBuilder } from './ConditionBuilder';

interface ConditionGroupProps {
  group: IConditionGroup;
  onChange: (group: IConditionGroup) => void;
  onRemove?: () => void;
  isRoot?: boolean;
}

export function ConditionGroup({ group, onChange, onRemove, isRoot = false }: ConditionGroupProps) {
  
  const updateCondition = (index: number, newCond: Condition | IConditionGroup) => {
    const newConditions = [...group.conditions];
    newConditions[index] = newCond;
    onChange({ ...group, conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    const newConditions = [...group.conditions];
    newConditions.splice(index, 1);
    onChange({ ...group, conditions: newConditions });
  };

  const addCondition = () => {
    onChange({
      ...group,
      conditions: [
        ...group.conditions,
        { indicator: 'SMA', period: 14, comparison: 'CROSSES_ABOVE', value: { type: 'indicator_ref', indicator: 'SMA', period: 50 } } as Condition
      ]
    });
  };

  const addGroup = () => {
    onChange({
      ...group,
      conditions: [
        ...group.conditions,
        { 
          operator: 'AND', 
          conditions: [
            { indicator: 'RSI', period: 14, comparison: '<', value: 30 } as Condition
          ] 
        } as IConditionGroup
      ]
    });
  };

  const setOperator = (op: 'AND' | 'OR') => {
    onChange({ ...group, operator: op });
  };

  return (
    <div style={{
      background: isRoot ? 'var(--color-gray-50)' : 'rgba(239, 246, 255, 0.4)',
      border: isRoot ? '1px solid var(--color-gray-200)' : '1px solid var(--color-primary-200)',
      borderLeft: isRoot ? '4px solid var(--color-primary-600)' : '4px solid var(--color-primary-400)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-5)',
      position: 'relative',
      transition: 'all var(--transition-base)',
    }}>
      {/* ── Top Bar: Match Rules & Operator Toggle ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-4)',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-gray-600)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {isRoot ? 'Match Rules' : 'Nested Group Rules'}:
          </span>

          {/* Segmented AND / OR Switch */}
          <div style={{
            display: 'inline-flex',
            background: 'var(--color-white)',
            border: '1px solid var(--color-gray-300)',
            borderRadius: 'var(--radius-full)',
            padding: '2px',
            boxShadow: 'var(--shadow-xs)',
          }}>
            <button
              type="button"
              onClick={() => setOperator('AND')}
              style={{
                padding: '3px 12px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-bold)',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: 'pointer',
                background: group.operator === 'AND' ? 'var(--color-primary-600)' : 'transparent',
                color: group.operator === 'AND' ? '#fff' : 'var(--color-gray-600)',
                transition: 'all var(--transition-fast)',
              }}
            >
              ALL (AND)
            </button>
            <button
              type="button"
              onClick={() => setOperator('OR')}
              style={{
                padding: '3px 12px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-bold)',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: 'pointer',
                background: group.operator === 'OR' ? 'var(--color-warning-500)' : 'transparent',
                color: group.operator === 'OR' ? '#fff' : 'var(--color-gray-600)',
                transition: 'all var(--transition-fast)',
              }}
            >
              ANY (OR)
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-gray-400)',
            fontWeight: 'var(--font-weight-medium)',
          }}>
            {group.conditions.length} condition{group.conditions.length === 1 ? '' : 's'}
          </span>

          {/* Remove Group Button */}
          {!isRoot && onRemove && (
            <button 
              type="button"
              onClick={onRemove}
              style={{
                background: 'var(--color-white)',
                border: '1px solid var(--color-gray-200)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-gray-400)',
                padding: '4px 8px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--color-danger-600)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-danger-200)';
                (e.currentTarget as HTMLElement).style.background = 'var(--color-danger-50)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--color-gray-400)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gray-200)';
                (e.currentTarget as HTMLElement).style.background = 'var(--color-white)';
              }}
              title="Delete group"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Delete Group
            </button>
          )}
        </div>
      </div>

      {/* ── Condition Items ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {group.conditions.length === 0 ? (
          <div style={{
            padding: 'var(--space-6)',
            textAlign: 'center',
            background: 'var(--color-white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--color-gray-300)',
            color: 'var(--color-gray-400)',
            fontSize: 'var(--font-size-sm)',
          }}>
            No conditions added yet. Click <strong>+ Add Condition</strong> below to begin.
          </div>
        ) : (
          group.conditions.map((cond, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {'operator' in cond ? (
                <ConditionGroup
                  group={cond as IConditionGroup}
                  onChange={(newGrp) => updateCondition(i, newGrp)}
                  onRemove={() => removeCondition(i)}
                />
              ) : (
                <ConditionBuilder
                  condition={cond as Condition}
                  onChange={(newCond) => updateCondition(i, newCond)}
                  onRemove={() => removeCondition(i)}
                />
              )}

              {/* Connector between conditions */}
              {i < group.conditions.length - 1 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  margin: '2px 0',
                }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'var(--color-gray-200)',
                    zIndex: 0,
                  }} />
                  <span style={{
                    position: 'relative',
                    zIndex: 1,
                    background: group.operator === 'AND' ? 'var(--color-primary-50)' : 'var(--color-warning-50)',
                    color: group.operator === 'AND' ? 'var(--color-primary-700)' : 'var(--color-warning-600)',
                    border: `1px solid ${group.operator === 'AND' ? 'var(--color-primary-200)' : 'var(--color-warning-100)'}`,
                    fontSize: '0.65rem',
                    fontWeight: 'var(--font-weight-extrabold)',
                    padding: '1px 8px',
                    borderRadius: 'var(--radius-full)',
                    letterSpacing: '0.08em',
                  }}>
                    {group.operator}
                  </span>
                </div>
              )}
            </div>
          ))
        )}

        {/* ── Actions Footer ── */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={addCondition}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-primary-300)',
              background: 'var(--color-white)',
              color: 'var(--color-primary-700)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-bold)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-50)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary-400)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-white)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary-300)';
            }}
          >
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> Add Condition
          </button>

          <button
            type="button"
            onClick={addGroup}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--color-gray-300)',
              background: 'transparent',
              color: 'var(--color-gray-600)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-gray-100)';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-gray-900)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-gray-600)';
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>📂</span> Add Nested Group
          </button>
        </div>
      </div>
    </div>
  );
}
