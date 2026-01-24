import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Form,
  InputGroup,
  Dropdown,
} from "react-bootstrap";
import {
  Person,
  Search,
  Filter,
  SortAlphaDown,
  SortAlphaUp,
  CheckCircle,
  PersonAdd,
  Envelope,
  Shield,
} from "react-bootstrap-icons";
import { useUserManagement } from "~/hooks/useUserManagement";
import StatsCard from "~/components/Shared/StatsCard";
import DeleteUserModal from "~/components/AdminDashboard/Users/DeleteUserModal";
import UserDetailsModal from "~/components/AdminDashboard/Users/UserDetailsModal";
import EditUserModal from "~/components/AdminDashboard/Users/EditUserModal";
import CreateUserModal from "~/components/AdminDashboard/Users/CreateUserModal";
import UsersTable from "~/components/AdminDashboard/Users/UsersTable";

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

    // Forms
    editFormData,
    editFormErrors,
    setEditFormErrors,
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

      <UsersTable
        users={users}
        total={total}
        isLoading={isLoading}
        searchTerm={searchTerm}
        currentPage={currentPage}
        totalPages={totalPages}
        offset={offset}
        limit={limit}
        isDeletingUser={deleteUserMutation.isPending}
        deletingUsername={deleteUserMutation.variables}
        onViewDetails={(user) => {
          setSelectedUser(user);
          setShowDetailsModal(true);
        }}
        onEditUser={(user) => {
          setSelectedUser(user);
          setShowEditModal(true);
        }}
        onDeleteUser={(user) => {
          setSelectedUser(user);
          setShowDeleteModal(true);
        }}
        onPageChange={handlePageChange}
        onFirstPage={handleFirstPage}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onLastPage={handleLastPage}
      />

      <DeleteUserModal
        show={showDeleteModal}
        user={selectedUser}
        isDeleting={deleteUserMutation.isPending}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
      />

      <UserDetailsModal
        show={showDetailsModal}
        user={selectedUser}
        onHide={() => setShowDetailsModal(false)}
        formatDateTime={formatDateTime}
      />

      <EditUserModal
        show={showEditModal}
        user={selectedUser}
        formData={editFormData}
        formErrors={editFormErrors}
        isUpdating={updateUserMutation.isPending}
        onHide={() => setShowEditModal(false)}
        onSubmit={handleEditUser}
        onFormChange={handleEditFormChange}
        onClearErrors={() => setEditFormErrors({})}
      />

      <CreateUserModal
        show={showCreateModal}
        formData={createFormData}
        isCreating={createUserMutation.isPending}
        onHide={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
        onFormChange={handleCreateFormChange}
      />
    </Container>
  );
}
