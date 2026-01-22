import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Badge,
  Table,
  Pagination,
} from 'react-bootstrap';
import {
  Code,
  Lock,
  CheckCircle,
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router';
import { useUser } from '~/context/UserContext';
import ProblemsFilter from '~/components/Shared/ProblemFilter';
import StatsCard from '~/components/Shared/StatsCard';
import { ProblemTableSkeleton } from '~/components/Platform/Problems/ProblemsetSkeleton';
import { useProblemset } from '~/hooks/useProblemset';
import type { Problem } from '~/types/problem/problem';
import DifficultyBadge from '~/components/Shared/DifficultyBadge';
import PremiumBadge from '~/components/Shared/PremiumBadge';
import StatusBadge from '~/components/Shared/StatusBadge';

export default function PlatformProblemsProblemset() {
  const { user } = useUser();
  const navigate = useNavigate();
  const limit = 10;

  const {
    problems,
    total,
    totalPages,
    solvedSlugs,
    filters,
    appliedFilters,
    page,
    showOnlyPremium,
    appliedShowOnlyPremium,
    isLoading,
    isError,
    error,
    setPage,
    handleFilterChange,
    handleSearch,
    handleResetFilters,
    handleSortByChange,
    handleSortOrderChange,
    handleShowOnlyPremiumChange,
    solvedCount,
  } = useProblemset({ limit });



  const handleProblemClick = (problem: Problem) => {
    navigate(`/problems/${problem.slug}`);
  };


  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isError) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Error loading problems:</strong>{' '}
              {error?.message || 'Unknown error'}
            </div>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="mb-1 fw-bold">Problems</h2>
        <p className="text-muted mb-0">
          Sharpen your coding skills with our curated collection of problems.
        </p>
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
            icon={Lock}
            iconColor="text-warning"
            bgColorClass="bg-warning"
            value={problems.filter((p) => p.isPremium).length}
            label="Premium Problems"
            isLoading={isLoading}
          />
        </Col>
        {user && (
          <Col md={3} sm={6}>
            <StatsCard
              icon={CheckCircle}
              iconColor="text-info"
              bgColorClass="bg-info"
              value={solvedCount}
              label="Solved"
              isLoading={isLoading}
            />
          </Col>
        )}
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
          />
        </Card.Body>
      </Card>

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
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <ProblemTableSkeleton />
                ) : problems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5">
                      <Code size={48} className="text-muted mb-3" />
                      <h5 className="mb-2">No problems found</h5>
                      <p className="text-muted mb-0">
                        {appliedFilters.search
                          ? 'Try a different search term'
                          : 'No problems match your filters'}
                      </p>
                      {appliedFilters.search && (
                        <Button
                          variant="outline-primary"
                          onClick={handleResetFilters}
                          className="mt-3"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  problems.map((problem) => (
                    <tr
                      key={problem.id}
                      onClick={() => handleProblemClick(problem)}
                      className="cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div>
                          <div className="fw-semibold">{problem.title}</div>
                          <small className="text-muted">/{problem.slug}</small>
                        </div>
                      </td>
                      <td>
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </td>
                      <td>
                        <PremiumBadge isPremium={problem.isPremium}/>
                      </td>
                      <td>
                        <StatusBadge isSolved={solvedSlugs.has(problem.slug)} />
                        {!solvedSlugs.has(problem.slug) && user && (
                          <span className="text-muted small">
                            Not solved
                          </span>
                        )}
                        {!user && (
                          <span className="text-muted small">
                            Sign in to track
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="small text-muted">
                          {formatDate(problem.createdAt)}
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
                Showing {(page - 1) * limit + 1} to{' '}
                {Math.min(page * limit, total)} of {total} problems
              </div>
              <Pagination className="mb-0">
                <Pagination.Prev
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                />
              </Pagination>
            </div>
          </Card.Footer>
        )}
      </Card>
    </Container>
  );
}
