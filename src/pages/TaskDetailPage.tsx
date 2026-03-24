/**
 * Task detail page - View task details and logs
 */
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, RefreshCw, RotateCw, X, AlertCircle } from 'lucide-react';
import { useIssue, useIssueLogs, useRetryIssue, useCancelIssue } from '../hooks/useQueue';

export function TaskDetailPage() {
  const navigate = useNavigate();
  const { issueId } = useParams<{ issueId: string }>();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project') || undefined;
  const issueNumber = Number(issueId) || 0;

  const { data: issue, isLoading, error } = useIssue(issueNumber, projectId);
  const { data: logsData, isLoading: logsLoading, error: logsError, refetch: refetchLogs } = useIssueLogs(issueNumber, projectId);
  const retryIssue = useRetryIssue();
  const cancelIssue = useCancelIssue();

  const [activeTab, setActiveTab] = useState<'details' | 'logs'>('details');

  const handleFetchLogs = () => {
    refetchLogs();
  };

  const handleRetry = async () => {
    if (!confirm('Retry this task?')) return;
    try {
      await retryIssue.mutateAsync({ issueNumber, projectId });
    } catch (err) {
      console.error('Retry failed:', err);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this task?')) return;
    try {
      await cancelIssue.mutateAsync({ issueNumber, projectId });
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-gray-600 dark:text-gray-400">Loading task...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <button
            onClick={() => navigate('/queue')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Queue</span>
          </button>
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <span>Failed to load task #{issueId}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-full bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <button
            onClick={() => navigate('/queue')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Queue</span>
          </button>
          <div className="text-gray-600 dark:text-gray-400">Task not found</div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'processing':
      case 'testing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'complex':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Back button */}
        <button
          onClick={() => navigate('/queue')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Queue</span>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {issue.title}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Issue #{issue.number}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(issue.status)}`}>
              {issue.status}
            </span>
            {issue.complexity && (
              <span className={`px-2 py-1 text-xs rounded-full ${getComplexityColor(issue.complexity)}`}>
                {issue.complexity}
              </span>
            )}
            {issue.project_id && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {issue.project_id}
              </span>
            )}
            {issue.progress !== undefined && issue.progress > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {issue.progress}% complete
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => {
              setActiveTab('logs');
              if (!logsData && !logsLoading) {
                refetchLogs();
              }
            }}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Logs
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          {activeTab === 'details' ? (
            <div className="p-6 space-y-6">
              {/* Project Info */}
              {issue.project_id && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project</div>
                  <div className="text-gray-900 dark:text-white">{issue.project_id}</div>
                </div>
              )}

              {/* Description */}
              {issue.body && (
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-sans">
                      {issue.body}
                    </pre>
                  </div>
                </div>
              )}

              {/* Labels */}
              {issue.labels && issue.labels.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Labels</div>
                  <div className="flex flex-wrap gap-2">
                    {issue.labels.map((label) => (
                      <span
                        key={label}
                        className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Author</span>
                  <div className="text-gray-900 dark:text-white">{issue.author || '-'}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">State</span>
                  <div className="text-gray-900 dark:text-white">{issue.state}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Created</span>
                  <div className="text-gray-900 dark:text-white">
                    {new Date(issue.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Updated</span>
                  <div className="text-gray-900 dark:text-white">
                    {new Date(issue.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* Logs header */}
              <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {logsData ? 'Full log content' : ''}
                </div>
                <button
                  onClick={handleFetchLogs}
                  disabled={logsLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <RefreshCw size={16} className={logsLoading ? 'animate-spin' : ''} />
                  {logsLoading ? 'Loading...' : 'Refresh Logs'}
                </button>
              </div>

              {/* Logs content */}
              {logsLoading ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  Loading logs...
                </div>
              ) : logsError ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  {(logsError as Error & { response?: { status?: number } })?.response?.status === 404
                    ? 'No logs found for this task yet'
                    : 'Failed to load logs'}
                </div>
              ) : logsData?.content ? (
                <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-auto max-h-[600px]">
                  <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">
                    {logsData.content}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  No logs available — click Refresh Logs to fetch
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          {issue.status === 'failed' && (
            <button
              onClick={handleRetry}
              disabled={retryIssue.isPending}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2"
            >
              <RotateCw size={16} />
              {retryIssue.isPending ? 'Retrying...' : 'Retry'}
            </button>
          )}
          {(issue.status === 'queued' || issue.status === 'processing') && (
            <button
              onClick={handleCancel}
              disabled={cancelIssue.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              <X size={16} />
              {cancelIssue.isPending ? 'Cancelling...' : 'Cancel Task'}
            </button>
          )}
          {issue.url && (
            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <ExternalLink size={16} />
              View on {issue.url.includes('github') ? 'GitHub' : 'GitLab'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
