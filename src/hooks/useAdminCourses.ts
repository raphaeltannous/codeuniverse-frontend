import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '~/utils/api';
import type { Course, CourseFormData } from '~/types/course/course';

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
        throw new Error('Failed to create course');
      }
      return response.json();
    },
    onSuccess: (newCourse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      options?.onCreateSuccess?.(`Course "${newCourse.title}" created successfully!`);
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
        throw new Error('Failed to update course');
      }
      return response.json();
    },
    onSuccess: (updatedCourse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      options?.onUpdateSuccess?.(`Course "${updatedCourse.title}" updated successfully!`);
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
        throw new Error('Failed to delete course');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      options?.onDeleteSuccess?.('Course deleted successfully!');
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
        throw new Error('Failed to toggle publish status');
      }
      return response.json();
    },
    onSuccess: (toggledCourse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      options?.onTogglePublishSuccess?.(
        `Course "${toggledCourse.title}" ${toggledCourse.isPublished ? 'published' : 'unpublished'} successfully!`
      );
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
        throw new Error('Failed to update thumbnail');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      options?.onThumbnailSuccess?.('Thumbnail updated successfully!');
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
