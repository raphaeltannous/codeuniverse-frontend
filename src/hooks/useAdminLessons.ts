import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '~/utils/api';
import type { Lesson, LessonFormData } from '~/types/course/lesson';

const API_BASE = '/api/admin/courses';

interface LessonsResponse {
  courseTitle: string;
  lessons: Lesson[];
}

interface UseAdminLessonsOptions {
  courseSlug: string;
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAdminLessons({
  courseSlug,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
  onError,
}: UseAdminLessonsOptions) {
  const queryClient = useQueryClient();

  // Fetch lessons
  const lessonsQuery = useQuery<LessonsResponse>({
    queryKey: ['lessons', courseSlug],
    queryFn: async () => {
      const response = await apiFetch(`${API_BASE}/${courseSlug}/lessons`);

      if (!response.ok) {
        throw new Error('Failed to fetch lessons');
      }
      return response.json();
    },
    enabled: !!courseSlug,
  });

  // Create lesson mutation
  const createMutation = useMutation({
    mutationFn: async (data: LessonFormData) => {
      const response = await apiFetch(`${API_BASE}/${courseSlug}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create lesson');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseSlug] });
      onCreateSuccess?.();
    },
    onError: (error: Error) => {
      console.error('Error creating lesson:', error);
      onError?.(error);
    },
  });

  // Update lesson mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LessonFormData }) => {
      const response = await apiFetch(`${API_BASE}/${courseSlug}/lessons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update lesson');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseSlug] });
      onUpdateSuccess?.();
    },
    onError: (error: Error) => {
      console.error('Error updating lesson:', error);
      onError?.(error);
    },
  });

  // Delete lesson mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiFetch(`${API_BASE}/${courseSlug}/lessons/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseSlug] });
      onDeleteSuccess?.();
    },
    onError: (error: Error) => {
      console.error('Error deleting lesson:', error);
      onError?.(error);
    },
  });

  return {
    // Query data
    lessonsData: lessonsQuery.data,
    isLoading: lessonsQuery.isLoading,
    isError: lessonsQuery.isError,
    error: lessonsQuery.error,
    refetch: lessonsQuery.refetch,

    // Mutations
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
