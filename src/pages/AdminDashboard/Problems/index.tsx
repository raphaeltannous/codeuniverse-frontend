import { useState, Activity } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Table,
  Modal,
  Pagination,
} from 'react-bootstrap';
import {
  Plus,
  Pencil,
  Trash,
  Code,
  Lock,
  Globe,
  ListTask,
} from 'react-bootstrap-icons';
import { Link } from 'react-router';
import { useAdminProblems } from '~/hooks/useAdminProblems';
import ProblemsFilter from '~/components/Shared/ProblemFilter';
import StatsCard from '~/components/Shared/StatsCard';
import DifficultyBadge from '~/components/Shared/DifficultyBadge';
import VisibilityBadge from '~/components/Shared/VisibilityBadge';
import PremiumBadge from '~/components/Shared/PremiumBadge';
import ProblemsListSkeleton from '~/components/AdminDashboard/Problems/ProblemsListSkeleton';
import CreateProblemModal from '~/components/AdminDashboard/Problems/CreateProblemModal';
import type { Filters } from '~/types/problem/problemset';

export default function ProblemsDashboard() {  
  // State for filtering and pagination
  const [filters, setFilters] = useState<Filters>({
    difficulty: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    difficulty: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [showOnlyPremium, setShowOnlyPremium] = useState<'all' | 'premium' | 'free'>('all');
  const [appliedShowOnlyPremium, setAppliedShowOnlyPremium] = useState<'all' | 'premium' | 'free'>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [appliedVisibilityFilter, setAppliedVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState<string | null>(null);


  const {
    problems,
    total,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    createProblemMutation,
    updateProblemMutation,
    deleteProblemMutation,
  } = useAdminProblems({
    page,
    limit,
    filters: appliedFilters,
    showOnlyPremium: appliedShowOnlyPremium,
    visibilityFilter: appliedVisibilityFilter,
    onCreateSuccess: () => {
      setShowCreateModal(false);
    },
    onDeleteSuccess: () => {
      setShowDeleteModal(false);
      setProblemToDelete(null);
      // Navigate back to previous page if we deleted the last problem on a non-first page
      if (page > 1 && problems.length === 1) {
        setPage(page - 1);
      }
    },
  });

  const handleDelete = (slug: string) => {
    setProblemToDelete(slug);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (problemToDelete) {
      deleteProblemMutation.mutate(problemToDelete);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...appliedFilters, [key]: value };
    setFilters(newFilters);
    if (key === 'difficulty') {
      setAppliedFilters(newFilters);
      setPage(1);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleResetFilters = () => {
    const resetFilters: Filters = {
      difficulty: 'all',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setShowOnlyPremium('all');
    setAppliedShowOnlyPremium('all');
    setVisibilityFilter('all');
    setAppliedVisibilityFilter('all');
    setPage(1);
  };

  const handleShowOnlyPremiumChange = (value: 'all' | 'premium' | 'free') => {
    setShowOnlyPremium(value);
    setAppliedShowOnlyPremium(value);
    setPage(1);
  };

  const handleVisibilityFilterChange = (value: 'all' | 'public' | 'private') => {
    setVisibilityFilter(value);
    setAppliedVisibilityFilter(value);
    setPage(1);
  };

  const handleSortByChange = (value: string) => {
    const newSortBy = value as 'title' | 'createdAt';
    const newSortOrder: 'asc' | 'desc' =
      appliedFilters.sortBy === newSortBy
        ? appliedFilters.sortOrder === 'asc'
          ? 'desc'
          : 'asc'
        : 'desc';

    const newFilters: Filters = {
      ...appliedFilters,
      sortBy: newSortBy,
      sortOrder: newSortOrder,
    };
    setFilters(newFilters);
    setAppliedFilters(newFilters);
    setPage(1);
  };

  const handleSortOrderChange = (value: string) => {
    const newSortOrder = value as 'asc' | 'desc';
    const newFilters: Filters = {
      ...appliedFilters,
      sortOrder: newSortOrder,
    };
    setFilters(newFilters);
    setAppliedFilters(newFilters);
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isError) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Error loading problems:</strong> {error?.message || 'Unknown error'}
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

  const problemToDeleteData = problems.find(p => p.slug === problemToDelete);

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold">Problem Management</h2>
          <p className="text-muted mb-0">Create, edit, and manage coding problems</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          disabled={createProblemMutation.isPending || updateProblemMutation.isPending}
          className="d-flex align-items-center gap-2"
        >
          <Plus size={18} />
          Create Problem
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6}>
          <StatsCard
            icon={Code}
            iconColor="text-primary"
            bgColorClass="bg-primary"
            value={total}
            label="Total Problems"
            isLoading={isLoading}
          />
        </Col>
        <Col md={3} sm={6}>
          <StatsCard
            icon={Globe}
            iconColor="text-success"
            bgColorClass="bg-success"
            value={problems.filter(p => p.isPublic).length}
            label="Public Problems"
            isLoading={isLoading}
          />
        </Col>
        <Col md={3} sm={6}>
          <StatsCard
            icon={Lock}
            iconColor="text-warning"
            bgColorClass="bg-warning"
            value={problems.filter(p => p.isPremium).length}
            label="Premium Problems"
            isLoading={isLoading}
          />
        </Col>
        <Col md={3} sm={6}>
          <StatsCard
            icon={ListTask}
            iconColor="text-info"
            bgColorClass="bg-info"
            value={problems.reduce((acc, p) => acc + (p.testcases?.testcases?.length || 0), 0)}
            label="Total Test Cases"
            isLoading={isLoading}
          />
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="border-0 mb-4">
        <Card.Body>
          <ProblemsFilter
            filters={filters}
            appliedFilters={appliedFilters}
            showOnlyPremium={showOnlyPremium}
            appliedShowOnlyPremium={appliedShowOnlyPremium}
            total={total}
            page={page}
            totalPages={totalPages}
            onFilterChange={handleFilterChange}
            onShowOnlyPremiumChange={handleShowOnlyPremiumChange}
            onSearch={handleSearch}
            onResetFilters={handleResetFilters}
            onSortByChange={handleSortByChange}
            onSortOrderChange={handleSortOrderChange}
            showAdminFilters={true}
            visibilityFilter={visibilityFilter}
            appliedVisibilityFilter={appliedVisibilityFilter}
            onVisibilityFilterChange={handleVisibilityFilterChange}
          />
        </Card.Body>
      </Card>

      <Activity mode={isLoading ? "visible" : "hidden"}>
        <ProblemsListSkeleton />
      </Activity>
      <Activity mode={isLoading ? "hidden" : "visible"}>
        {/* Problems Table */}
        <Card className="border-0">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Difficulty</th>
                  <th>Access</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5">
                      <Code size={48} className="text-muted mb-3" />
                      <h5 className="mb-2">No problems found</h5>
                      <p className="text-muted mb-0">
                        {appliedFilters.search ? 'Try a different search term' : 'No problems match your filters'}
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => setShowCreateModal(true)}
                        className="mt-3"
                      >
                        <Plus size={18} className="me-2" />
                        Create Your First Problem
                      </Button>
                    </td>
                  </tr>
                ) : (
                  problems.map((problem) => (
                    <tr key={problem.id}>
                      <td>
                        <div>
                          <div className="fw-semibold">{problem.title}</div>
                          <small className="text-muted">/{problem.slug}</small>
                          <div className="mt-1 small text-truncate" style={{ maxWidth: '300px' }}>
                            {problem.description.substring(0, 100)}...
                          </div>
                        </div>
                      </td>
                      <td>
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <VisibilityBadge isPublic={problem.isPublic} />
                          <PremiumBadge isPremium={problem.isPremium} />
                        </div>
                      </td>
                      <td>
                        <div className="small text-muted">
                          {formatDate(problem.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Link to={`/dashboard/problems/${problem.slug}/edit`} className="btn btn-outline-info" title="Edit Problem">
                            <Pencil size={14}/>
                          </Link>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(problem.slug)}
                            disabled={deleteProblemMutation.isPending}
                            title="Delete Problem"
                          >
                            {deleteProblemMutation.isPending && deleteProblemMutation.variables === problem.slug ? (
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
        </Card.Body>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card.Footer className="border-0">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} problems
              </div>
              <Pagination className="mb-0">
                <Pagination.Prev
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                />

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === page}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}

                <Pagination.Next
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                />
              </Pagination>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Create Problem Modal */}
      <CreateProblemModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={(data) => createProblemMutation.mutate(data)}
        isCreating={createProblemMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => !deleteProblemMutation.isPending && setShowDeleteModal(false)}
        centered
        backdrop={deleteProblemMutation.isPending ? 'static' : true}
      >
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold text-danger">
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <div className="text-center mb-3">
            <Trash size={48} className="text-danger mb-3" />
            <h5 className="fw-bold">Are you sure?</h5>
            <p className="text-muted">
              This will permanently delete the problem "{problemToDeleteData?.title}".
              This action cannot be undone.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleteProblemMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={deleteProblemMutation.isPending}
          >
            {deleteProblemMutation.isPending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete Problem'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      </Activity>
    </Container>
  );
}
