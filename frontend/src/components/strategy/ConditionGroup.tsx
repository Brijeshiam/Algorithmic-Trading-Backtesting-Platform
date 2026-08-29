import React from 'react';
import { ConditionGroup as IConditionGroup, Condition } from '../../services/strategies.service';
import { ConditionBuilder } from './ConditionBuilder';
import { Button } from '../Button';

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
        { indicator: 'SMA', period: 14, comparison: '>', value: 0 } as Condition
      ]
    });
  };

  const addGroup = () => {
    onChange({
      ...group,
      conditions: [
        ...group.conditions,
        { operator: 'AND', conditions: [{ indicator: 'SMA', period: 14, comparison: '>', value: 0 } as Condition] } as IConditionGroup
      ]
    });
  };

  const toggleOperator = () => {
    onChange({ ...group, operator: group.operator === 'AND' ? 'OR' : 'AND' });
  };

  return (
    <div className={`p-4 rounded-lg border-2 border-dashed ${isRoot ? 'border-gray-300 bg-white' : 'border-blue-200 bg-blue-50/30'} relative`}>
      {/* Operator Toggle */}
      <div className="absolute -top-3 left-4 flex items-center bg-white px-2 rounded-full border shadow-sm">
        <button
          className={`px-3 py-1 text-xs font-bold rounded-l-full transition-colors ${group.operator === 'AND' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          onClick={() => group.operator !== 'AND' && toggleOperator()}
        >
          AND
        </button>
        <button
          className={`px-3 py-1 text-xs font-bold rounded-r-full transition-colors ${group.operator === 'OR' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          onClick={() => group.operator !== 'OR' && toggleOperator()}
        >
          OR
        </button>
      </div>

      {/* Remove Group Button */}
      {!isRoot && onRemove && (
        <button 
          onClick={onRemove}
          className="absolute -top-3 right-4 bg-white text-gray-400 hover:text-red-500 border rounded-full p-1 shadow-sm"
          title="Remove Group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {group.conditions.map((cond, i) => (
          <div key={i} className="flex flex-col">
            {/* Determine if it's a condition or a group by checking for 'operator' */}
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

            {/* Separator */}
            {i < group.conditions.length - 1 && (
              <div className="flex justify-center my-2">
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase">
                  {group.operator}
                </span>
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={addCondition}>
            + Add Condition
          </Button>
          <Button variant="ghost" size="sm" onClick={addGroup}>
            + Add Group
          </Button>
        </div>
      </div>
    </div>
  );
}
