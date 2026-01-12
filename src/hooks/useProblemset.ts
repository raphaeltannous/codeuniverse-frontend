import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '~/context/AuthContext';
import { useUser } from '~/context/UserContext';
import { apiFetch } from '~/utils/api';
import type {
  UserProgress,
  ProblemsResponse,
  Filters,
} from '~/types/problem/problemset';

interface UseProblemsetParams {
  limit?: number;
}

export const useProblemset = ({ limit = 10 }: UseProblemsetParams = {}) => {
  const { auth } = useAuth();
  const { user } = useUser();

  // State for filtering and pagination
  const [filters, setFilters] = useState<Filters>({
    difficulty: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // State for applied filters (used in query)
  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    difficulty: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [page, setPage] = useState(1);

  // State for user progress
  const [solvedSlugs, setSolvedSlugs] = useState<Set<string>>(new Set());
  const [showOnlyPremium, setShowOnlyPremium] = useState<
    'all' | 'premium' | 'free'
  >('all');
  const [appliedShowOnlyPremium, setAppliedShowOnlyPremium] = useState<
    'all' | 'premium' | 'free'
  >('all');

  // Fetch user progress
  const { data: progressData, isLoading: isLoadingProgress } =
    useQuery<UserProgress>({
      queryKey: ['user-progress', user?.username],
      queryFn: async () => {
        if (!auth.isAuthenticated) {
          return [];
        }

        const response = await apiFetch('/api/problems/progress');

        if (!response.ok) {
          throw new Error('Failed to fetch user progress');
        }
        return response.json();
      },
      enabled: !!auth.isAuthenticated,
    });

  // Fetch problems
  const {
    data: problemsData,
    isLoading: isLoadingProblems,
    isError,
    error,
  } = useQuery<ProblemsResponse>({
    queryKey: [
      'problems',
      page,
      appliedFilters,
      appliedShowOnlyPremium,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Only add search if it's not empty
      if (appliedFilters.search.trim()) {
        params.append('search', appliedFilters.search);
      }

      // Only add difficulty if it's not 'all'
      if (appliedFilters.difficulty !== 'all') {
        params.append('difficulty', appliedFilters.difficulty.toLowerCase());
      }

      // Add sort parameters
      params.append('sortBy', appliedFilters.sortBy);
      params.append('sortOrder', appliedFilters.sortOrder);

      // Add premium filter if not 'all'
      if (appliedShowOnlyPremium !== 'all') {
        params.append(
          'premium',
          appliedShowOnlyPremium === 'premium' ? 'premium' : 'free',
        );
      }

      const response = await apiFetch(`/api/problems?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch problems');
      }
      return response.json();
    },
  });

  // Set progress data
  useEffect(() => {
    if (progressData) {
      setSolvedSlugs(new Set(progressData));
    }
  }, [progressData]);

  // Calculate totalPages
  const total = problemsData?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const problems = problemsData?.problems || [];

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...appliedFilters, [key]: value };
    setFilters(newFilters);
    if (key === 'difficulty') {
      setAppliedFilters(newFilters);
      setPage(1);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilters(filters);
    setPage(1); // Reset to first page when search is performed
  };

  const handleResetFilters = () => {
    const resetFilters = {
      difficulty: 'all',
      search: '',
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    };

    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setShowOnlyPremium('all');
    setAppliedShowOnlyPremium('all');
    setPage(1);
  };

  const handleSortByChange = (value: string) => {
    const newSortBy = value as 'title' | 'createdAt';
    const newSortOrder: 'asc' | 'desc' =
      appliedFilters.sortBy === newSortBy
        ? appliedFilters.sortOrder === 'asc'
          ? 'desc'
          : 'asc'
        : 'desc';

    const newFilters: Filters = {
      ...appliedFilters,
      sortBy: newSortBy,
      sortOrder: newSortOrder,
    };
    setFilters(newFilters);
    setAppliedFilters(newFilters);
    setPage(1);
  };

  const handleSortOrderChange = (value: string) => {
    const newSortOrder = value as 'asc' | 'desc';
    const newFilters: Filters = {
      ...appliedFilters,
      sortOrder: newSortOrder,
    };
    setFilters(newFilters);
    setAppliedFilters(newFilters);
    setPage(1);
  };

  const handleShowOnlyPremiumChange = (value: 'all' | 'premium' | 'free') => {
    setShowOnlyPremium(value);
    setAppliedShowOnlyPremium(value);
    setPage(1);
  };

  const isLoading = isLoadingProblems || isLoadingProgress;
  const solvedCount = solvedSlugs.size;

  return {
    // Data
    problems,
    total,
    totalPages,
    solvedSlugs,
    progressData,

    // State
    filters,
    appliedFilters,
    page,
    showOnlyPremium,
    appliedShowOnlyPremium,

    // Loading states
    isLoading,
    isLoadingProblems,
    isLoadingProgress,
    isError,
    error,

    // Handlers
    setFilters,
    setAppliedFilters,
    setPage,
    handleFilterChange,
    handleSearch,
    handleResetFilters,
    handleSortByChange,
    handleSortOrderChange,
    handleShowOnlyPremiumChange,
    solvedCount,
  };
};
