import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import type { MfaForm, MfaResponse } from "~/types/auth/mfa";
import type { APIError } from "~/types/api-error";
import type { MfaResendRequestResponse, MfaResendRequest } from "~/types/auth/mfa-resend-request";
import { useAuth } from "~/context/AuthContext";

interface UseMfaOptions {
  onResendSuccess?: (newToken: string) => void;
}

export function useMfa(options?: UseMfaOptions) {
  const navigate = useNavigate();
  const { completeMfa, loginStarted } = useAuth();

  const mfaMutation = useMutation<MfaResponse, APIError, MfaForm>({
    mutationFn: async (body: MfaForm) => {
      const res = await fetch("/api/auth/login/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      }

      return (await res.json()) as MfaResponse;
    },

    onSuccess: (response) => {
      completeMfa(response.jwtToken);
      navigate("/problems");
    },
  });

  const mfaResendRequestMutation = useMutation<
    MfaResendRequestResponse,
    APIError,
    MfaResendRequest
  >({
    mutationFn: async (body: MfaResendRequest) => {
      const res = await fetch("/api/auth/login/mfa/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      }

      return (await res.json()) as MfaResendRequestResponse;
    },

    onSuccess: (response) => {
      loginStarted(response.newToken);
      options?.onResendSuccess?.(response.newToken);
    },
  });

  return { mfaMutation, mfaResendRequestMutation };
}
