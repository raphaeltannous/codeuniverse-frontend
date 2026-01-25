import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "~/utils/api";
import type { SubmitRequest, SubmitResponse } from "~/types/problem/submission";
import type { APIError } from "~/types/api-error";
import { ResultStatus } from "~/types/problem/status";

export function useSubmitProblem(problemSlug: string, language: string) {
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const submitMutation = useMutation<SubmitResponse, APIError, SubmitRequest>({
    mutationFn: async (body) => {
      const result = await apiFetch(`/api/problems/${problemSlug}/submit/${language}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!result.ok) throw (await result.json()) as APIError;
      return result.json() as Promise<SubmitResponse>;
    },
    onSuccess: (data) => setSubmissionId(data.submissionId),
  });

  const submissionStatusQuery = useQuery<any, APIError>({
    queryKey: ["submission-status", submissionId],
    queryFn: async () => {
      const result = await apiFetch(
        `/api/problems/${problemSlug}/submit/${submissionId}/check`
      );
      if (!result.ok) throw (await result.json()) as APIError;
      return result.json();
    },
    enabled: !!submissionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status as ResultStatus | undefined;
      return status && !isCompleted(status) ? 1000 : false;
    },
  });

  const isCompleted = (status: ResultStatus): boolean => {
    return status !== ResultStatus.Pending && status !== ResultStatus.Started;
  };

  const clearSubmissionId = () => setSubmissionId(null);

  return { submitMutation, submissionStatusQuery, submissionId, clearSubmissionId };
}
