import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '~/context/AuthContext';
import { useNotification } from './useNotification';
import { apiFetch } from '~/utils/api';
import type { Filters } from '~/types/problem/problemset';

export type Difficulty = "Easy" | "Medium" | "Hard";

interface ProblemBasic {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  isPremium: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Hint {
  id: string;
  problemId: string;
  hint: string;
  createdAt: string;
  updatedAt: string;
}

export interface CodeSnippet {
  id: string;
  problemId: string;
  languageName: string;
  languageSlug: string;
  codeSnippet: string;
  driverCode: string;
  testerCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemTestcase {
  input: any;
  expected: any;
  isPublic: boolean;
}

export interface ProblemTestcases {
  timeLimit: number;
  memoryLimit: number;
  testcases: ProblemTestcase[];
}

export interface Problem extends ProblemBasic {
  hints: Hint[];
  codeSnippets: CodeSnippet[];
  testcases: ProblemTestcases | null;
}

interface ProblemsResponse {
  problems: Problem[];
  total: number;
  page: number;
  limit: number;
}

export interface ProblemFormData {
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  isPremium: boolean;
  isPublic: boolean;
  hints: string[];
  codeSnippets: Omit<CodeSnippet, 'id' | 'problemId' | 'createdAt' | 'updatedAt'>[];
  testcases: ProblemTestcases | null;
}

export interface Language {
  languageName: string;
  languageSlug: string;
}

interface UseAdminProblemsParams {
  page: number;
  limit: number;
  filters: Filters;
  showOnlyPremium: 'all' | 'premium' | 'free';
  visibilityFilter: 'all' | 'public' | 'private';
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function useAdminProblems({
  page,
  limit,
  filters,
  showOnlyPremium,
  visibilityFilter,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
}: UseAdminProblemsParams) {
  const { auth } = useAuth();
  const queryClient = useQueryClient();
  const notification = useNotification();

  // Fetch supported languages
  const {
    data: languagesData,
    isLoading: isLoadingLanguages
  } = useQuery<Language[]>({
    queryKey: ['supported-languages'],
    queryFn: async () => {
      const response = await apiFetch('/api/admin/supported-languages');

      if (!response.ok) {
        throw new Error('Failed to fetch supported languages');
      }
      return (await response.json()) as Language[];
    },
    enabled: !!auth.isAuthenticated,
  });

  // Fetch problems
  const {
    data: problemsData,
    isLoading: isLoadingProblems,
    isError,
    error,
    refetch
  } = useQuery<ProblemsResponse>({
    queryKey: ['admin-problems', page, filters, showOnlyPremium, visibilityFilter],
    queryFn: async () => {
      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString(),
      });

      // Only add search if it's not empty
      if (filters.search.trim()) {
        params.append('search', filters.search);
      }

      // Add sort parameters
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      // Only add difficulty if it's not 'all'
      if (filters.difficulty !== 'all') {
        params.append('difficulty', filters.difficulty.toLowerCase());
      }

      if (visibilityFilter !== 'all') {
        params.append('public', visibilityFilter === 'public' ? 'public' : 'private');
      }
      if (showOnlyPremium !== 'all') {
        params.append('premium', showOnlyPremium === 'premium' ? 'premium' : 'free');
      }

      const response = await apiFetch(`/api/admin/problems?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch problems');
      }
      return response.json();
    },
    enabled: !!auth.isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  // Create problem mutation
  const createProblemMutation = useMutation({
    mutationFn: async (data: ProblemFormData) => {
      // Only send basic information for creating a problem
      const basicData = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        difficulty: data.difficulty,
        isPremium: data.isPremium,
        isPublic: data.isPublic,
        hints: [],
        codeSnippets: [],
        testcases: null,
      };

      const response = await apiFetch('/api/admin/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(basicData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create problem');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-problems'] });
      notification.success('Problem created successfully', 3000);
      onCreateSuccess?.();
    },
    onError: (error) => {
      notification.error(error.message || 'Failed to create problem', 5000);
    },
  });

  // Update problem mutation
  const updateProblemMutation = useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: ProblemFormData }) => {
      const response = await apiFetch(`/api/admin/problems/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update problem');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-problems'] });
      notification.success('Problem updated successfully', 3000);
      onUpdateSuccess?.();
    },
    onError: (error) => {
      notification.error(error.message || 'Failed to update problem.', 5000);
    },
  });

  // Delete problem mutation
  const deleteProblemMutation = useMutation({
    mutationFn: async (slug: string) => {
      const response = await apiFetch(`/api/admin/problems/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete problem.');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-problems'] });
      notification.success('Problem deleted successfully', 3000);
      onDeleteSuccess?.();
    },
    onError: (error) => {
      notification.error(error.message || 'Failed to delete problem.', 5000);
    },
  });

  const supportedLanguages = languagesData || [];
  const problems = problemsData?.problems ?? [];
  const total = problemsData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    // Data
    problems,
    total,
    totalPages,
    supportedLanguages,
    
    // Loading states
    isLoading: isLoadingProblems || isLoadingLanguages,
    isLoadingProblems,
    isLoadingLanguages,
    isError,
    error,
    
    // Refetch
    refetch,
    
    // Mutations
    createProblemMutation,
    updateProblemMutation,
    deleteProblemMutation,
  };
}
