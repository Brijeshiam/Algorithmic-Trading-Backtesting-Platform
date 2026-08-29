import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { strategiesService } from '../services/strategies.service';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StrategyPreview } from '../components/strategy/StrategyPreview';

export function StrategyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: strategy, isLoading, error } = useQuery({
    queryKey: ['strategy', id],
    queryFn: () => strategiesService.getStrategy(id!)
  });

  const { data: versions, isLoading: isVersionsLoading } = useQuery({
    queryKey: ['strategy-versions', id],
    queryFn: () => strategiesService.getStrategyVersions(id!)
  });

  const deleteMutation = useMutation({
    mutationFn: () => strategiesService.deleteStrategy(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      navigate('/strategies');
    }
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this strategy?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) return <div className="p-12 flex justify-center"><LoadingSpinner /></div>;
  if (error || !strategy) return <div className="p-4 bg-red-50 text-red-500 rounded-md">Failed to load strategy</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{strategy.name}</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              strategy.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
              strategy.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {strategy.status}
            </span>
          </div>
          <p className="text-gray-500">{strategy.description || 'No description'}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/strategies/${id}/edit`}>
            <Button variant="outline">Edit Strategy</Button>
          </Link>
          <Button variant="outline" className="text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-[400px]">
            <StrategyPreview definition={strategy.latest_version?.definition_json!} />
          </Card>
        </div>

        {/* Right Column: Version History */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4">Version History</h2>
            {isVersionsLoading ? <LoadingSpinner /> : (
              <div className="space-y-4">
                {versions?.map((v, i) => (
                  <div key={v.version_id} className={`flex gap-3 ${i !== versions.length - 1 ? 'pb-4 border-b border-gray-100' : ''}`}>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      v{v.version}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {i === 0 ? 'Latest Version' : `Version ${v.version}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(v.created_at).toLocaleString()}
                      </p>
                      {v.notes && <p className="text-xs text-gray-600 mt-1 italic">{v.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
