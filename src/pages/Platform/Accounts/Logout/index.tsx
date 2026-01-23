import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { useLogout } from "~/hooks/useLogout";
import { useNotification } from "~/hooks/useNotification";

export default function PlatformAccountsLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const notification = useNotification();
  const logoutMutation = useLogout();

  useEffect(() => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        notification.success('Logged out successfully');
        logout();
        navigate("/accounts/login", { replace: true });
      },
      onError: () => {
        notification.error('Logout failed');
      },
    });
  }, []);

  return null;
}
