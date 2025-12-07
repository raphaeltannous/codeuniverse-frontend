import { redirect, type MiddlewareFunction } from "react-router";

function isLoggedIn(): boolean {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp) {
      const now = Date.now() / 1000;
      return payload.exp > now;
    }
    return true;
  } catch {
    return false;
  }
}


export const guestOnly: MiddlewareFunction = async () => {
  if (isLoggedIn()) {
    throw redirect("/problems");
  }
};
