import { useQuery } from "@tanstack/react-query";
import type { APIError } from "~/types/api-error";
import type { Problem } from "~/types/problem";

export function useProblem(problemSlug: string) {
  const { data: problem, isLoading, isError, error } = useQuery<Problem, APIError>({
    queryKey: [`problem-${problemSlug}-data`],
    queryFn: async () => {
      const res = await fetch(`/api/problems/${problemSlug}`);
      const data = await res.json();

      if (!res.ok) {
        throw data as APIError;
      }
      return data as Problem;
    }
  });

  return { problem, isLoading, isError, error };
}
