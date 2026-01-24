import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from './useNotification';
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
  const notification = useNotification();

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create lesson');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseSlug] });
      notification.success('Lesson created successfully', 3000);
      onCreateSuccess?.();
    },
    onError: (error: Error) => {
      notification.error(error.message || 'Failed to create lesson', 5000);
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update lesson');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseSlug] });
      notification.success('Lesson updated successfully', 3000);
      onUpdateSuccess?.();
    },
    onError: (error: Error) => {
      notification.error(error.message || 'Failed to update lesson', 5000);
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete lesson');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseSlug] });
      notification.success('Lesson deleted successfully', 3000);
      onDeleteSuccess?.();
    },
    onError: (error: Error) => {
      notification.error(error.message || 'Failed to delete lesson', 5000);
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
