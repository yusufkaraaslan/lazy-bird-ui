/**
 * Queue page - View and manage task queue
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueue, useQueueStats, useCancelTask } from '../hooks/useQueue';
import { ExternalLink, X, AlertCircle, Clock, FileText, Search } from 'lucide-react';

type StatusFilter = 'all' | 'pending' | 'in-progress' | 'completed' | 'completed-no-changes' | 'failed';
type ComplexityFilter = 'all' | 'simple' | 'medium' | 'complex';

export function QueuePage() {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [complexityFilter, setComplexityFilter] = useState<ComplexityFilter>('all');
  const { data: tasks, isLoading, error } = useQueue(selectedProject);
  const { data: stats } = useQueueStats();
  const cancelTask = useCancelTask();

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((task) => {
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }
      if (complexityFilter !== 'all' && task.complexity !== complexityFilter) {
        return false;
      }
      return true;
    });
  }, [tasks, searchQuery, statusFilter, complexityFilter]);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-gray-600 dark:text-gray-400">Loading queue...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <span>Failed to load queue</span>
          </div>
        </div>
      </div>
    );
  }

  const handleCancelTask = async (issueId: number) => {
    if (!confirm('Are you sure you want to cancel this task?')) return;

    try {
      await cancelTask.mutateAsync(issueId.toString());
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
      case 'completed-no-changes':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getComplexityColor = (complexity: string) => {
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Task Queue</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage queued tasks</p>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Tasks</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total_tasks}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-700/50 shadow-sm">
              <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Simple</div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.by_complexity.simple}</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-700/50 shadow-sm">
              <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">Medium</div>
              <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.by_complexity.medium}</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-700/50 shadow-sm">
              <div className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">Complex</div>
              <div className="text-3xl font-bold text-red-900 dark:text-red-100">{stats.by_complexity.complex}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-end gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Project filter */}
          {stats && Object.keys(stats.by_project).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project</label>
              <select
                value={selectedProject || ''}
                onChange={(e) => setSelectedProject(e.target.value || undefined)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Projects</option>
                {Object.keys(stats.by_project).map((projectId) => (
                  <option key={projectId} value={projectId}>
                    {projectId} ({stats.by_project[projectId]})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="completed-no-changes">No Changes</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Complexity filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Complexity</label>
            <select
              value={complexityFilter}
              onChange={(e) => setComplexityFilter(e.target.value as ComplexityFilter)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All</option>
              <option value="simple">Simple</option>
              <option value="medium">Medium</option>
              <option value="complex">Complex</option>
            </select>
          </div>
        </div>

        {/* Result count */}
        {tasks && (
          <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
        )}

        {/* Tasks List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16">
              <Clock size={56} className="mx-auto text-gray-400 mb-4" />
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">No tasks in queue</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Tasks will appear here when added to the queue
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Complexity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Queued At
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
              {filteredTasks.map((task) => (
                <tr key={task.issue_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      #{task.issue_id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {task.status && (
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/queue/${task.issue_id}${task.project_id ? `?project=${task.project_id}` : ''}`)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline text-left"
                    >
                      {task.title}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {task.project_name || task.project_id || '-'}
                    </div>
                    {task.project_type && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {task.project_type}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getComplexityColor(task.complexity)}`}>
                      {task.complexity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(task._queued_at || task.queued_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end gap-2">
                      {task.url && (
                        <a
                          href={task.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                          title="View Issue"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <button
                        onClick={() => navigate(`/queue/${task.issue_id}${task.project_id ? `?project=${task.project_id}` : ''}`)}
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="View Details"
                      >
                        <FileText size={16} />
                      </button>
                      <button
                        onClick={() => handleCancelTask(task.issue_id)}
                        disabled={cancelTask.isPending}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded disabled:opacity-50"
                        title="Cancel Task"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
