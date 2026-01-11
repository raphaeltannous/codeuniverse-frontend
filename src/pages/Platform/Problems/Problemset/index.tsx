import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
  InputGroup,
  Table,
  Pagination,
  Spinner,
  Alert,
  ProgressBar,
  ListGroup,
} from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Filter,
  SortAlphaDown,
  SortAlphaUp,
  Code,
  Lock,
  Globe,
  Award,
  CheckCircle,
  Clock,
  GraphUp,
  BarChart,
  Star,
  StarFill,
  Book,
  Bullseye,
} from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { ProblemDifficulty } from "~/types/problem/difficulty";

// Interfaces
interface ProblemBasic {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: ProblemDifficulty;
  isPremium: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserProgress {
  totalProblems: number;
  solvedProblems: number;
  attemptedProblems: number;
  completionRate: number;
  difficultyBreakdown: {
    [ProblemDifficulty.Easy]: { solved: number; total: number };
    [ProblemDifficulty.Medium]: { solved: number; total: number };
    [ProblemDifficulty.Hard]: { solved: number; total: number };
  };
  solvedSlugs: string[]; // Array of solved problem slugs
}

interface ProblemWithProgress extends ProblemBasic {
  isSolved: boolean;
  isAttempted: boolean;
  lastAttempted?: string;
  successRate?: number;
  popularity?: number;
  acceptanceRate?: number;
}

interface ProblemsResponse {
  problems: ProblemWithProgress[];
  total: number;
  page: number;
  limit: number;
}

interface Filters {
  difficulty: string;
  search: string;
  sortBy: "title" | "createdAt";
  sortOrder: "asc" | "desc";
}

export default function PlatformProblemsProblemset() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  // State for filtering and pagination
  const [filters, setFilters] = useState<Filters>({
    difficulty: "all",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // State for applied filters (used in query)
  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    difficulty: "all",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [page, setPage] = useState(1);
  const limit = 15;

  // State for user progress
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [recentlySolved, setRecentlySolved] = useState<ProblemWithProgress[]>(
    [],
  );
  const [solvedSlugs, setSolvedSlugs] = useState<Set<string>>(new Set());
  const [showOnlyPremium, setShowOnlyPremium] = useState<
    "all" | "premium" | "free"
  >("all");
  const [appliedShowOnlyPremium, setAppliedShowOnlyPremium] = useState<
    "all" | "premium" | "free"
  >("all");

  // Fetch user progress
  const { data: progressData, isLoading: isLoadingProgress } =
    useQuery<UserProgress>({
      queryKey: ["user-progress", auth?.user?.id],
      queryFn: async () => {
        if (!auth?.jwt) {
          return {
            totalProblems: 0,
            solvedProblems: 0,
            attemptedProblems: 0,
            completionRate: 0,
            difficultyBreakdown: {
              [ProblemDifficulty.Easy]: { solved: 0, total: 0 },
              [ProblemDifficulty.Medium]: { solved: 0, total: 0 },
              [ProblemDifficulty.Hard]: { solved: 0, total: 0 },
            },
            solvedSlugs: [],
          };
        }

        const response = await fetch("/api/problems/progress", {
          headers: {
            Authorization: `Bearer ${auth.jwt}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user progress");
        }
        return response.json();
      },
      enabled: !!auth?.jwt,
    });

  // Fetch problems with progress
  const {
    data: problemsData,
    isLoading: isLoadingProblems,
    isError,
    error,
  } = useQuery<ProblemsResponse>({
    queryKey: [
      "problems-with-progress",
      page,
      appliedFilters,
      appliedShowOnlyPremium,
      solvedSlugs,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Only add search if it's not empty
      if (appliedFilters.search.trim()) {
        params.append("search", appliedFilters.search);
      }

      // Only add difficulty if it's not 'all'
      if (appliedFilters.difficulty !== "all") {
        params.append("difficulty", appliedFilters.difficulty.toLowerCase());
      }

      // Add sort parameters
      params.append("sortBy", appliedFilters.sortBy);
      params.append("sortOrder", appliedFilters.sortOrder);

      // Add premium filter if not 'all'
      if (appliedShowOnlyPremium !== "all") {
        params.append(
          "isPremium",
          appliedShowOnlyPremium === "premium" ? "true" : "false",
        );
      }

      const response = await fetch(`/api/problems?${params}`, {
        headers: auth?.jwt
          ? {
              Authorization: `Bearer ${auth.jwt}`,
            }
          : {},
      });

      if (!response.ok) {
        throw new Error("Failed to fetch problems");
      }
      return response.json();
    },
  });

  // Set progress data
  useEffect(() => {
    if (progressData) {
      setUserProgress(progressData);
      setSolvedSlugs(new Set(progressData.solvedSlugs));

      // Set recently solved problems (last 5 solved problems)
      if (problemsData?.problems) {
        const solvedProblems = problemsData.problems.filter((p) =>
          solvedSlugs.has(p.slug),
        );
        const recentlySolvedProblems = solvedProblems
          .sort(
            (a, b) =>
              new Date(b.lastAttempted || "").getTime() -
              new Date(a.lastAttempted || "").getTime(),
          )
          .slice(0, 5);
        setRecentlySolved(recentlySolvedProblems);
      }
    }
  }, [progressData, problemsData, solvedSlugs]);

  // Calculate totalPages
  const total = problemsData?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const problems = problemsData?.problems || [];

  // Enhance problems with solved status from solvedSlugs
  const enhancedProblems = problems.map((problem) => ({
    ...problem,
    isSolved: solvedSlugs.has(problem.slug),
    isAttempted: problem.isAttempted || solvedSlugs.has(problem.slug),
  }));

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
      difficulty: "all",
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    };

    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setShowOnlyPremium("all");
    setAppliedShowOnlyPremium("all");
    setPage(1);
  };

  const handleSort = (field: "title" | "createdAt") => {
    const newSortOrder =
      appliedFilters.sortBy === field
        ? appliedFilters.sortOrder === "asc"
          ? "desc"
          : "asc"
        : "desc";

    const newFilters = {
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

  const handleProblemClick = (problem: ProblemWithProgress) => {
    if (problem.isPremium && !auth?.user?.isPremium && !auth?.user?.isAdmin) {
      // Show upgrade modal or redirect to premium page
      navigate("/premium");
      return;
    }
    navigate(`/problems/${problem.slug}`);
  };

  // Difficulty badge component
  const getDifficultyBadge = (difficulty: ProblemDifficulty) => {
    const difficultyColors = {
      [ProblemDifficulty.Easy]: "success",
      [ProblemDifficulty.Medium]: "warning",
      [ProblemDifficulty.Hard]: "danger",
    };

    return (
      <Badge
        bg={difficultyColors[difficulty]}
        className="px-3 py-2 fw-semibold d-flex align-items-center gap-1"
        style={{ fontSize: "0.85rem" }}
      >
        <Award size={14} />
        {difficulty}
      </Badge>
    );
  };

  // Status badge component
  const getStatusBadge = (problem: ProblemWithProgress) => {
    if (problem.isSolved) {
      return (
        <Badge bg="success" className="px-2 py-1">
          <CheckCircle size={12} className="me-1" />
          Solved
        </Badge>
      );
    }
    if (problem.isAttempted) {
      return (
        <Badge bg="warning" className="px-2 py-1">
          <Clock size={12} className="me-1" />
          Attempted
        </Badge>
      );
    }
    return null;
  };

  // Premium lock icon
  const getPremiumIcon = (isPremium: boolean) => {
    if (isPremium) {
      return (
        <Badge bg="warning" className="ms-2">
          <Lock size={12} />
        </Badge>
      );
    }
    return null;
  };

  // Acceptance rate bar
  const getAcceptanceRate = (rate?: number) => {
    if (!rate) return null;

    return (
      <div className="d-flex align-items-center gap-2">
        <div style={{ width: "60px" }}>
          <ProgressBar
            now={rate}
            variant={rate >= 70 ? "success" : rate >= 40 ? "warning" : "danger"}
            className="h-2"
          />
        </div>
        <small className="text-muted">{rate}%</small>
      </div>
    );
  };

  // Popularity stars
  const getPopularityStars = (popularity?: number) => {
    if (!popularity) return null;

    const stars = Math.min(5, Math.ceil(popularity / 20));
    return (
      <div className="d-flex">
        {[...Array(5)].map((_, i) =>
          i < stars ? (
            <StarFill key={i} size={12} className="text-warning" />
          ) : (
            <Star key={i} size={12} className="text-muted" />
          ),
        )}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

  if (isLoading) {
    return (
      <Container fluid className="py-5">
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
              <strong>Error loading problems:</strong>{" "}
              {error?.message || "Unknown error"}
            </div>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Hero Section */}
      <div className="mb-5">
        <h1 className="display-5 fw-bold mb-3">Problem Set</h1>
        <p className="lead text-muted mb-4">
          Sharpen your coding skills with our curated collection of problems.
          {!auth?.user && " Sign in to track your progress!"}
        </p>

        {auth?.user && userProgress && (
          <Row className="g-4 mb-4">
            {/* Progress Stats */}
            <Col md={8}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5 className="fw-bold mb-3">Your Progress</h5>
                  <Row className="g-3">
                    <Col md={4}>
                      <div className="text-center p-3 bg-primary bg-opacity-10 rounded">
                        <h3 className="fw-bold text-primary mb-1">
                          {userProgress.solvedProblems}
                        </h3>
                        <p className="text-muted mb-0">Solved</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center p-3 bg-warning bg-opacity-10 rounded">
                        <h3 className="fw-bold text-warning mb-1">
                          {userProgress.attemptedProblems}
                        </h3>
                        <p className="text-muted mb-0">Attempted</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                        <h3 className="fw-bold text-success mb-1">
                          {userProgress.completionRate}%
                        </h3>
                        <p className="text-muted mb-0">Completion Rate</p>
                      </div>
                    </Col>
                  </Row>

                  {/* Progress Bars by Difficulty */}
                  <div className="mt-4">
                    <h6 className="fw-bold mb-3">Difficulty Breakdown</h6>
                    {difficultyOptions.map((diff) => {
                      const data = userProgress.difficultyBreakdown[diff];
                      const progress =
                        data.total > 0 ? (data.solved / data.total) * 100 : 0;
                      return (
                        <div key={diff} className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="small">{diff}</span>
                            <span className="small">
                              {data.solved} / {data.total}
                            </span>
                          </div>
                          <ProgressBar
                            now={progress}
                            variant={
                              diff === ProblemDifficulty.Easy
                                ? "success"
                                : diff === ProblemDifficulty.Medium
                                  ? "warning"
                                  : "danger"
                            }
                            className="h-2"
                          />
                        </div>
                      );
                    })}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Recently Solved */}
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h5 className="fw-bold mb-3">Recently Solved</h5>
                  {recentlySolved.length > 0 ? (
                    <ListGroup variant="flush">
                      {recentlySolved.map((problem) => (
                        <ListGroup.Item
                          key={problem.id}
                          className="border-0 px-0 py-2"
                        >
                          <Link
                            to={`/problems/${problem.slug}`}
                            className="text-decoration-none text-dark"
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <span className="fw-semibold">
                                  {problem.title}
                                </span>
                                <div className="small text-muted">
                                  {formatDate(problem.lastAttempted)}
                                </div>
                              </div>
                              {getDifficultyBadge(problem.difficulty)}
                            </div>
                          </Link>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted mb-0">No problems solved yet</p>
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-2"
                        onClick={() => navigate("/problems")}
                      >
                        Start Solving
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <Search size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    type="search"
                    placeholder="Search problems..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                  />
                  <Button
                    type="submit"
                    variant={hasFilterChanges() ? "primary" : "secondary"}
                    disabled={!hasFilterChanges()}
                  >
                    Search
                  </Button>
                </InputGroup>
              </Col>

              <Col md={3}>
                <Form.Select
                  value={filters.difficulty}
                  onChange={(e) =>
                    handleFilterChange("difficulty", e.target.value)
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

              <Col md={3}>
                <Form.Select
                  value={showOnlyPremium}
                  onChange={(e) =>
                    setShowOnlyPremium(
                      e.target.value as "all" | "premium" | "free",
                    )
                  }
                >
                  <option value="all">All Problems</option>
                  <option value="free">Free Only</option>
                  <option value="premium">Premium Only</option>
                </Form.Select>
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
                      appliedFilters.difficulty !== "all" ||
                      appliedShowOnlyPremium !== "all") && (
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

                  {/* Sort Dropdown */}
                  <div className="d-flex gap-2 align-items-center">
                    <small className="text-muted">Sort by:</small>
                    <div className="btn-group">
                      <Button
                        variant={
                          appliedFilters.sortBy === "title"
                            ? "primary"
                            : "outline-primary"
                        }
                        size="sm"
                        onClick={() => handleSort("title")}
                      >
                        Title{" "}
                        {appliedFilters.sortBy === "title" &&
                          (appliedFilters.sortOrder === "asc" ? (
                            <SortAlphaUp className="ms-1" />
                          ) : (
                            <SortAlphaDown className="ms-1" />
                          ))}
                      </Button>
                      <Button
                        variant={
                          appliedFilters.sortBy === "createdAt"
                            ? "primary"
                            : "outline-primary"
                        }
                        size="sm"
                        onClick={() => handleSort("createdAt")}
                      >
                        Date Created{" "}
                        {appliedFilters.sortBy === "createdAt" &&
                          (appliedFilters.sortOrder === "asc" ? (
                            <SortAlphaUp className="ms-1" />
                          ) : (
                            <SortAlphaDown className="ms-1" />
                          ))}
                      </Button>
                    </div>
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
                  <th style={{ width: "40%" }}>Problem</th>
                  <th style={{ width: "15%" }}>Difficulty</th>
                  <th style={{ width: "15%" }}>Acceptance</th>
                  <th style={{ width: "15%" }}>Popularity</th>
                  <th style={{ width: "15%" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {enhancedProblems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5">
                      <Code size={48} className="text-muted mb-3" />
                      <h5 className="mb-2">No problems found</h5>
                      <p className="text-muted mb-0">
                        {appliedFilters.search
                          ? "Try a different search term"
                          : "No problems match your filters"}
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
                  enhancedProblems.map((problem) => (
                    <tr
                      key={problem.id}
                      onClick={() => handleProblemClick(problem)}
                      className="cursor-pointer"
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <div className="d-flex align-items-center">
                          <div>
                            <div className="fw-semibold d-flex align-items-center">
                              {problem.title}
                              {getPremiumIcon(problem.isPremium)}
                            </div>
                            <div
                              className="small text-muted text-truncate"
                              style={{ maxWidth: "400px" }}
                            >
                              {problem.description.substring(0, 80)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{getDifficultyBadge(problem.difficulty)}</td>
                      <td>{getAcceptanceRate(problem.acceptanceRate)}</td>
                      <td>{getPopularityStars(problem.popularity)}</td>
                      <td>
                        {getStatusBadge(problem)}
                        {!problem.isSolved &&
                          !problem.isAttempted &&
                          auth?.user && (
                            <span className="text-muted small">
                              Not attempted
                            </span>
                          )}
                        {!auth?.user && (
                          <span className="text-muted small">
                            Sign in to track
                          </span>
                        )}
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
                Showing {(page - 1) * limit + 1} to{" "}
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

      {/* Premium CTA */}
      {!auth?.user?.isPremium && (
        <Card className="border-0 shadow-sm mt-4 bg-warning bg-opacity-10">
          <Card.Body className="py-4">
            <Row className="align-items-center">
              <Col md={8}>
                <h5 className="fw-bold mb-2">Unlock Premium Problems</h5>
                <p className="text-muted mb-0">
                  Get access to exclusive premium problems, detailed solutions,
                  and advanced learning paths.
                </p>
              </Col>
              <Col md={4} className="text-end">
                <Button
                  variant="warning"
                  className="fw-semibold"
                  onClick={() => navigate("/premium")}
                >
                  <Lock size={18} className="me-2" />
                  Upgrade to Premium
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Tips Section */}
      <Row className="mt-5">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-start gap-3">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                  <BarChart size={24} className="text-primary" />
                </div>
                <div>
                  <h6 className="fw-bold">Track Your Progress</h6>
                  <p className="small text-muted mb-0">
                    Monitor your improvement with detailed statistics and
                    completion rates.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-start gap-3">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                  <Bullseye size={24} className="text-success" />
                </div>
                <div>
                  <h6 className="fw-bold">Practice by Difficulty</h6>
                  <p className="small text-muted mb-0">
                    Start with Easy problems and gradually tackle more
                    challenging ones.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-start gap-3">
                <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                  <Book size={24} className="text-info" />
                </div>
                <div>
                  <h6 className="fw-bold">Learn by Solving</h6>
                  <p className="small text-muted mb-0">
                    Each problem helps you master fundamental algorithms and
                    data structures.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
