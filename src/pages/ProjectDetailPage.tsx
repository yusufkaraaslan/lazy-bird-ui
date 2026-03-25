/**
 * Project detail page - View project configuration and task history
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, ExternalLink, Power, Terminal, GitBranch } from 'lucide-react';
import { useProject, useToggleProject } from '../hooks/useProjects';
import { issuesApi } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import type { Issue } from '../types/api';

export function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = useProject(id || '');
  const toggleProject = useToggleProject();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchIssues = async () => {
      try {
        const response = await issuesApi.list({ project_id: id, limit: 20 });
        setIssues(response.data.issues || []);
      } catch {
        // Issues are optional — don't block the page
      } finally {
        setIssuesLoading(false);
      }
    };
    fetchIssues();
  }, [id]);

  const handleToggle = async () => {
    if (!project) return;
    try {
      await toggleProject.mutateAsync({ id: project.id, enabled: !project.enabled });
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading project..." />;
  }

  if (error || !project) {
    return (
      <div className="min-h-full bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Projects</span>
          </button>
          <ErrorMessage title="Error" message={`Failed to load project${id ? ` "${id}"` : ''}`} />
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

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Back button */}
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Projects</span>
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {project.name}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-2 py-1 text-xs rounded-full ${
                project.enabled
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {project.enabled ? 'Enabled' : 'Disabled'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{project.type}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{project.git_platform}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleToggle}
              disabled={toggleProject.isPending}
              className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50 ${
                project.enabled
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Power size={16} />
              {project.enabled ? 'Disable' : 'Enable'}
            </button>
            <button
              onClick={() => navigate(`/projects/${project.id}/edit`)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 transition-colors"
            >
              <Edit2 size={16} />
              Edit
            </button>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Configuration</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Project ID</div>
                <div className="text-sm font-mono text-gray-900 dark:text-white">{project.id}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Type</div>
                <div className="text-sm text-gray-900 dark:text-white">{project.type}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <GitBranch size={14} /> Repository
                </div>
                <div className="text-sm font-mono text-gray-900 dark:text-white break-all">
                  {project.repository}
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Path</div>
                <div className="text-sm font-mono text-gray-900 dark:text-white break-all">
                  {project.path}
                </div>
              </div>
            </div>

            {/* Commands */}
            {(project.test_command || project.build_command || project.lint_command || project.format_command) && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1">
                    <Terminal size={14} /> Commands
                  </h3>
                  <div className="space-y-2">
                    {project.test_command && (
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-16 shrink-0 pt-0.5">Test</span>
                        <code className="text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded font-mono text-gray-900 dark:text-white break-all">
                          {project.test_command}
                        </code>
                      </div>
                    )}
                    {project.build_command && (
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-16 shrink-0 pt-0.5">Build</span>
                        <code className="text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded font-mono text-gray-900 dark:text-white break-all">
                          {project.build_command}
                        </code>
                      </div>
                    )}
                    {project.lint_command && (
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-16 shrink-0 pt-0.5">Lint</span>
                        <code className="text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded font-mono text-gray-900 dark:text-white break-all">
                          {project.lint_command}
                        </code>
                      </div>
                    )}
                    {project.format_command && (
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-16 shrink-0 pt-0.5">Format</span>
                        <code className="text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded font-mono text-gray-900 dark:text-white break-all">
                          {project.format_command}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* External link */}
            {project.repository && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <a
                  href={project.repository.startsWith('http') ? project.repository : `https://${project.git_platform}.com/${project.repository}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink size={14} />
                  View on {project.git_platform === 'github' ? 'GitHub' : 'GitLab'}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Task History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task History</h2>
          </div>
          <div className="p-6">
            {issuesLoading ? (
              <LoadingSpinner message="Loading tasks..." />
            ) : issues.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No tasks found for this project</p>
              </div>
            ) : (
              <div className="space-y-3">
                {issues.map((issue) => (
                  <div
                    key={issue.number}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => navigate(`/queue/${issue.number}?project=${project.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                          #{issue.number}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {issue.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                        {issue.complexity && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {issue.complexity}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                      {new Date(issue.updated_at || issue.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
