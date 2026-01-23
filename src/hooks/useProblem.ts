import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "~/utils/api";
import type { APIError } from "~/types/api-error";
import type { Problem } from "~/types/problem/problem";

export function useProblem(problemSlug: string) {
  const { data: problem, isLoading, isError, error } = useQuery<Problem, APIError>({
    queryKey: [`problem-${problemSlug}-data`],
    queryFn: async () => {
      const res = await apiFetch(`/api/problems/${problemSlug}`);

      const data = await res.json();

      if (!res.ok) {
        const apiError = data as APIError;
        // Attach the status code to the error for 403 detection
        (apiError as any).status = res.status;
        throw apiError;
      }
      return data as Problem;
    },
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
    }
  });

  return { problem, isLoading, isError, error };
}
