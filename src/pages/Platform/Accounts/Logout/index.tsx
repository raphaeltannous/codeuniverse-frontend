import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { useLogout } from "~/hooks/useLogout";

export default function PlatformAccountsLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    logoutMutation.mutate(undefined, {
      onSettled: () => {
        logout();
        navigate("/accounts/login", { replace: true });
      },
    });
  }, [logout, navigate, logoutMutation]);

  return null;
}
