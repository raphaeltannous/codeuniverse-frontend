import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, getErrorMessage } from '~/utils/api';
import type { Course, CourseFormData } from '~/types/course/course';
import type { SuccessResponse } from '~/types/api-success';

const API_BASE = '/api/admin';


interface UseAdminCoursesOptions {
  onCreateSuccess?: (message: string) => void;
  onUpdateSuccess?: (message: string) => void;
  onDeleteSuccess?: (message: string) => void;
  onTogglePublishSuccess?: (message: string) => void;
  onThumbnailSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export function useAdminCourses(options?: UseAdminCoursesOptions) {
  const queryClient = useQueryClient();

  // Fetch all courses
  const coursesQuery = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await apiFetch(`${API_BASE}/courses`);

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  // Create course mutation
  const createMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const response = await apiFetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMessage = await getErrorMessage(response);
        throw new Error(errorMessage);
      }
      return response.json();
    },
    onSuccess: (response: SuccessResponse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      options?.onCreateSuccess?.(response.message);
    },
    onError: (error: Error) => {
      options?.onError?.(error.message || 'Failed to create course');
    },
  });

  // Update course mutation
  const updateMutation = useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: CourseFormData }) => {
      const response = await apiFetch(`${API_BASE}/courses/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMessage = await getErrorMessage(response);
        throw new Error(errorMessage);
      }
      return response.json();
    },
    onSuccess: (response: SuccessResponse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      options?.onUpdateSuccess?.(response.message);
    },
    onError: (error: Error) => {
      options?.onError?.(error.message || 'Failed to update course');
    },
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => {
      const response = await apiFetch(`${API_BASE}/courses/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorMessage = await getErrorMessage(response);
        throw new Error(errorMessage);
      }
      return response.json();
    },
    onSuccess: (response: SuccessResponse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      options?.onDeleteSuccess?.(response.message);
    },
    onError: (error: Error) => {
      options?.onError?.(error.message || 'Failed to delete course');
    },
  });

  // Toggle publish mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ slug, publish }: { slug: string; publish: boolean }) => {
      const response = await apiFetch(`${API_BASE}/courses/${slug}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublished: publish }),
      });

      if (!response.ok) {
        const errorMessage = await getErrorMessage(response);
        throw new Error(errorMessage);
      }
      return response.json();
    },
    onSuccess: (response: SuccessResponse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      options?.onTogglePublishSuccess?.(response.message);
    },
    onError: (error: Error) => {
      options?.onError?.(error.message || 'Failed to toggle publish status');
    },
  });

  // Change thumbnail mutation
  const changeThumbnailMutation = useMutation({
    mutationFn: async ({ slug, file }: { slug: string; file: File }) => {
      const formData = new FormData();
      formData.append('thumbnail', file);
      formData.append('courseSlug', slug);

      const response = await apiFetch(`${API_BASE}/courses/${slug}/thumbnail`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorMessage = await getErrorMessage(response);
        throw new Error(errorMessage);
      }
      return response.json();
    },
    onSuccess: (response: SuccessResponse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      options?.onThumbnailSuccess?.(response.message);
    },
    onError: (error: Error) => {
      options?.onError?.(error.message || 'Failed to update thumbnail');
    },
  });

  return {
    // Query
    courses: coursesQuery.data || [],
    isLoading: coursesQuery.isLoading,
    isError: coursesQuery.isError,
    error: coursesQuery.error,
    refetch: coursesQuery.refetch,

    // Mutations
    createMutation,
    updateMutation,
    deleteMutation,
    togglePublishMutation,
    changeThumbnailMutation,
  };
}
