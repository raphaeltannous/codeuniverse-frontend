import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "~/utils/api";
import type { PasswordRequestForm, PasswordRequestResponse } from "~/types/auth/password-request";
import type { APIError } from "~/types/api-error";

interface UsePasswordRequestOptions {
  onSuccess?: (data: PasswordRequestResponse) => void;
}

export function usePasswordRequest(options?: UsePasswordRequestOptions) {
  const passwordRequestMutation = useMutation<
    PasswordRequestResponse,
    APIError,
    PasswordRequestForm
  >({
    mutationFn: async (body: PasswordRequestForm) => {
      const res = await apiFetch("/api/auth/password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      }

      return (await res.json()) as PasswordRequestResponse;
    },

    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
  });

  return { passwordRequestMutation };
}
