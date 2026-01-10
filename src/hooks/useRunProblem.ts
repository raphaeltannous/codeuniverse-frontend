// src/hooks/useRunProblem.ts
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as API from "~/api/problems";
import type {
  RunRequest,
  RunResponse,
  RunResultsReponse,
} from "~/types/problem/run";
import type { APIError } from "~/types/api-error";
import { ResultStatus } from "~/types/problem/status";
import { useAuth } from "~/context/AuthContext";

export function useRunProblem(problemSlug: string, language: string) {
  const { auth } = useAuth();
  const [runId, setRunId] = useState<string | null>(null);

  const runMutation = useMutation<RunResponse, APIError, RunRequest>({
    mutationFn: (body) => API.runProblem(problemSlug, language, body, auth.jwt),
    onSuccess: (data) => setRunId(data.runId),
  });

  const runStatusQuery = useQuery<RunResultsReponse, APIError>({
    queryKey: ["run-status", runId],
    queryFn: () => API.getRunStatus(problemSlug, runId!, auth.jwt),
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
