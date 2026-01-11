import { useMutation } from "@tanstack/react-query";
import type { PasswordResetForm, PasswordResetResponse } from "~/types/auth/password-reset";
import type { APIError } from "~/types/api-error";

interface UsePasswordResetOptions {
  onSuccess?: (data: PasswordResetResponse) => void;
}

export function usePasswordReset(options?: UsePasswordResetOptions) {
  const passwordResetMutation = useMutation<
    PasswordResetResponse,
    APIError,
    PasswordResetForm
  >({
    mutationFn: async (body: PasswordResetForm) => {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      }

      return (await res.json()) as PasswordResetResponse;
    },

    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
  });

  return { passwordResetMutation };
}
