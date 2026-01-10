import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as API from "~/api/problems";
import type { SubmitRequest, SubmitResponse } from "~/types/problem/submission";
import type { APIError } from "~/types/api-error";
import { ResultStatus } from "~/types/problem/status";
import { useAuth } from "~/context/AuthContext";

export function useSubmitProblem(problemSlug: string) {
  const { auth } = useAuth();
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const submitMutation = useMutation<SubmitResponse, APIError, SubmitRequest>({
    mutationFn: (body) => API.submitProblem(problemSlug, body, auth.jwt),
    onSuccess: (data) => setSubmissionId(data.submissionId),
  });

  const submissionStatusQuery = useQuery({
    queryKey: ["submission-status", submissionId],
    queryFn: () =>
      API.getSubmissionStatus(problemSlug, submissionId!, auth.jwt),
    enabled: !!submissionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status as ResultStatus | undefined;
      return status && !isCompleted(status) ? 1000 : false;
    },
  });

  const isCompleted = (status: ResultStatus): boolean => {
    return status !== ResultStatus.Pending && status !== ResultStatus.Started;
  };

  return { submitMutation, submissionStatusQuery, submissionId };
}
