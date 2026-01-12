import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "~/utils/api";

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await apiFetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Logout failed");
      }

      return res.json();
    },
  });
};
