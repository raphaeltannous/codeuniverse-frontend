import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "~/utils/api";
import type {
  RunRequest,
  RunResponse,
  RunResultsReponse,
} from "~/types/problem/run";
import type { APIError } from "~/types/api-error";
import { ResultStatus } from "~/types/problem/status";

export function useRunProblem(problemSlug: string, language: string) {
  const [runId, setRunId] = useState<string | null>(null);

  const runMutation = useMutation<RunResponse, APIError, RunRequest>({
    mutationFn: async (body) => {
      const result = await apiFetch(`/api/problems/${problemSlug}/run/${language}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!result.ok) throw (await result.json()) as APIError;
      return result.json() as Promise<RunResponse>;
    },
    onSuccess: (data) => setRunId(data.runId),
  });

  const runStatusQuery = useQuery<RunResultsReponse, APIError>({
    queryKey: ["run-status", runId],
    queryFn: async () => {
      const result = await apiFetch(`/api/problems/${problemSlug}/run/${runId}/check`);
      if (!result.ok) throw (await result.json()) as APIError;
      return result.json() as Promise<RunResultsReponse>;
    },
    enabled: !!runId,
    refetchInterval: (query) => {
      const status = query.state.data?.status as ResultStatus | undefined;
      return status && !isCompleted(status) ? 1000 : false;
    },
  });

  const isCompleted = (status: ResultStatus): boolean => {
    return status !== ResultStatus.Pending && status !== ResultStatus.Started;
  };

  return { runMutation, runStatusQuery, runId, isCompleted };
}
