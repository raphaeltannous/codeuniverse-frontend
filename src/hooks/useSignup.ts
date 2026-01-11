import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import type { SignupForm, SignupResponse } from "~/types/auth/signup";
import type { APIError } from "~/types/api-error";
import { useAuth } from "~/context/AuthContext";

interface UseSignupOptions {
  onSuccess?: (data: SignupResponse) => void;
}

export function useSignup(options?: UseSignupOptions) {
  const { completeMfa } = useAuth();
  const navigate = useNavigate();

  const signupMutation = useMutation<SignupResponse, APIError, SignupForm>({
    mutationFn: async (body: SignupForm) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      }

      return (await res.json()) as SignupResponse;
    },

    onSuccess: (response) => {
      completeMfa();
      navigate("/problems");
      options?.onSuccess?.(response);
    },
  });

  return { signupMutation };
}
