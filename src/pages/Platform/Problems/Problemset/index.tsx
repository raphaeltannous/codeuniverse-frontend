import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
  Table,
  Pagination,
} from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import {
  Code,
  Lock,
  Globe,
  CheckCircle,
  Award,
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router';
import { useAuth } from '~/context/AuthContext';
import { useUser } from '~/context/UserContext';
import { apiFetch } from "~/utils/api";
import { ProblemDifficulty } from '~/types/problem/difficulty';
import ProblemsFilter from '~/components/Shared/ProblemFilter';
import type { Problem } from '~/types/problem/problem';
import type {
  UserProgress,
  ProblemsResponse,
  Filters,
} from '~/types/problem/problemset';
import DifficultyBadge from '~/components/Shared/DifficultyBadge';
import PremiumBadge from '~/components/Shared/PremiumBadge';

export default function PlatformProblemsProblemset() {
  const { auth } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  // State for filtering and pagination
  const [filters, setFilters] = useState<Filters>({
    difficulty: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // State for applied filters (used in query)
  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    difficulty: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [page, setPage] = useState(1);
  const limit = 10;

  // State for user progress
  const [solvedSlugs, setSolvedSlugs] = useState<Set<string>>(new Set());
  const [showOnlyPremium, setShowOnlyPremium] = useState<
    'all' | 'premium' | 'free'
  >('all');
  const [appliedShowOnlyPremium, setAppliedShowOnlyPremium] = useState<
    'all' | 'premium' | 'free'
  >('all');

  // Fetch user progress
  const { data: progressData, isLoading: isLoadingProgress } =
    useQuery<UserProgress>({
      queryKey: ['user-progress', user?.username],
      queryFn: async () => {
        if (!auth.isAuthenticated) {
          return [];
        }

        const response = await apiFetch('/api/problems/progress');

        if (!response.ok) {
          throw new Error('Failed to fetch user progress');
        }
        return response.json();
      },
      enabled: !!auth.isAuthenticated,
    });

  // Fetch problems
  const {
    data: problemsData,
    isLoading: isLoadingProblems,
    isError,
    error,
  } = useQuery<ProblemsResponse>({
    queryKey: [
      'problems',
      page,
      appliedFilters,
      appliedShowOnlyPremium,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Only add search if it's not empty
      if (appliedFilters.search.trim()) {
        params.append('search', appliedFilters.search);
      }

      // Only add difficulty if it's not 'all'
      if (appliedFilters.difficulty !== 'all') {
        params.append('difficulty', appliedFilters.difficulty.toLowerCase());
      }

      // Add sort parameters
      params.append('sortBy', appliedFilters.sortBy);
      params.append('sortOrder', appliedFilters.sortOrder);

      // Add premium filter if not 'all'
      if (appliedShowOnlyPremium !== 'all') {
        params.append(
          'premium',
          appliedShowOnlyPremium === 'premium' ? 'premium' : 'free',
        );
      }

      const response = await apiFetch(`/api/problems?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch problems');
      }
      return response.json();
    },
  });

  // Set progress data
  useEffect(() => {
    if (progressData) {
      setSolvedSlugs(new Set(progressData));
    }
  }, [progressData]);

  // Calculate totalPages
  const total = problemsData?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const problems = problemsData?.problems || [];

  // Handle filter changes
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
    setPage(1); // Reset to first page when search is performed
  };

  const handleResetFilters = () => {
    const resetFilters = {
      difficulty: 'all',
      search: '',
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    };

    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setShowOnlyPremium('all');
    setAppliedShowOnlyPremium('all');
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

  const handleShowOnlyPremiumChange = (value: 'all' | 'premium' | 'free') => {
    setShowOnlyPremium(value);
    setAppliedShowOnlyPremium(value);
    setPage(1);
  };

  const handleProblemClick = (problem: Problem) => {
    if (problem.isPremium && user && !user.isPremium && user.role !== 'admin') {
      // Redirect non-premium, non-admin users to premium page
      navigate('/premium');
      return;
    }
    navigate(`/problems/${problem.slug}`);
  };


  // Status badge component
  const getStatusBadge = (slug: string) => {
    if (solvedSlugs.has(slug)) {
      return (
        <Badge bg="success" className="px-2 py-1">
          <CheckCircle size={12} className="me-1" />
          Solved
        </Badge>
      );
    }
    return null;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isLoading = isLoadingProblems || isLoadingProgress;
  const solvedCount = solvedSlugs.size;

  if (isLoading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading problems...</p>
        </div>
      </Container>
    );
  }

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
        <h2 className="mb-1 fw-bold">Problem Set</h2>
        <p className="text-muted mb-0">
          Sharpen your coding skills with our curated collection of problems.
          {!user && ' Sign in to track your progress!'}
        </p>
      </div>

      {/* Progress Card */}
      {user && solvedCount > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex align-items-center gap-3">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                <CheckCircle size={24} className="text-success" />
              </div>
              <div>
                <h5 className="fw-bold mb-0">Your Progress</h5>
                <p className="text-muted mb-0">
                  You have solved {solvedCount} problem
                  {solvedCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                <Code size={24} className="text-primary" />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">{total}</h5>
                <p className="text-muted mb-0">Total Problems</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                <Globe size={24} className="text-success" />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">
                  {problems.filter((p) => p.isPublic).length}
                </h5>
                <p className="text-muted mb-0">Public Problems</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                <Lock size={24} className="text-warning" />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">
                  {problems.filter((p) => p.isPremium).length}
                </h5>
                <p className="text-muted mb-0">Premium Problems</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        {user && (
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                  <CheckCircle size={24} className="text-info" />
                </div>
                <div>
                  <h5 className="mb-0 fw-bold">{solvedCount}</h5>
                  <p className="text-muted mb-0">Solved</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm mb-4">
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
      <Card className="border-0 shadow-sm">
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
                {problems.length === 0 ? (
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
                          <div
                            className="mt-1 small text-truncate"
                            style={{ maxWidth: '300px' }}
                          >
                            {problem.description.substring(0, 100)}...
                          </div>
                        </div>
                      </td>
                      <td>
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </td>
                      <td>
                        <PremiumBadge status={problem.isPremium ? 'premium' : 'free'} />
                      </td>
                      <td>
                        {getStatusBadge(problem.slug)}
                        {!solvedSlugs.has(problem.slug) && user && (
                          <span className="text-muted small ms-2">
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
