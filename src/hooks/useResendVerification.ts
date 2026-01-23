import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "~/utils/api";
import type { APIError } from "~/types/api-error";
import type { SuccessResponse } from "~/types/api-success";

export function useResendVerification() {
  const resendMutation = useMutation<SuccessResponse, APIError, void>({
    mutationFn: async () => {
      const res = await apiFetch("/api/auth/resend-verification", {
        method: "POST",
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      }

      return (await res.json()) as SuccessResponse;
    },
  });

  return { resendMutation };
}
