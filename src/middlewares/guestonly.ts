import { redirect, type MiddlewareFunction } from "react-router";
import { apiFetch } from "~/utils/api";

export const guestOnly: MiddlewareFunction = async ({ request }) => {
  try {
    const res = await apiFetch("/api/auth/status", {
      method: "GET",
    });

    if (res.ok) {
      throw redirect("/problems");
    }
  } catch (error) {
    if (error instanceof Response) throw error;
  }

  return null;
};