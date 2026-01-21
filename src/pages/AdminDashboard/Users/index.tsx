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
import { useUserManagement } from "~/hooks/useUserManagement";
import StatsCard from "~/components/Shared/StatsCard";

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
  avatarUrl: string | null;
}

export default function UsersDashboard() {
  const {
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
  } = useUserManagement();

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

  const getPremiumBadge = (premiumStatus: User["premiumStatus"]) => {
    if (premiumStatus === "premium") {
      return (
        <Badge bg="success" className="px-2 py-1">
          Premium
        </Badge>
      );
    } else if (premiumStatus === "canceled") {
      return (
        <Badge bg="secondary" className="px-2 py-1">
          Canceled
        </Badge>
      );
    }
    return (
      <Badge bg="light" text="dark" className="px-2 py-1">
        Free
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
          <StatsCard
            icon={Person}
            iconColor="text-primary"
            bgColorClass="bg-primary"
            value={total}
            label="Total Users"
          />
        </Col>
        <Col md={3} sm={6}>
          <StatsCard
            icon={CheckCircle}
            iconColor="text-success"
            bgColorClass="bg-success"
            value={activeUsers}
            label="Active Users"
          />
        </Col>
        <Col md={3} sm={6}>
          <StatsCard
            icon={Shield}
            iconColor="text-danger"
            bgColorClass="bg-danger"
            value={adminUsers}
            label="Administrators"
          />
        </Col>
        <Col md={3} sm={6}>
          <StatsCard
            icon={Envelope}
            iconColor="text-info"
            bgColorClass="bg-info"
            value={verifiedUsers}
            label="Verified Users"
          />
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
                  <th>Premium</th>
                  <th>Joined</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading && users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5">
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
                      <td>{getPremiumBadge(user.premiumStatus)}</td>
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

                      <dt className="col-sm-4">Premium Status</dt>
                      <dd className="col-sm-8">{getPremiumBadge(selectedUser.premiumStatus)}</dd>

                      {selectedUser.stripeCustomerId && (
                        <>
                          <dt className="col-sm-4">Stripe Customer ID</dt>
                          <dd className="col-sm-8">
                            <code className="user-select-all">
                              {selectedUser.stripeCustomerId}
                            </code>
                          </dd>
                        </>
                      )}
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
