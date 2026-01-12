import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '~/utils/api';
import type { APIError } from '~/types/api-error';
import type { ActivityLog, DailySubmissions, DashboardStats } from '~/types/dashboard/stats';

interface UseDashboardStatsOptions {
  timeRange: '24h' | '7d' | '30d';
}

export function useDashboardStats({ timeRange }: UseDashboardStatsOptions) {
  // Dashboard stats query
  const statsQuery = useQuery<DashboardStats, APIError>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await apiFetch('/api/admin/dashboard/stats', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw data as APIError;
      }
      return data as DashboardStats;
    },
    refetchInterval: 10000,
  });

  // Recent activity query
  const activityQuery = useQuery<ActivityLog[], APIError>({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const res = await apiFetch('/api/admin/dashboard/activity', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw data as APIError;
      }
      return data as ActivityLog[];
    },
    refetchInterval: 10000,
  });

  // Submission trends query
  const trendsQuery = useQuery<DailySubmissions[], APIError>({
    queryKey: ['submission-trends', timeRange],
    queryFn: async () => {
      const res = await apiFetch(`/api/admin/dashboard/submissions-activities?range=${timeRange}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw data as APIError;
      }
      return data as DailySubmissions[];
    },
  });

  return {
    // Stats
    stats: statsQuery.data,
    statsLoading: statsQuery.isLoading,
    statsError: statsQuery.isError,
    statsErrorData: statsQuery.error,

    // Activity
    recentActivity: activityQuery.data,
    activityLoading: activityQuery.isLoading,

    // Trends
    submissionTrends: trendsQuery.data,
    trendsLoading: trendsQuery.isLoading,
  };
}
