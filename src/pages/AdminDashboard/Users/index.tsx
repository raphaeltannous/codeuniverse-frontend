import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Spinner,
  Alert,
  Form,
  InputGroup,
  Dropdown,
  Modal,
  Pagination,
  Image,
} from "react-bootstrap";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Person,
  Search,
  Filter,
  SortAlphaDown,
  SortAlphaUp,
  Eye,
  Pencil,
  Trash,
  CheckCircle,
  XCircle,
  PersonAdd,
  Envelope,
  Shield,
  Clock,
  Save,
  ExclamationTriangle,
} from "react-bootstrap-icons";
import { useAuth } from "~/context/AuthContext";

interface User {
  id: string;
  username: string;
  email: string;
  isVerified: boolean;
  isActive: boolean;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
  avatarUrl: string | null;
}

interface UsersResponse {
  users: User[];
  total: number;
  offset: number;
  limit: number;
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

interface UpdateUserData {
  username?: string;
  email?: string;
  role?: User["role"];
  isActive?: boolean;
  isVerified?: boolean;
  avatarUrl?: string | null;
}

interface EditFormErrors {
  username?: string;
  email?: string;
  role?: string;
  isActive?: string;
  isVerified?: string;
  avatarUrl?: string;
}

export default function UsersDashboard() {
  const { auth } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"username" | "createdAt" | "email">(
    "createdAt",
  );
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

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${auth.jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
    enabled: !!auth.jwt,
    staleTime: 1000 * 60 * 2,
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

    if (
      editFormData.username !== undefined &&
      editFormData.username.trim() === ""
    ) {
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

  const updateUserMutation = useMutation({
    mutationFn: async ({
      username,
      data,
    }: {
      username: string;
      data: UpdateUserData;
    }) => {
      const response = await fetch(`/api/admin/users/${username}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.jwt}`,
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
      setActionSuccess("User updated successfully");
      setShowEditModal(false);
      setEditFormErrors({});
      setTimeout(() => setActionSuccess(""), 3000);
    },
    onError: (error: Error) => {
      setActionError(error.message || "Failed to update user");
      setTimeout(() => setActionError(""), 5000);
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await fetch(`/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.jwt}`,
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

  const deleteUserMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch(`/api/admin/users/${username}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.jwt}`,
        },
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

  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.username);
    }
  };

  const handleEditUser = () => {
    if (selectedUser && editFormData) {
      if (!validateEditForm()) {
        return;
      }

      const dataToSend: UpdateUserData = {};

      if (
        editFormData.username !== undefined &&
        editFormData.username.trim() !== ""
      ) {
        dataToSend.username = editFormData.username.trim();
      }

      if (
        editFormData.email !== undefined &&
        editFormData.email.trim() !== ""
      ) {
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
        updateUserMutation.mutate({
          username: selectedUser.username,
          data: dataToSend,
        });
      } else {
        setActionError("No changes detected");
        setTimeout(() => setActionError(""), 3000);
      }
    }
  };

  const handleCreateUser = () => {
    if (
      createFormData.username &&
      createFormData.email &&
      createFormData.password
    ) {
      createUserMutation.mutate(createFormData);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadge = (role: User["role"]) => {
    const colors = {
      admin: "danger",
      user: "primary",
    };

    return (
      <Badge bg={colors[role]} className="px-2 py-1">
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge bg="success" className="px-2 py-1">
        <CheckCircle size={12} className="me-1" />
        Active
      </Badge>
    ) : (
      <Badge bg="secondary" className="px-2 py-1">
        <XCircle size={12} className="me-1" />
        Inactive
      </Badge>
    );
  };

  const getVerificationBadge = (isVerified: boolean) => {
    return isVerified ? (
      <Badge bg="info" className="px-2 py-1">
        <CheckCircle size={12} className="me-1" />
        Verified
      </Badge>
    ) : (
      <Badge bg="warning" className="px-2 py-1">
        <XCircle size={12} className="me-1" />
        Unverified
      </Badge>
    );
  };

  const getAvatar = (user: User) => {
    if (user.avatarUrl) {
      return (
        <Image
          src={`/api/static/avatars/${user.avatarUrl}`}
          alt={user.username}
          rounded
          width={50}
          height={50}
          className="me-3"
        />
      );
    }

    return (
      <div
        className="bg-primary bg-opacity-10 rounded-circle p-2 me-3 d-flex align-items-center justify-content-center"
        style={{ width: "40px", height: "40px" }}
      >
        <Person size={20} className="text-primary" />
      </div>
    );
  };

  if (isError) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Error loading users:</strong>{" "}
              {error?.message || "Unknown error"}
            </div>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  const { users = [], total = 0 } = usersData || {};

  const activeUsers = users.filter((u) => u.isActive).length;
  const verifiedUsers = users.filter((u) => u.isVerified).length;
  const adminUsers = users.filter((u) => u.role === "admin").length;

  return (
    <Container fluid className="py-4">
      {actionSuccess && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setActionSuccess("")}
          className="mb-4"
        >
          <CheckCircle size={18} className="me-2" />
          {actionSuccess}
        </Alert>
      )}

      {actionError && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setActionError("")}
          className="mb-4"
        >
          <XCircle size={18} className="me-2" />
          {actionError}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold">User Management</h2>
          <p className="text-muted mb-0">
            {total} total users • Page {currentPage} of {totalPages} • Showing{" "}
            {offset + 1} to {Math.min(offset + limit, total)} of {total}
          </p>
        </div>
        <Button
          variant="primary"
          className="d-flex align-items-center gap-2"
          onClick={() => setShowCreateModal(true)}
        >
          <PersonAdd size={18} />
          Add New User
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={3} sm={6}>
          <Card className="border-0 h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                <Person size={24} className="text-primary" />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">{total}</h5>
                <p className="text-muted mb-0">Total Users</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                <CheckCircle size={24} className="text-success" />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">{activeUsers}</h5>
                <p className="text-muted mb-0">Active Users</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                <Shield size={24} className="text-danger" />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">{adminUsers}</h5>
                <p className="text-muted mb-0">Administrators</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                <Envelope size={24} className="text-info" />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">{verifiedUsers}</h5>
                <p className="text-muted mb-0">Verified Users</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text>
                    <Search size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    type="search"
                    placeholder="Search by username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" variant="primary">
                    Search
                  </Button>
                </InputGroup>
              </Col>

              <Col md={2}>
                <Form.Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </Form.Select>
              </Col>

              <Col md={2}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Col>

              <Col md={2}>
                <Form.Select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                >
                  <option value="all">All Verifications</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </Form.Select>
              </Col>

              <Col md={2}>
                <Dropdown>
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    className="w-100"
                  >
                    <Filter size={18} className="me-2" />
                    Sort
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Header>Sort By</Dropdown.Header>
                    <Dropdown.Item onClick={() => setSortBy("username")}>
                      Username{" "}
                      {sortBy === "username" &&
                        (sortOrder === "desc" ? (
                          <SortAlphaUp className="ms-2" />
                        ) : (
                          <SortAlphaDown className="ms-2" />
                        ))}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setSortBy("email")}>
                      Email{" "}
                      {sortBy === "email" &&
                        (sortOrder === "desc" ? (
                          <SortAlphaUp className="ms-2" />
                        ) : (
                          <SortAlphaDown className="ms-2" />
                        ))}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setSortBy("createdAt")}>
                      Join Date{" "}
                      {sortBy === "createdAt" &&
                        (sortOrder === "desc" ? (
                          <SortAlphaUp className="ms-2" />
                        ) : (
                          <SortAlphaDown className="ms-2" />
                        ))}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                    >
                      {sortOrder === "asc" ? "Ascending" : "Descending"}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>

              <Col md={12}>
                <div className="d-flex justify-content-center">
                  <div className="d-flex gap-2">
                    <Badge bg="light" text="dark" className="px-3 py-2">
                      Showing {users.length} of {total} users
                    </Badge>
                    {(searchTerm ||
                      roleFilter !== "all" ||
                      statusFilter !== "all" ||
                      verificationFilter !== "all") && (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={handleResetFilters}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card className="border-0">
        <Card.Body className="p-0">
          <div className={`table-responsive ${isLoading ? "opacity-50" : ""}`}>
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Verification</th>
                  <th>Joined</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading && users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <Person size={48} className="text-muted mb-3" />
                      <h5 className="mb-2">No users found</h5>
                      <p className="text-muted mb-0">
                        {searchTerm
                          ? "Try a different search term"
                          : "No users match your filters"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {getAvatar(user)}
                          <div>
                            <div className="fw-semibold">{user.username}</div>
                            <small className="text-muted">{user.email}</small>
                            <div className="mt-1">
                              <small className="text-muted">
                                ID: {user.id.substring(0, 8)}...
                              </small>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {getRoleBadge(user.role)}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {getStatusBadge(user.isActive)}
                        </div>
                      </td>
                      <td>{getVerificationBadge(user.isVerified)}</td>
                      <td>
                        <div className="d-flex flex-column">
                          <span>{formatDate(user.createdAt)}</span>
                          <small className="text-muted">
                            <Clock size={10} className="me-1" />
                            {formatDateTime(user.createdAt)}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <span>{formatDate(user.updatedAt)}</span>
                          <small className="text-muted">
                            <Clock size={10} className="me-1" />
                            {formatDateTime(user.updatedAt)}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDetailsModal(true);
                            }}
                            title="View Details"
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            title="Edit User"
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            title="Delete User"
                            disabled={deleteUserMutation.isPending}
                          >
                            {deleteUserMutation.isPending &&
                            deleteUserMutation.variables === user.username ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <Trash size={14} />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
          {/* Loading Overlay */}
          {isLoading && (
            <div className="d-flex align-items-center justify-content-center mt-3">
              <Spinner animation="border" variant="primary" />
              <span className="ms-2">Loading users...</span>
            </div>
          )}
        </Card.Body>

        {/* Pagination with Offset */}
        {total > limit && (
          <Card.Footer className="border-0">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                Showing {offset + 1} to {Math.min(offset + limit, total)} of{" "}
                {total} users
              </div>
              <Pagination className="mb-0">
                <Pagination.First
                  onClick={handleFirstPage}
                  disabled={offset === 0}
                />
                <Pagination.Prev
                  onClick={handlePrevPage}
                  disabled={offset === 0}
                />

                {/* Generate page numbers based on offset */}
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 5;
                  const currentPageNum = currentPage;

                  let startPage = Math.max(
                    1,
                    currentPageNum - Math.floor(maxVisiblePages / 2),
                  );
                  let endPage = Math.min(
                    totalPages,
                    startPage + maxVisiblePages - 1,
                  );

                  // Adjust start page if we're near the end
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <Pagination.Item
                        key={i}
                        active={i === currentPageNum}
                        onClick={() => handlePageChange((i - 1) * limit)}
                      >
                        {i}
                      </Pagination.Item>,
                    );
                  }

                  return pages;
                })()}

                <Pagination.Next
                  onClick={handleNextPage}
                  disabled={offset + limit >= total}
                />
                <Pagination.Last
                  onClick={handleLastPage}
                  disabled={offset + limit >= total}
                />
              </Pagination>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        backdrop={deleteUserMutation.isPending ? "static" : true}
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="h5 fw-bold text-danger">
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <div className="text-center mb-3">
            <Trash size={48} className="text-danger mb-3" />
            <h5 className="fw-bold">Delete User?</h5>
            <p className="text-muted">
              This will permanently delete the user "{selectedUser?.username}".
              This action cannot be undone.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleteUserMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteUser}
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              "Delete User"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* User Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="h5 fw-bold">User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Row>
              <Col md={4} className="text-center">
                {selectedUser.avatarUrl ? (
                  <Image
                    src={`/api/static/avatars/${selectedUser.avatarUrl}`}
                    alt={selectedUser.username}
                    rounded
                    width={130}
                    height={130}
                    className="mb-3"
                  />
                ) : (
                  <div
                    className="bg-primary bg-opacity-10 rounded-circle p-4 d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "120px", height: "120px" }}
                  >
                    <Person size={48} className="text-primary" />
                  </div>
                )}
                <h5 className="fw-bold">{selectedUser.username}</h5>
                <p className="text-muted">{selectedUser.email}</p>
                <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap">
                  {getRoleBadge(selectedUser.role)}
                  {getStatusBadge(selectedUser.isActive)}
                  {getVerificationBadge(selectedUser.isVerified)}
                </div>
              </Col>
              <Col md={8}>
                <Card className="border-0">
                  <Card.Body>
                    <h6 className="fw-bold mb-3">User Information</h6>
                    <dl className="row">
                      <dt className="col-sm-4">User ID</dt>
                      <dd className="col-sm-8">
                        <code className="user-select-all">
                          {selectedUser.id}
                        </code>
                      </dd>

                      <dt className="col-sm-4">Username</dt>
                      <dd className="col-sm-8">{selectedUser.username}</dd>

                      <dt className="col-sm-4">Email Address</dt>
                      <dd className="col-sm-8">{selectedUser.email}</dd>

                      <dt className="col-sm-4">Account Status</dt>
                      <dd className="col-sm-8">
                        {selectedUser.isActive ? (
                          <span className="text-success">Active</span>
                        ) : (
                          <span className="text-danger">Inactive</span>
                        )}
                      </dd>

                      <dt className="col-sm-4">Email Verification</dt>
                      <dd className="col-sm-8">
                        {selectedUser.isVerified ? (
                          <span className="text-success">Verified</span>
                        ) : (
                          <span className="text-warning">Unverified</span>
                        )}
                      </dd>

                      <dt className="col-sm-4">Account Created</dt>
                      <dd className="col-sm-8">
                        {formatDateTime(selectedUser.createdAt)}
                      </dd>

                      <dt className="col-sm-4">Last Updated</dt>
                      <dd className="col-sm-8">
                        {formatDateTime(selectedUser.updatedAt)}
                      </dd>

                      <dt className="col-sm-4">User Role</dt>
                      <dd className="col-sm-8">
                        <span className="text-capitalize">
                          {selectedUser.role}
                        </span>
                      </dd>
                    </dl>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit User Modal with Validation */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
        backdrop={updateUserMutation.isPending ? "static" : true}
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="h5 fw-bold">Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Username</Form.Label>
                <Form.Control
                  type="text"
                  value={editFormData.username || ""}
                  onChange={(e) =>
                    handleEditFormChange("username", e.target.value)
                  }
                  placeholder="Enter username"
                  isInvalid={!!editFormErrors.username}
                  disabled={updateUserMutation.isPending}
                />
                {editFormErrors.username && (
                  <Form.Control.Feedback
                    type="invalid"
                    className="d-flex align-items-center gap-1"
                  >
                    <ExclamationTriangle size={14} />
                    {editFormErrors.username}
                  </Form.Control.Feedback>
                )}
                <Form.Text className="text-muted">
                  Current username: <strong>{selectedUser.username}</strong>
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Email</Form.Label>
                <Form.Control
                  type="email"
                  value={editFormData.email || ""}
                  onChange={(e) =>
                    handleEditFormChange("email", e.target.value)
                  }
                  placeholder="Enter email"
                  isInvalid={!!editFormErrors.email}
                  disabled={updateUserMutation.isPending}
                />
                {editFormErrors.email && (
                  <Form.Control.Feedback
                    type="invalid"
                    className="d-flex align-items-center gap-1"
                  >
                    <ExclamationTriangle size={14} />
                    {editFormErrors.email}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Role</Form.Label>
                    <Form.Select
                      value={editFormData.role || "user"}
                      onChange={(e) =>
                        handleEditFormChange("role", e.target.value)
                      }
                      disabled={updateUserMutation.isPending}
                    >
                      <option value="user">User</option>
                      <option value="admin">Administrator</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Status</Form.Label>
                    <Form.Select
                      value={editFormData.isActive?.toString() || "true"}
                      onChange={(e) =>
                        handleEditFormChange(
                          "isActive",
                          e.target.value === "true",
                        )
                      }
                      disabled={updateUserMutation.isPending}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Email Verification
                </Form.Label>
                <Form.Select
                  value={editFormData.isVerified?.toString() || "false"}
                  onChange={(e) =>
                    handleEditFormChange(
                      "isVerified",
                      e.target.value === "true",
                    )
                  }
                  disabled={updateUserMutation.isPending}
                >
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Avatar URL</Form.Label>
                <Form.Control
                  type="text"
                  value={editFormData.avatarUrl || ""}
                  onChange={(e) =>
                    handleEditFormChange("avatarUrl", e.target.value)
                  }
                  placeholder="https://example.com/avatar.jpg"
                  isInvalid={!!editFormErrors.avatarUrl}
                  disabled={updateUserMutation.isPending}
                />
                {editFormErrors.avatarUrl && (
                  <Form.Control.Feedback
                    type="invalid"
                    className="d-flex align-items-center gap-1"
                  >
                    <ExclamationTriangle size={14} />
                    {editFormErrors.avatarUrl}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowEditModal(false);
              setEditFormErrors({});
            }}
            disabled={updateUserMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleEditUser}
            disabled={
              updateUserMutation.isPending ||
              Object.keys(editFormErrors).length > 0
            }
          >
            {updateUserMutation.isPending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="me-2" />
                Save Changes
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create User Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
        backdrop={createUserMutation.isPending ? "static" : true}
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="h5 fw-bold">Create New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Username *</Form.Label>
              <Form.Control
                type="text"
                value={createFormData.username}
                onChange={(e) =>
                  handleCreateFormChange("username", e.target.value)
                }
                placeholder="Enter username"
                required
                disabled={createUserMutation.isPending}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                value={createFormData.email}
                onChange={(e) =>
                  handleCreateFormChange("email", e.target.value)
                }
                placeholder="Enter email"
                required
                disabled={createUserMutation.isPending}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password *</Form.Label>
              <Form.Control
                type="password"
                value={createFormData.password}
                onChange={(e) =>
                  handleCreateFormChange("password", e.target.value)
                }
                placeholder="Enter password"
                required
                disabled={createUserMutation.isPending}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={createFormData.role}
                    onChange={(e) =>
                      handleCreateFormChange("role", e.target.value)
                    }
                    disabled={createUserMutation.isPending}
                  >
                    <option value="user">User</option>
                    <option value="admin">Administrator</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={createFormData.isActive.toString()}
                    onChange={(e) =>
                      handleCreateFormChange(
                        "isActive",
                        e.target.value === "true",
                      )
                    }
                    disabled={createUserMutation.isPending}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email Verification</Form.Label>
              <Form.Select
                value={createFormData.isVerified.toString()}
                onChange={(e) =>
                  handleCreateFormChange(
                    "isVerified",
                    e.target.value === "true",
                  )
                }
                disabled={createUserMutation.isPending}
              >
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            onClick={() => setShowCreateModal(false)}
            disabled={createUserMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateUser}
            disabled={createUserMutation.isPending}
          >
            {createUserMutation.isPending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              <>
                <PersonAdd size={16} className="me-2" />
                Create User
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
