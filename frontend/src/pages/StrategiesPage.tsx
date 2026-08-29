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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Strategies</h1>
          <p className="text-gray-500">Manage and build your automated trading rules.</p>
        </div>
        <Button onClick={() => navigate('/strategies/new')}>+ New Strategy</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><LoadingSpinner /></div>
      ) : error ? (
        <div className="text-red-500 bg-red-50 p-4 rounded-md">Failed to load strategies.</div>
      ) : strategies?.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No strategies yet</h3>
          <p className="text-gray-500 mb-6">Create your first trading strategy using our visual builder.</p>
          <Button onClick={() => navigate('/strategies/new')}>Create Strategy</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies?.map((strategy) => (
            <Link key={strategy.id} to={`/strategies/${strategy.id}`} className="block group">
              <Card className="h-full hover:border-blue-300 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                    {strategy.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    strategy.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    strategy.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {strategy.status}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {strategy.description || 'No description provided.'}
                </p>
                
                <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-100">
                  <span>v{strategy.version_count || 1} • {new Date(strategy.updated_at).toLocaleDateString()}</span>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      if (window.confirm('Are you sure you want to delete this strategy?')) {
                        deleteMutation.mutate(strategy.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-colors z-10 disabled:opacity-50"
                    title="Delete Strategy"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
