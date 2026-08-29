import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { strategiesService, StrategyDefinition } from '../services/strategies.service';
import { ConditionGroup } from '../components/strategy/ConditionGroup';
import { StrategyPreview } from '../components/strategy/StrategyPreview';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { LoadingSpinner } from '../components/LoadingSpinner';

const DEFAULT_STRATEGY: StrategyDefinition = {
  entryConditions: {
    operator: 'AND',
    conditions: [
      { indicator: 'SMA', period: 14, comparison: 'CROSSES_ABOVE', value: { type: 'indicator_ref', indicator: 'SMA', period: 50 } }
    ]
  },
  positionSizing: {
    type: 'PERCENTAGE',
    value: 100
  }
};

export function StrategyBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [definition, setDefinition] = useState<StrategyDefinition>(DEFAULT_STRATEGY);
  const [error, setError] = useState('');

  const { data: existingStrategy, isLoading } = useQuery({
    queryKey: ['strategy', id],
    queryFn: () => strategiesService.getStrategy(id!),
    enabled: isEditing
  });

  useEffect(() => {
    if (existingStrategy) {
      setName(existingStrategy.name);
      setDescription(existingStrategy.description || '');
      if (existingStrategy.latest_version) {
        setDefinition(existingStrategy.latest_version.definition_json);
      }
    }
  }, [existingStrategy]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => 
      isEditing && id 
        ? strategiesService.updateStrategy(id, data)
        : strategiesService.createStrategy(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['strategy', id] });
      }
      navigate(`/strategies/${data.id}`);
    },
    onError: (err: any) => {
      console.error('Save Strategy Error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to save strategy');
    }
  });

  const handleSave = () => {
    if (!name.trim()) {
      setError('Strategy name is required');
      return;
    }
    setError('');
    
    // Clean up definition before sending (e.g. remove empty groups if necessary)
    saveMutation.mutate({
      name,
      description,
      definition_json: definition
    });
  };

  if (isEditing && isLoading) return <div className="p-12 flex justify-center"><LoadingSpinner /></div>;

  return (
    <div className="h-full flex flex-col -mx-4 -mt-4 p-4 lg:mx-0 lg:mt-0 lg:p-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Strategy' : 'New Strategy'}</h1>
          <p className="text-gray-500">Build your rules using the visual editor.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button onClick={handleSave} isLoading={saveMutation.isPending}>Save Strategy</Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Left Column: Form & Visual Builder */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2 pb-12">
          {/* Meta Info */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Strategy Details</h2>
            <div className="space-y-4">
              <Input 
                label="Strategy Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Moving Average Crossover" 
                required 
              />
            </div>
          </div>

          {/* Entry Conditions */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Entry Rules</h2>
            </div>
            {definition.entryConditions ? (
              <ConditionGroup
                group={definition.entryConditions}
                onChange={(newGroup) => setDefinition({ ...definition, entryConditions: newGroup })}
                isRoot={true}
              />
            ) : (
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 mb-4">No entry conditions defined.</p>
                <Button onClick={() => setDefinition({ ...definition, entryConditions: { operator: 'AND', conditions: [] } })}>
                  Add Entry Rules
                </Button>
              </div>
            )}
          </div>

          {/* Exit Conditions (Optional) */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Exit Rules (Optional)</h2>
            </div>
            {definition.exitConditions ? (
              <ConditionGroup
                group={definition.exitConditions}
                onChange={(newGroup) => setDefinition({ ...definition, exitConditions: newGroup })}
                isRoot={true}
                onRemove={() => {
                  const newDef = { ...definition };
                  delete newDef.exitConditions;
                  setDefinition(newDef);
                }}
              />
            ) : (
              <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <Button variant="outline" onClick={() => setDefinition({ ...definition, exitConditions: { operator: 'AND', conditions: [] } })}>
                  Add Exit Rules
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="hidden lg:block h-[calc(100vh-140px)] sticky top-0">
          <StrategyPreview definition={definition} />
        </div>
      </div>
    </div>
  );
}
