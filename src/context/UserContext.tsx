import { createContext, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type User = {
  username: string;
  avatarUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  role: string;
  isPremium: boolean;
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
    queryKey: ["userProfile", auth.jwt],
    queryFn: async ({ queryKey }) => {
      const [, token] = queryKey;

      if (!token) {
        throw new Error("No authentication token available");
      }

      const res = await fetch("/api/profile/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        throw new Error("Session expired");
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch user: ${res.statusText}`);
      }

      return (await res.json()) as User;
    },
    enabled: auth.isAuthenticated && !!auth.jwt,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes("401") || error.message.includes("Session expired")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (error?.message.includes("Session expired")) {
      const { logout } = useAuth();
      logout();
    }
  }, [error]);

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
