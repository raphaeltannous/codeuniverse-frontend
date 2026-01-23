import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '~/utils/api';
import type { LessonsResponse } from '~/types/course/lesson';

type ProgressResponse = Record<string, boolean>;

interface UseCourseLessonsOptions {
  courseSlug: string;
  enabled?: boolean;
}

export function useCourseLessons({ courseSlug, enabled = true }: UseCourseLessonsOptions) {
  const queryClient = useQueryClient();

  // Fetch course lessons
  const lessonsQuery = useQuery<LessonsResponse>({
    queryKey: ['course-lessons', courseSlug],
    queryFn: async () => {
      const response = await apiFetch(`/api/courses/${courseSlug}`);

      if (!response.ok) {
        const error = new Error('Failed to fetch lessons');
        // Attach the status code to the error for 403 detection
        (error as any).status = response.status;
        throw error;
      }
      return response.json();
    },
    enabled: enabled && !!courseSlug,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      // Don't retry on 401, 403, or 404 errors
      const status = (error as any)?.status;
      if (status === 401 || status === 403 || status === 404) {
        return false;
      }
      
      // Also check error message from apiFetch
      if (error instanceof Error && (error.message.includes("401") || error.message.includes("403") || error.message.includes("404"))) {
        return false;
      }

      // Retry other errors up to 3 times
      return failureCount < 3;
    },
  });

  // Fetch user progress for this course
  const progressQuery = useQuery<ProgressResponse>({
    queryKey: ['user-lesson-progress', courseSlug],
    queryFn: async () => {
      const response = await apiFetch(`/api/courses/${courseSlug}/progress`);

      if (!response.ok) {
        return {};
      }
      return response.json();
    },
    enabled: enabled && !!courseSlug,
    staleTime: 1000 * 60 * 2,
  });

  // Mutation for marking lesson as watched
  const markLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const response = await apiFetch(`/api/courses/${courseSlug}/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to mark lesson as watched');
      }
      return response.json();
    },
    onMutate: async (lessonId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user-lesson-progress', courseSlug] });

      // Snapshot the previous value
      const previousProgress = queryClient.getQueryData<ProgressResponse>(['user-lesson-progress', courseSlug]);

      // Optimistically update to the new value
      queryClient.setQueryData<ProgressResponse>(['user-lesson-progress', courseSlug], (old) => ({
        ...old,
        [lessonId]: true,
      }));

      return { previousProgress };
    },
    onError: (err, lessonId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProgress) {
        queryClient.setQueryData<ProgressResponse>(
          ['user-lesson-progress', courseSlug],
          context.previousProgress
        );
      }
      console.error('Failed to mark lesson as watched:', err);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure sync with server
      queryClient.invalidateQueries({ queryKey: ['user-lesson-progress', courseSlug] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'authenticated'] });

      // Force a refetch to ensure data is fresh
      progressQuery.refetch();
    },
  });

  return {
    lessonsData: lessonsQuery.data,
    isLoading: lessonsQuery.isLoading,
    isError: lessonsQuery.isError,
    error: lessonsQuery.error,
    refetch: lessonsQuery.refetch,
    
    userProgressData: progressQuery.data,
    isLoadingProgress: progressQuery.isLoading,
    refetchProgress: progressQuery.refetch,
    
    markLessonMutation,
  };
}
