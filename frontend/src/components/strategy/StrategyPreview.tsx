import React from 'react';
import { StrategyDefinition } from '../../services/strategies.service';

interface StrategyPreviewProps {
  definition: StrategyDefinition;
}

export function StrategyPreview({ definition }: StrategyPreviewProps) {
  const jsonString = JSON.stringify(definition, null, 2);

  return (
    <div className="h-full bg-gray-50 rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Live JSON Preview</h3>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="font-mono text-xs text-gray-800 whitespace-pre-wrap break-all">
          {jsonString}
        </pre>
      </div>
    </div>
  );
}
