import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "~/utils/api";
import type { APIError } from "~/types/api-error";
import type { SuccessResponse } from "~/types/api-success";

interface VerificationForm {
  token: string;
}

export function useEmailVerification() {
  const verificationMutation = useMutation<SuccessResponse, APIError, VerificationForm>({
    mutationFn: async (body: VerificationForm) => {
      const res = await apiFetch("/api/auth/signup/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      }

      return (await res.json()) as SuccessResponse;
    },
  });

  return { verificationMutation };
}
