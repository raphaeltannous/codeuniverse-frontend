import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";

export default function PlatformAccountsLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    logout();
    navigate("/accounts/login", { replace: true })
  }, [logout])

  return null;
}
