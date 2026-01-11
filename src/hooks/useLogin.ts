import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import type { LoginForm, LoginResponse } from "~/types/auth/login";
import type { APIError } from "~/types/api-error";
import { useAuth } from "~/context/AuthContext";

interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
}

export function useLogin(options?: UseLoginOptions) {
  const navigate = useNavigate();
  const { loginStarted } = useAuth();

  const loginMutation = useMutation<LoginResponse, APIError, LoginForm>({
    mutationFn: async (body: LoginForm) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      }

      return (await res.json()) as LoginResponse;
    },

    onSuccess: (responseData) => {
      loginStarted(responseData.mfaToken);
      navigate('/accounts/login/mfa');
      options?.onSuccess?.(responseData);
    },
  });

  return { loginMutation };
}
