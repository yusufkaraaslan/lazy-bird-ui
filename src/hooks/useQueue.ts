/**
 * React Query hooks for task queue
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queueApi, issuesApi } from '../lib/api';
import type { Task, QueueStats, Issue } from '../types/api';

export function useQueue(projectId?: string) {
  return useQuery({
    queryKey: ['queue', projectId],
    queryFn: async () => {
      const response = await queueApi.list(projectId);
      return response.data as Task[];
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['queue', 'task', id],
    queryFn: async () => {
      const response = await queueApi.get(id);
      return response.data as Task;
    },
    enabled: !!id,
  });
}

export function useCancelTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await queueApi.cancel(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}

export function useQueueStats() {
  return useQuery({
    queryKey: ['queue', 'stats'],
    queryFn: async () => {
      const response = await queueApi.getStats();
      return response.data as QueueStats;
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

export function useIssue(issueNumber: number, projectId?: string) {
  return useQuery({
    queryKey: ['issues', issueNumber, projectId],
    queryFn: async () => {
      const response = await issuesApi.get(issueNumber, projectId);
      return response.data as Issue;
    },
    enabled: issueNumber > 0,
    refetchInterval: 10000,
  });
}

export function useIssueLogs(issueNumber: number, projectId?: string) {
  return useQuery({
    queryKey: ['issues', issueNumber, 'logs', projectId],
    queryFn: async () => {
      const response = await issuesApi.getLogs(issueNumber, projectId);
      return response.data as { content: string };
    },
    enabled: false, // Manual fetch only
  });
}

export function useRetryIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ issueNumber, projectId }: { issueNumber: number; projectId?: string }) => {
      await issuesApi.retry(issueNumber, projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}

export function useCancelIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ issueNumber, projectId }: { issueNumber: number; projectId?: string }) => {
      await issuesApi.cancel(issueNumber, projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}
