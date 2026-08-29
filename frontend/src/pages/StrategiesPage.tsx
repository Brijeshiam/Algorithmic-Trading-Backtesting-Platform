import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { strategiesService } from '../services/strategies.service';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function StrategiesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { data: strategies, isLoading, error } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => strategiesService.getStrategies()
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => strategiesService.deleteStrategy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Strategies</h1>
          <p className="page-subtitle">Manage and build your automated trading rules.</p>
        </div>
        <Button onClick={() => navigate('/strategies/new')}>+ New Strategy</Button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h3 className="empty-state-title">Failed to load strategies</h3>
          <p className="empty-state-description">There was an error loading your strategies. Please try again.</p>
        </div>
      ) : strategies?.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3 className="empty-state-title">No strategies yet</h3>
          <p className="empty-state-description">Create your first trading strategy using our visual builder to get started.</p>
          <div>
            <Button onClick={() => navigate('/strategies/new')}>Create Strategy</Button>
          </div>
        </div>
      ) : (
        <div className="grid-auto">
          {strategies?.map((strategy) => (
            <Link key={strategy.id} to={`/strategies/${strategy.id}`} style={{ textDecoration: 'none' }}>
              <div className="card card-interactive" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-gray-100)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-900)', margin: 0, transition: 'all var(--transition-fast)' }}>
                    {strategy.name}
                  </h3>
                  <span className={`badge badge-${
                    strategy.status === 'ACTIVE' ? 'success' :
                    strategy.status === 'ARCHIVED' ? 'neutral' :
                    'warning'
                  }`} style={{ marginLeft: 'var(--space-2)' }}>
                    {strategy.status}
                  </span>
                </div>
                
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-600)', marginBottom: 'var(--space-4)', lineHeight: 'var(--line-height-relaxed)', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {strategy.description || 'No description provided.'}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-gray-100)', marginTop: 'auto' }}>
                  <span>v{strategy.version_count || 1} • {new Date(strategy.updated_at).toLocaleDateString()}</span>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      if (window.confirm('Are you sure you want to delete this strategy?')) {
                        deleteMutation.mutate(strategy.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-danger-600)',
                      cursor: 'pointer',
                      padding: 'var(--space-2)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'all var(--transition-fast)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: deleteMutation.isPending ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-danger-50)';
                      e.currentTarget.style.color = 'var(--color-danger-700)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.color = 'var(--color-danger-600)';
                    }}
                    title="Delete Strategy"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
