import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '~/utils/api';
import type { Course } from '~/types/course/course';

export interface CourseWithProgress extends Course {
  completionPercentage: number;
}

interface UseCoursesListOptions {
  isAuthenticated?: boolean;
}

export function useCoursesList({ isAuthenticated = false }: UseCoursesListOptions = {}) {
  const coursesQuery = useQuery<CourseWithProgress[]>({
    queryKey: ['courses', isAuthenticated ? 'authenticated' : 'public'],
    queryFn: async () => {
      const endpoint = isAuthenticated
        ? '/api/courses/loggedIn'
        : '/api/courses';

      const response = await apiFetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }

      const data = await response.json();

      return data.map((course: CourseWithProgress) => ({
        ...course,
        completionPercentage: course.completionPercentage || 0,
      }));
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  return {
    courses: coursesQuery.data || [],
    isLoading: coursesQuery.isLoading,
    isError: coursesQuery.isError,
    error: coursesQuery.error,
    refetch: coursesQuery.refetch,
  };
}
