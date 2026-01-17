import { createContext, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/utils/api";

type User = {
  username: string;
  avatarUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  role: string;
  premiumStatus: string;
}

type UserContextType = {
  user?: User;
  refetchUser: () => void;
  isLoading: boolean;
  error: Error | null;
};

const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { auth } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: user,
    refetch: refetchUser,
    isLoading,
    error,
  } = useQuery<User>({
    queryKey: ["userProfile", auth.isAuthenticated],
    queryFn: async () => {
      const res = await apiFetch("/api/profile/me");

      if (!res.ok) {
        throw new Error(`Failed to fetch user: ${res.statusText}`);
      }

      return (await res.json()) as User;
    },
    enabled: auth.isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!auth.isAuthenticated) {
      queryClient.removeQueries({ queryKey: ["userProfile"] });
    }
  }, [auth.isAuthenticated, queryClient]);

  return (
    <UserContext.Provider value={{ user, refetchUser, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
};
