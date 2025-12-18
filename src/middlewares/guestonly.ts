import { redirect, type MiddlewareFunction } from "react-router";

export const guestOnly: MiddlewareFunction = async ({ request }) => {
  const auth = JSON.parse(localStorage.getItem("auth") ?? "{}");
  const path = new URL(request.url).pathname;

  if (auth.isAuthenticated) {
    throw redirect("/problems");
  }

  if (auth.mfaPending && path !== "/accounts/login/mfa") {
    throw redirect("/accounts/login/mfa");
  }

  return null;
};
