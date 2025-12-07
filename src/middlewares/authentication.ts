import { userContext } from "~/context";
import { redirect, type MiddlewareFunction } from "react-router";

export const authMiddleware: MiddlewareFunction = async ({ context }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw redirect("/accounts/login");
  }

  context.set(userContext, {token:token});
};
