import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/utils/api";
import type {
  UsersResponse,
  CreateUserData,
  UpdateUserData,
} from "~/types/admin/user";

interface UseAdminUsersParams {
  offset: number;
  limit: number;
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  verificationFilter: string;
  sortBy: "username" | "createdAt" | "email";
  sortOrder: "asc" | "desc";
  isAuthenticated: boolean;
}

interface UseAdminUsersReturn {
  usersData: UsersResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  createUserMutation: ReturnType<typeof useMutation<any, Error, CreateUserData>>;
  updateUserMutation: ReturnType<
    typeof useMutation<any, Error, { username: string; data: UpdateUserData }>
  >;
  deleteUserMutation: ReturnType<typeof useMutation<any, Error, string>>;
}

export function useAdminUsers({
  offset,
  limit,
  searchTerm,
  roleFilter,
  statusFilter,
  verificationFilter,
  sortBy,
  sortOrder,
  isAuthenticated,
}: UseAdminUsersParams): UseAdminUsersReturn {
  const queryClient = useQueryClient();

  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<UsersResponse>({
    queryKey: [
      "admin-users",
      offset,
      searchTerm,
      roleFilter,
      statusFilter,
      verificationFilter,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString(),
        search: searchTerm,
        sortBy,
        sortOrder,
      });

      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (verificationFilter !== "all")
        params.append("verified", verificationFilter);

      const response = await apiFetch(`/api/admin/users?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await apiFetch(`/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to create user: ${response.statusText}`,
        );
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      username,
      data,
    }: {
      username: string;
      data: UpdateUserData;
    }) => {
      const response = await apiFetch(`/api/admin/users/${username}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to update user: ${response.statusText}`,
        );
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiFetch(`/api/admin/users/${username}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to delete user: ${response.statusText}`,
        );
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  return {
    usersData,
    isLoading,
    isError,
    error,
    refetch,
    createUserMutation,
    updateUserMutation,
    deleteUserMutation,
  };
}
