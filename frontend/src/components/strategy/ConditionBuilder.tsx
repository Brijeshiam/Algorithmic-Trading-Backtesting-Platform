import React from 'react';
import { Condition } from '../../services/strategies.service';

interface ConditionBuilderProps {
  condition: Condition;
  onChange: (condition: Condition) => void;
  onRemove: () => void;
}

const INDICATORS = ['SMA', 'EMA', 'RSI', 'MACD', 'BOLLINGER', 'VOLUME', 'PRICE'];
const COMPARISONS = ['>', '<', '>=', '<=', '==', 'CROSSES_ABOVE', 'CROSSES_BELOW'];

export function ConditionBuilder({ condition, onChange, onRemove }: ConditionBuilderProps) {
  
  const handleIndicatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...condition, indicator: e.target.value as any });
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...condition, period: parseInt(e.target.value, 10) || 1 });
  };

  const handleComparisonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...condition, comparison: e.target.value as any });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
      
      {/* Indicator A */}
      <div className="flex items-center gap-2">
        <select 
          value={condition.indicator} 
          onChange={handleIndicatorChange}
          className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
        >
          {INDICATORS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        
        {['SMA', 'EMA', 'RSI'].includes(condition.indicator) && (
          <input 
            type="number" 
            min="1" 
            value={condition.period || 14} 
            onChange={handlePeriodChange}
            className="border border-gray-300 rounded px-2 py-1 text-sm w-16"
          />
        )}
      </div>

      {/* Operator */}
      <select 
        value={condition.comparison} 
        onChange={handleComparisonChange} 
        className="border border-blue-300 bg-blue-50 text-blue-700 font-bold rounded px-2 py-1 text-sm"
      >
        {COMPARISONS.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>

      {/* Value/Indicator B */}
      <div className="flex items-center gap-2 flex-1">
        <select 
          value={typeof condition.value === 'object' ? 'indicator' : 'constant'} 
          onChange={(e: any) => {
            if (e.target.value === 'indicator') {
              onChange({ ...condition, value: { type: 'indicator_ref', indicator: 'SMA', period: 14 } });
            } else {
              onChange({ ...condition, value: 0 });
            }
          }}
          className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
        >
          <option value="constant">Constant</option>
          <option value="indicator">Indicator</option>
        </select>
        
        {typeof condition.value === 'object' ? (
          <>
            <select 
              value={condition.value.indicator} 
              onChange={(e: any) => onChange({ ...condition, value: { ...condition.value as any, indicator: e.target.value } })}
              className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
            >
              {INDICATORS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {['SMA', 'EMA', 'RSI'].includes((condition.value as any).indicator) && (
              <input 
                type="number" 
                min="1" 
                value={(condition.value as any).period || 14} 
                onChange={(e: any) => onChange({ ...condition, value: { ...condition.value as any, period: parseInt(e.target.value, 10) || 1 } })}
                className="border border-gray-300 rounded px-2 py-1 text-sm w-16"
              />
            )}
          </>
        ) : (
          <input 
            type="number" 
            value={condition.value as number} 
            onChange={(e: any) => onChange({ ...condition, value: parseFloat(e.target.value) || 0 })}
            className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
          />
        )}
      </div>

      {/* Remove Button */}
      <button 
        onClick={onRemove}
        className="text-gray-400 hover:text-red-500 p-1"
        title="Remove condition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
