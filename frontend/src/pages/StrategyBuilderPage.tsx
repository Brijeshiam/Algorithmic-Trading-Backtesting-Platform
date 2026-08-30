import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { strategiesService, StrategyDefinition } from '../services/strategies.service';
import { ConditionGroup } from '../components/strategy/ConditionGroup';
import { StrategyPreview } from '../components/strategy/StrategyPreview';
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
      setError('Please provide a name for your strategy before saving.');
      return;
    }
    setError('');
    
    saveMutation.mutate({
      name,
      description,
      definition_json: definition
    });
  };

  if (isEditing && isLoading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <span>Loading strategy...</span>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1300px', margin: '0 auto' }}>
      
      {/* ── Page Header & Top Actions ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-6)',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            background: 'var(--color-primary-50)',
            color: 'var(--color-primary-700)',
            border: '1px solid var(--color-primary-100)',
            padding: '3px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: 'var(--space-2)',
          }}>
            🧩 Strategy Builder
          </div>
          <h1 className="page-title">{isEditing ? 'Edit Strategy' : 'New Trading Strategy'}</h1>
          <p className="page-subtitle">Configure rule-based algorithmic entry and exit logic with indicators.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            {saveMutation.isPending ? (
              <>
                <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                Saving...
              </>
            ) : (
              <>💾 Save Strategy</>
            )}
          </button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          background: 'var(--color-danger-50)',
          color: 'var(--color-danger-700)',
          border: '1px solid var(--color-danger-100)',
          borderLeft: '4px solid var(--color-danger-500)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-6)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)',
        }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Main Two-Column Layout ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.6fr) minmax(320px, 1fr)',
        gap: 'var(--space-6)',
        alignItems: 'start',
      }}>

        {/* ── Left Column: Builder Cards ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Card 1: Strategy Metadata */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div className="card-header" style={{ marginBottom: 'var(--space-5)' }}>
              <div>
                <h3 className="card-title">Strategy Details</h3>
                <p className="card-subtitle">General identification and description for your algorithm.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label form-required">Strategy Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Golden Cross SMA 14/50 Breakout"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description / Thesis (Optional)</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your market hypothesis or underlying trading logic..."
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Entry Rules */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div className="card-header" style={{ marginBottom: 'var(--space-5)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: '1.1rem' }}>📈</span>
                  <h3 className="card-title" style={{ margin: 0 }}>Entry Rules</h3>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 'var(--font-weight-extrabold)',
                    background: 'var(--color-primary-100)',
                    color: 'var(--color-primary-700)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Required
                  </span>
                </div>
                <p className="card-subtitle">
                  Criteria that must trigger before opening a long position.
                </p>
              </div>
            </div>

            {definition.entryConditions ? (
              <ConditionGroup
                group={definition.entryConditions}
                onChange={(newGroup) => setDefinition({ ...definition, entryConditions: newGroup })}
                isRoot={true}
              />
            ) : (
              <div style={{
                padding: 'var(--space-8)',
                textAlign: 'center',
                background: 'var(--color-gray-50)',
                borderRadius: 'var(--radius-xl)',
                border: '1px dashed var(--color-gray-300)',
              }}>
                <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
                  No entry conditions configured.
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setDefinition({ ...definition, entryConditions: { operator: 'AND', conditions: [] } })}
                >
                  + Add Entry Rules
                </button>
              </div>
            )}
          </div>

          {/* Card 3: Exit Rules */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div className="card-header" style={{ marginBottom: 'var(--space-5)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: '1.1rem' }}>📉</span>
                  <h3 className="card-title" style={{ margin: 0 }}>Exit Rules</h3>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 'var(--font-weight-bold)',
                    background: 'var(--color-gray-100)',
                    color: 'var(--color-gray-600)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Optional
                  </span>
                </div>
                <p className="card-subtitle">
                  Custom indicator conditions to close positions before holding period end.
                </p>
              </div>
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
              <div style={{
                padding: 'var(--space-6)',
                textAlign: 'center',
                background: 'var(--color-gray-50)',
                borderRadius: 'var(--radius-xl)',
                border: '1px dashed var(--color-gray-300)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-800)' }}>
                    No custom exit condition
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)' }}>
                    Strategy will hold until reverse signals occur or position stops are hit.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setDefinition({ ...definition, exitConditions: { operator: 'AND', conditions: [] } })}
                >
                  + Add Exit Rules
                </button>
              </div>
            )}
          </div>

          {/* Card 4: Position Sizing */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div className="card-header" style={{ marginBottom: 'var(--space-5)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: '1.1rem' }}>💰</span>
                  <h3 className="card-title" style={{ margin: 0 }}>Position Sizing & Allocation</h3>
                </div>
                <p className="card-subtitle">Define capital distribution for each trade entry.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sizing Model</label>
                <select
                  className="form-input"
                  value={definition.positionSizing?.type || 'PERCENTAGE'}
                  onChange={(e) => {
                    const type = e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT';
                    setDefinition({
                      ...definition,
                      positionSizing: {
                        type,
                        value: type === 'PERCENTAGE' ? 100 : 10000
                      }
                    });
                  }}
                >
                  <option value="PERCENTAGE">Percentage of Portfolio (%)</option>
                  <option value="FIXED_AMOUNT">Fixed Dollar Amount ($)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  {definition.positionSizing?.type === 'FIXED_AMOUNT' ? 'Amount ($ USD)' : 'Allocation Percentage (%)'}
                </label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={definition.positionSizing?.value ?? 100}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setDefinition({
                      ...definition,
                      positionSizing: {
                        type: definition.positionSizing?.type || 'PERCENTAGE',
                        value: val
                      }
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Sticky Live Spec Preview & Guide ── */}
        <div style={{
          position: 'sticky',
          top: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
        }}>
          <div style={{ height: '420px' }}>
            <StrategyPreview definition={definition} />
          </div>

          {/* Quick Guide Card */}
          <div style={{
            background: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-100)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-5)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-primary-800)',
              marginBottom: 'var(--space-2)',
            }}>
              💡 Strategy Tips
            </div>
            <ul style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-primary-700)',
              lineHeight: 1.6,
              paddingLeft: 'var(--space-4)',
              margin: 0,
            }}>
              <li><strong>CROSSES_ABOVE:</strong> Triggers on the exact candle where Indicator A breaks above Indicator B.</li>
              <li><strong>RSI / Volume:</strong> Combine moving averages with momentum oscillators (e.g. RSI &lt; 30) for mean-reversion.</li>
              <li><strong>Backtest after saving:</strong> Run historical backtests to analyze risk metrics and maximum drawdowns.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
