import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Form,
  InputGroup,
  Badge,
  Table,
  Pagination,
} from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  SortAlphaDown,
  SortAlphaUp,
  Code,
  Lock,
  Globe,
  CheckCircle,
  Award,
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router';
import { useAuth } from '~/context/AuthContext';
import { useUser } from '~/context/UserContext';
import { ProblemDifficulty } from '~/types/problem/difficulty';
import type { Problem } from '~/types/problem';
import type {
  UserProgress,
  ProblemsResponse,
  Filters,
} from '~/types/problem/problemset';

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
        if (!auth.jwt) {
          return [];
        }

        const response = await fetch('/api/problems/progress', {
          headers: {
            Authorization: `Bearer ${auth.jwt}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user progress');
        }
        return response.json();
      },
      enabled: !!auth?.jwt,
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

      const response = await fetch(`/api/problems?${params}`, {
        headers: auth.jwt
          ? {
              Authorization: `Bearer ${auth.jwt}`,
            }
          : {},
      });

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
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilters(filters);
    setAppliedShowOnlyPremium(showOnlyPremium);
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

  const handleSort = (field: 'title' | 'createdAt') => {
    const newSortOrder: 'asc' | 'desc' =
      appliedFilters.sortBy === field
        ? appliedFilters.sortOrder === 'asc'
          ? 'desc'
          : 'asc'
        : 'desc';

    const newFilters: Filters = {
      ...appliedFilters,
      sortBy: field,
      sortOrder: newSortOrder,
    };
    setFilters(newFilters);
    setAppliedFilters(newFilters);
    setPage(1);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setAppliedShowOnlyPremium(showOnlyPremium);
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

  // Difficulty badge component
  const getDifficultyBadge = (difficulty: ProblemDifficulty) => {
    const difficultyColors = {
      [ProblemDifficulty.Easy]: 'success',
      [ProblemDifficulty.Medium]: 'warning',
      [ProblemDifficulty.Hard]: 'danger',
    };

    return (
      <Badge
        bg={difficultyColors[difficulty]}
        className="px-2 py-1 d-flex align-items-center gap-1"
        style={{ fontSize: '0.85rem' }}
      >
        <Award size={12} />
        {difficulty}
      </Badge>
    );
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

  // Premium badge
  const getPremiumBadge = (isPremium: boolean) => {
    return isPremium ? (
      <Badge bg="warning" className="px-2 py-1">
        <Lock size={12} className="me-1" />
        Premium
      </Badge>
    ) : (
      <Badge bg="success" className="px-2 py-1">
        <Globe size={12} className="me-1" />
        Free
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Check if filters have changed
  const hasFilterChanges = () => {
    return (
      filters.search !== appliedFilters.search ||
      filters.difficulty !== appliedFilters.difficulty ||
      filters.sortBy !== appliedFilters.sortBy ||
      filters.sortOrder !== appliedFilters.sortOrder ||
      showOnlyPremium !== appliedShowOnlyPremium
    );
  };

  // Get difficulty options from the imported enum
  const difficultyOptions = Object.values(ProblemDifficulty);

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
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text>
                    <Search size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    type="search"
                    placeholder="Search problems..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange('search', e.target.value)
                    }
                  />
                  <Button
                    type="submit"
                    variant={hasFilterChanges() ? 'primary' : 'secondary'}
                    disabled={!hasFilterChanges()}
                  >
                    Search
                  </Button>
                </InputGroup>
              </Col>

              <Col md={2}>
                <Form.Select
                  value={filters.difficulty}
                  onChange={(e) =>
                    handleFilterChange('difficulty', e.target.value)
                  }
                >
                  <option value="all">All Difficulties</option>
                  {difficultyOptions.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={2}>
                <Form.Select
                  value={showOnlyPremium}
                  onChange={(e) =>
                    setShowOnlyPremium(
                      e.target.value as 'all' | 'premium' | 'free',
                    )
                  }
                >
                  <option value="all">All Problems</option>
                  <option value="free">Free Only</option>
                  <option value="premium">Premium Only</option>
                </Form.Select>
              </Col>

              <Col md={4}>
                <div className="d-flex gap-2 align-items-center">
                  <small className="text-muted">Sort by:</small>
                  <div className="btn-group">
                    <Button
                      variant={
                        appliedFilters.sortBy === 'title'
                          ? 'primary'
                          : 'outline-primary'
                      }
                      size="sm"
                      onClick={() => handleSort('title')}
                    >
                      Title{' '}
                      {appliedFilters.sortBy === 'title' &&
                        (appliedFilters.sortOrder === 'asc' ? (
                          <SortAlphaUp className="ms-1" />
                        ) : (
                          <SortAlphaDown className="ms-1" />
                        ))}
                    </Button>
                    <Button
                      variant={
                        appliedFilters.sortBy === 'createdAt'
                          ? 'primary'
                          : 'outline-primary'
                      }
                      size="sm"
                      onClick={() => handleSort('createdAt')}
                    >
                      Date Created{' '}
                      {appliedFilters.sortBy === 'createdAt' &&
                        (appliedFilters.sortOrder === 'asc' ? (
                          <SortAlphaUp className="ms-1" />
                        ) : (
                          <SortAlphaDown className="ms-1" />
                        ))}
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex gap-2">
                    <Badge bg="light" text="dark" className="px-3 py-2">
                      {total} problems • Page {page} of {totalPages}
                    </Badge>
                    {(appliedFilters.search ||
                      appliedFilters.difficulty !== 'all' ||
                      appliedShowOnlyPremium !== 'all') && (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={handleResetFilters}
                      >
                        Clear Filters
                      </Button>
                    )}
                    {hasFilterChanges() && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleApplyFilters}
                      >
                        Apply Filters
                      </Button>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </Form>
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
                      <td>{getDifficultyBadge(problem.difficulty)}</td>
                      <td>{getPremiumBadge(problem.isPremium)}</td>
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
