import { type MiddlewareFunction } from "react-router";
import { apiFetch } from "~/utils/api";

const STORAGE_KEY = "auth";

export const guestOnly: MiddlewareFunction = async () => {
  try {
    const res = await apiFetch("/api/auth/status", {
      method: "GET",
    });

    if (res.ok) {
      const authState = {
        isAuthenticated: true,
        mfaPending: false,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
      window.location.href = "/problems";
      return null;
    }
  } catch (error) {
    if (error instanceof Response) throw error;
  }

  return null;
};