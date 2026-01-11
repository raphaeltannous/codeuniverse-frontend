import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { APIError } from '~/types/api-error';
import type { ProblemNote, ProblemNoteSaveRequest, ProblemNoteSaveResponse } from '~/types/problem/note';

interface UseProblemNoteOptions {
  onSaveSuccess?: () => void;
}

export function useProblemNote(problemSlug: string, options?: UseProblemNoteOptions) {
  const queryClient = useQueryClient();
  const problemNoteKey = ["problem-note", problemSlug];

  const { data: problemNote, isLoading, isError, error } = useQuery<ProblemNote, APIError>({
    queryKey: problemNoteKey,
    queryFn: async () => {
      const res = await fetch(`/api/problems/${problemSlug}/notes`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw data as APIError;
      }
      return data as ProblemNote;
    },
    retry: (failureCount, error) => {
      if (error.code === "PROBLEM_NOTE_NOT_FOUND") return false;
      return failureCount < 2;
    }
  })

  const saveMutation = useMutation<ProblemNoteSaveResponse, APIError, ProblemNoteSaveRequest>({
    mutationFn: async (body: ProblemNoteSaveRequest) => {
      const { method, ...requestBody } = body;
      const res = await fetch(`/api/problems/${problemSlug}/notes`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      };

      return (await res.json()) as ProblemNoteSaveResponse;
    },

    onSuccess: (_, variables) => {
      queryClient.setQueryData(
        problemNoteKey,
        {
          ...variables,
        }
      );
      options?.onSaveSuccess?.();
    },
  });

  return {
    problemNote,
    isLoading,
    isError,
    error,
    saveMutation,
  };
}

