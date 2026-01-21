import { useState, useEffect } from "react";
import { useAdminUsers } from "./useAdminUsers";
import { useAuth } from "~/context/AuthContext";

interface User {
  id: string;
  username: string;
  email: string;
  isVerified: boolean;
  isActive: boolean;
  stripeCustomerId: string | null;
  premiumStatus: "none" | "premium" | "canceled" | null;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string | null;
}

interface UpdateUserData {
  username?: string;
  email?: string;
  role?: User["role"];
  isActive?: boolean;
  isVerified?: boolean;
  avatarUrl?: string | null;
}

interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: User["role"];
  isActive: boolean;
  isVerified: boolean;
  avatarUrl?: string;
}

interface EditFormErrors {
  username?: string;
  email?: string;
  role?: string;
  isActive?: string;
  isVerified?: string;
  avatarUrl?: string;
}

export function useUserManagement() {
  const { auth } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"username" | "createdAt" | "email">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  const [editFormData, setEditFormData] = useState<UpdateUserData>({});
  const [editFormErrors, setEditFormErrors] = useState<EditFormErrors>({});
  const [createFormData, setCreateFormData] = useState<CreateUserData>({
    username: "",
    email: "",
    password: "",
    role: "user",
    isActive: true,
    isVerified: false,
    avatarUrl: "",
  });

  const {
    usersData,
    isLoading,
    isError,
    error,
    refetch,
    createUserMutation,
    updateUserMutation,
    deleteUserMutation,
  } = useAdminUsers({
    offset,
    limit,
    searchTerm,
    roleFilter,
    statusFilter,
    verificationFilter,
    sortBy,
    sortOrder,
    isAuthenticated: !!auth.isAuthenticated,
  });

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = usersData?.total ? Math.ceil(usersData.total / limit) : 1;

  useEffect(() => {
    if (selectedUser) {
      setEditFormData({
        username: selectedUser.username,
        email: selectedUser.email,
        role: selectedUser.role,
        isActive: selectedUser.isActive,
        isVerified: selectedUser.isVerified,
        avatarUrl: selectedUser.avatarUrl,
      });
      setEditFormErrors({});
    }
  }, [selectedUser]);

  const validateEditForm = (): boolean => {
    const errors: EditFormErrors = {};

    if (editFormData.username !== undefined && editFormData.username.trim() === "") {
      errors.username = "Username is required";
    }

    if (editFormData.email !== undefined && editFormData.email.trim() === "") {
      errors.email = "Email is required";
    } else if (
      editFormData.email !== undefined &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)
    ) {
      errors.email = "Invalid email format";
    }

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.username, {
        onSuccess: () => {
          setShowDeleteModal(false);
          setSelectedUser(null);
          setActionSuccess("User deleted successfully");
          setTimeout(() => setActionSuccess(""), 3000);
        },
        onError: (error: Error) => {
          setActionError(error.message || "Failed to delete user");
          setTimeout(() => setActionError(""), 5000);
        },
      });
    }
  };

  const handleEditUser = () => {
    if (selectedUser && editFormData) {
      if (!validateEditForm()) {
        return;
      }

      const dataToSend: UpdateUserData = {};

      if (editFormData.username !== undefined && editFormData.username.trim() !== "") {
        dataToSend.username = editFormData.username.trim();
      }

      if (editFormData.email !== undefined && editFormData.email.trim() !== "") {
        dataToSend.email = editFormData.email.trim();
      }

      if (editFormData.role !== undefined) {
        dataToSend.role = editFormData.role;
      }

      if (editFormData.isActive !== undefined) {
        dataToSend.isActive = editFormData.isActive;
      }

      if (editFormData.isVerified !== undefined) {
        dataToSend.isVerified = editFormData.isVerified;
      }

      if (editFormData.avatarUrl !== undefined) {
        dataToSend.avatarUrl = editFormData.avatarUrl?.trim() || null;
      }

      if (Object.keys(dataToSend).length > 0) {
        updateUserMutation.mutate(
          {
            username: selectedUser.username,
            data: dataToSend,
          },
          {
            onSuccess: () => {
              setActionSuccess("User updated successfully");
              setShowEditModal(false);
              setEditFormErrors({});
              setTimeout(() => setActionSuccess(""), 3000);
            },
            onError: (error: Error) => {
              setActionError(error.message || "Failed to update user");
              setTimeout(() => setActionError(""), 5000);
            },
          }
        );
      } else {
        setActionError("No changes detected");
        setTimeout(() => setActionError(""), 3000);
      }
    }
  };

  const handleCreateUser = () => {
    if (createFormData.username && createFormData.email && createFormData.password) {
      createUserMutation.mutate(createFormData, {
        onSuccess: () => {
          setActionSuccess("User created successfully");
          setShowCreateModal(false);
          setCreateFormData({
            username: "",
            email: "",
            password: "",
            role: "user",
            isActive: true,
            isVerified: false,
            avatarUrl: "",
          });
          setTimeout(() => setActionSuccess(""), 3000);
        },
        onError: (error: Error) => {
          setActionError(error.message || "Failed to create user");
          setTimeout(() => setActionError(""), 5000);
        },
      });
    } else {
      setActionError("Username, email, and password are required");
      setTimeout(() => setActionError(""), 5000);
    }
  };

  const handleEditFormChange = (field: keyof UpdateUserData, value: any) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (editFormErrors[field as keyof EditFormErrors]) {
      setEditFormErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleCreateFormChange = (field: keyof CreateUserData, value: any) => {
    setCreateFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setVerificationFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setOffset(0);
  };

  const handlePageChange = (newOffset: number) => {
    setOffset(Math.max(0, newOffset));
  };

  const handleFirstPage = () => setOffset(0);
  const handlePrevPage = () => setOffset(Math.max(0, offset - limit));
  const handleNextPage = () => {
    if (usersData && offset + limit < usersData.total) {
      setOffset(offset + limit);
    }
  };
  const handleLastPage = () => {
    if (usersData) {
      setOffset(Math.floor((usersData.total - 1) / limit) * limit);
    }
  };

  return {
    // Data
    usersData,
    isLoading,
    isError,
    error,
    refetch,
    
    // Pagination
    currentPage,
    totalPages,
    offset,
    limit,
    
    // Filters
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    verificationFilter,
    setVerificationFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    
    // Modals
    selectedUser,
    setSelectedUser,
    showDeleteModal,
    setShowDeleteModal,
    showEditModal,
    setShowEditModal,
    showDetailsModal,
    setShowDetailsModal,
    showCreateModal,
    setShowCreateModal,
    
    // Messages
    actionSuccess,
    setActionSuccess,
    actionError,
    setActionError,
    
    // Forms
    editFormData,
    editFormErrors,
    createFormData,
    
    // Mutations
    deleteUserMutation,
    updateUserMutation,
    createUserMutation,
    
    // Handlers
    handleDeleteUser,
    handleEditUser,
    handleCreateUser,
    handleEditFormChange,
    handleCreateFormChange,
    handleSearch,
    handleResetFilters,
    handlePageChange,
    handleFirstPage,
    handlePrevPage,
    handleNextPage,
    handleLastPage,
  };
}
