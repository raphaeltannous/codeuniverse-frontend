import { useEffect, useState } from 'react';
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
  Modal,
  Pagination,
} from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Pencil,
  Trash,
  Code,
  Lock,
  Globe,
  CheckCircle,
  XCircle,
  ListTask,
  Award,
} from 'react-bootstrap-icons';
import { useAuth } from '~/context/AuthContext';
import MDEditor from '@uiw/react-md-editor';
import CodeEditor from '~/components/Shared/CodeEditor';
import { apiFetch } from '~/utils/api';
import ProblemsFilter from '~/components/Shared/ProblemFilter';
import StatsCard from '~/components/Shared/StatsCard';
import { Link } from 'react-router';
import type { Filters } from '~/types/problem/problemset';

// Interfaces matching your backend structure
interface ProblemBasic {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  isPremium: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Difficulty = "Easy" | "Medium" | "Hard";

interface Hint {
  id: string;
  problemId: string;
  hint: string;
  createdAt: string;
  updatedAt: string;
}

interface CodeSnippet {
  id: string;
  problemId: string;
  languageName: string;
  languageSlug: string;
  codeSnippet: string;
  driverCode: string;
  testerCode: string;
  createdAt: string;
  updatedAt: string;
}

interface ProblemTestcase {
  input: any;
  expected: any;
  isPublic: boolean;
}

interface ProblemTestcases {
  timeLimit: number;
  memoryLimit: number;
  testcases: ProblemTestcase[];
}

interface Language {
  languageName: string;
  languageSlug: string;
}

// Combined problem interface for frontend
interface Problem extends ProblemBasic {
  hints: Hint[];
  codeSnippets: CodeSnippet[];
  testcases: ProblemTestcases | null;
}

interface ProblemsResponse {
  problems: Problem[];
  total: number;
  page: number;
  limit: number;
}

interface ProblemFormData {
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  isPremium: boolean;
  isPublic: boolean;
  hints: string[];
  codeSnippets: Omit<CodeSnippet, 'id' | 'problemId' | 'createdAt' | 'updatedAt'>[];
  testcases: ProblemTestcases | null;
}

export default function ProblemsDashboard() {
  const { auth } = useAuth();
  const queryClient = useQueryClient();

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

  // State for problem creation/editing
  const [showModal, setShowModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'hints' | 'code' | 'testcases'>('basic');
  const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([]);

  // Form state
  const [formData, setFormData] = useState<ProblemFormData>({
    title: '',
    slug: '',
    description: '',
    difficulty: 'Easy',
    isPremium: false,
    isPublic: true,
    hints: [],
    codeSnippets: [],
    testcases: null,
  });

  // Fetch supported languages
  const {
    data: languagesData,
    isLoading: isLoadingLanguages
  } = useQuery<Language[]>({
    queryKey: ['supported-languages'],
    queryFn: async () => {
      const response = await apiFetch('/api/admin/supported-languages');

      if (!response.ok) {
        throw new Error('Failed to fetch supported languages');
      }
      return (await response.json()) as Language[];
    },
    enabled: !!auth.isAuthenticated,
  });

  // Use useEffect to handle the side effect when languagesData changes
  useEffect(() => {
    if (languagesData && languagesData.length > 0) {
      setSupportedLanguages(languagesData);
    }
  }, [languagesData]);

  // Fetch problems
  const {
    data: problemsData,
    isLoading: isLoadingProblems,
    isError,
    error,
    refetch
  } = useQuery<ProblemsResponse>({
    queryKey: ['admin-problems', page, appliedFilters, appliedShowOnlyPremium, appliedVisibilityFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Only add search if it's not empty
      if (appliedFilters.search.trim()) {
        params.append('search', appliedFilters.search);
      }

      // Add sort parameters
      params.append('sortBy', appliedFilters.sortBy);
      params.append('sortOrder', appliedFilters.sortOrder);

      // Only add difficulty if it's not 'all'
      if (appliedFilters.difficulty !== 'all') {
        params.append('difficulty', appliedFilters.difficulty.toLowerCase());
      }

      if (appliedVisibilityFilter !== 'all') params.append('public', appliedVisibilityFilter === 'public' ? 'public' : 'private');
      if (appliedShowOnlyPremium !== 'all') params.append('premium', appliedShowOnlyPremium === 'premium' ? 'premium' : 'free');

      const response = await apiFetch(`/api/admin/problems?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch problems');
      }
      return response.json();
    },
    enabled: !!auth.isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  // Calculate totalPages on client side
  const total = problemsData?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const problems = problemsData?.problems || [];

  // Create problem mutation - only basic info for creation
  const createProblemMutation = useMutation({
    mutationFn: async (data: ProblemFormData) => {
      // Only send basic information for creating a problem
      const basicData = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        difficulty: data.difficulty,
        isPremium: data.isPremium,
        isPublic: data.isPublic,
        hints: [],
        codeSnippets: [],
        testcases: null,
      };

      const response = await apiFetch('/api/admin/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(basicData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create problem');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-problems'] });
      setActionSuccess('Problem created successfully');
      setShowModal(false);
      resetForm();
      setTimeout(() => setActionSuccess(''), 3000);
    },
    onError: (error) => {
      setActionError(error.message || 'Failed to create problem');
      setTimeout(() => setActionError(''), 5000);
    },
  });

  // Update problem mutation - full data for editing
  const updateProblemMutation = useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: ProblemFormData }) => {
      const response = await apiFetch(`/api/admin/problems/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update problem');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-problems'] });
      setActionSuccess('Problem updated successfully');
      setShowModal(false);
      resetForm();
      setTimeout(() => setActionSuccess(''), 3000);
    },
    onError: (error) => {
      setActionError(error.message || 'Failed to update problem');
      setTimeout(() => setActionError(''), 5000);
    },
  });

  // Delete problem mutation
  const deleteProblemMutation = useMutation({
    mutationFn: async (slug: string) => {
      const response = await apiFetch(`/api/admin/problems/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete problem');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-problems'] });
      setShowDeleteModal(false);
      setProblemToDelete(null);
      setActionSuccess('Problem deleted successfully');
      setTimeout(() => setActionSuccess(''), 3000);
    },
    onError: (error) => {
      setActionError(error.message || 'Failed to delete problem');
      setTimeout(() => setActionError(''), 5000);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSlugGenerate = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleDescriptionChange = (value: string | undefined) => {
    setFormData(prev => ({ ...prev, description: value || '' }));
  };

  // Hints management
  const handleAddHint = () => {
    setFormData(prev => ({
      ...prev,
      hints: [...prev.hints, '']
    }));
  };

  const handleRemoveHint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== index)
    }));
  };

  const handleHintChange = (index: number, value: string) => {
    const newHints = [...formData.hints];
    newHints[index] = value;
    setFormData(prev => ({ ...prev, hints: newHints }));
  };

  // Code snippets management
  const handleAddCodeSnippet = () => {
    if (!supportedLanguages.length) return;

    const usedSlugs = formData.codeSnippets.map(cs => cs.languageSlug);
    const availableLanguage = supportedLanguages.find(lang => !usedSlugs.includes(lang.languageSlug));

    if (availableLanguage) {
      setFormData(prev => ({
        ...prev,
        codeSnippets: [...prev.codeSnippets, {
          languageName: availableLanguage.languageName,
          languageSlug: availableLanguage.languageSlug,
          codeSnippet: '',
          driverCode: '',
          testerCode: ''
        }]
      }));
    }
  };

  const handleRemoveCodeSnippet = (index: number) => {
    setFormData(prev => ({
      ...prev,
      codeSnippets: prev.codeSnippets.filter((_, i) => i !== index)
    }));
  };

  const handleCodeSnippetChange = (index: number, field: keyof CodeSnippet, value: string) => {
    const newSnippets = [...formData.codeSnippets];
    newSnippets[index] = { ...newSnippets[index], [field]: value };
    setFormData(prev => ({ ...prev, codeSnippets: newSnippets }));
  };

  const handleLanguageChange = (index: number, languageSlug: string) => {
    const selectedLanguage = supportedLanguages.find(lang => lang.languageSlug === languageSlug);
    if (selectedLanguage) {
      const newSnippets = [...formData.codeSnippets];
      newSnippets[index] = {
        ...newSnippets[index],
        languageName: selectedLanguage.languageName,
        languageSlug: selectedLanguage.languageSlug
      };
      setFormData(prev => ({ ...prev, codeSnippets: newSnippets }));
    }
  };

  // Test cases management
  const handleTestcasesChange = (field: keyof ProblemTestcases, value: any) => {
    setFormData(prev => ({
      ...prev,
      testcases: prev.testcases ? {
        ...prev.testcases,
        [field]: value
      } : {
        timeLimit: 1000,
        memoryLimit: 256,
        testcases: [],
        [field]: value
      }
    }));
  };

  const handleAddTestcase = () => {
    const newTestcase: ProblemTestcase = {
      input: '',
      expected: '',
      isPublic: false
    };

    setFormData(prev => ({
      ...prev,
      testcases: prev.testcases ? {
        ...prev.testcases,
        testcases: [...prev.testcases.testcases, newTestcase]
      } : {
        timeLimit: 1000,
        memoryLimit: 256,
        testcases: [newTestcase]
      }
    }));
  };

  const handleRemoveTestcase = (index: number) => {
    if (!formData.testcases) return;

    setFormData(prev => ({
      ...prev,
      testcases: {
        ...prev.testcases!,
        testcases: prev.testcases!.testcases.filter((_, i) => i !== index)
      }
    }));
  };

  const handleTestcaseChange = (index: number, field: keyof ProblemTestcase, value: any) => {
    if (!formData.testcases) return;

    const newTestcases = [...formData.testcases.testcases];
    newTestcases[index] = { ...newTestcases[index], [field]: value };

    setFormData(prev => ({
      ...prev,
      testcases: {
        ...prev.testcases!,
        testcases: newTestcases
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');

    if (!formData.title.trim()) {
      setActionError('Problem title is required');
      return;
    }

    if (!formData.slug.trim()) {
      setActionError('Problem slug is required');
      return;
    }

    if (!formData.description.trim()) {
      setActionError('Problem description is required');
      return;
    }


    if (editingProblem) {
      updateProblemMutation.mutate({ slug: editingProblem.slug, data: formData });
    } else {
      // For creating, only send basic data
      const basicData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        difficulty: formData.difficulty,
        isPremium: formData.isPremium,
        isPublic: formData.isPublic,
        hints: [],
        codeSnippets: [],
        testcases: null,
      };
      createProblemMutation.mutate(basicData);
    }
  };

  const handleEdit = (problem: Problem) => {
    setEditingProblem(problem);
    setFormData({
      title: problem.title,
      slug: problem.slug,
      description: problem.description,
      difficulty: problem.difficulty,
      isPremium: problem.isPremium,
      isPublic: problem.isPublic,
      hints: problem.hints.map(h => h.hint),
      codeSnippets: problem.codeSnippets.map(cs => ({
        languageName: cs.languageName,
        languageSlug: cs.languageSlug,
        codeSnippet: cs.codeSnippet,
        driverCode: cs.driverCode,
        testerCode: cs.testerCode
      })),
      testcases: problem.testcases,
    });
    setShowModal(true);
  };

  const handleDelete = (slug: string) => {
    setProblemToDelete(slug);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (problemToDelete) {
      deleteProblemMutation.mutate(problemToDelete);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      difficulty: 'Easy',
      isPremium: false,
      isPublic: true,
      hints: [],
      codeSnippets: [],
      testcases: null,
    });
    setEditingProblem(null);
    setActiveFormTab('basic');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => {
      resetForm();
    }, 300);
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

  const getDifficultyBadge = (difficulty: Difficulty) => {
    const difficultyColors = {
      'Beginner': 'success',
      'Easy': 'success',
      'Medium': 'warning',
      'Intermediate': 'warning',
      'Hard': 'danger',
      'Advanced': 'danger',
      'Expert': 'dark',
    };

    return (
      <Badge bg={difficultyColors[difficulty] || 'secondary'} className="px-2 py-1">
        <Award size={12} className="me-1" />
        {difficulty}
      </Badge>
    );
  };

  const getVisibilityBadge = (isPublic: boolean) => {
    return isPublic ? (
      <Badge bg="info" className="px-2 py-1">
        <Globe size={12} className="me-1" />
        Public
      </Badge>
    ) : (
      <Badge bg="secondary" className="px-2 py-1">
        <Lock size={12} className="me-1" />
        Private
      </Badge>
    );
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isLoading = isLoadingProblems || isLoadingLanguages;

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

  // Get available languages for code snippets (languages not already used)
  const getAvailableLanguages = (currentIndex: number) => {
    const usedSlugs = formData.codeSnippets
      .filter((_, index) => index !== currentIndex)
      .map(cs => cs.languageSlug);

    return supportedLanguages.filter(lang => !usedSlugs.includes(lang.languageSlug));
  };

  // Difficulty options
  const difficultyOptions: Difficulty[] = ["Easy", "Medium", "Hard"];

  return (
    <Container fluid className="py-4">
      {/* Success/Error Alerts */}
      {actionSuccess && (
        <Alert variant="success" dismissible onClose={() => setActionSuccess('')} className="mb-4">
          <CheckCircle size={18} className="me-2" />
          {actionSuccess}
        </Alert>
      )}

      {actionError && (
        <Alert variant="danger" dismissible onClose={() => setActionError('')} className="mb-4">
          <XCircle size={18} className="me-2" />
          {actionError}
        </Alert>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold">Problem Management</h2>
          <p className="text-muted mb-0">Create, edit, and manage coding problems</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
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
          />
        </Col>
        <Col md={3} sm={6}>
          <StatsCard
            icon={Globe}
            iconColor="text-success"
            bgColorClass="bg-success"
            value={problems.filter(p => p.isPublic).length}
            label="Public Problems"
          />
        </Col>
        <Col md={3} sm={6}>
          <StatsCard
            icon={Lock}
            iconColor="text-warning"
            bgColorClass="bg-warning"
            value={problems.filter(p => p.isPremium).length}
            label="Premium Problems"
          />
        </Col>
        <Col md={3} sm={6}>
          <StatsCard
            icon={ListTask}
            iconColor="text-info"
            bgColorClass="bg-info"
            value={problems.reduce((acc, p) => acc + (p.testcases?.testcases?.length || 0), 0)}
            label="Total Test Cases"
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
                        onClick={() => setShowModal(true)}
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
                        {getDifficultyBadge(problem.difficulty)}
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          {getVisibilityBadge(problem.isPublic)}
                          {getPremiumBadge(problem.isPremium)}
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

      {/* Create/Edit Problem Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size={editingProblem ? "xl" : "lg"}
        centered
        fullscreen="lg-down"
        backdrop={createProblemMutation.isPending || updateProblemMutation.isPending ? 'static' : true}
      >
        <Modal.Header closeButton>
          <Modal.Title className="h4 fw-bold">
            {editingProblem ? 'Edit Problem' : 'Create New Problem'}
          </Modal.Title>
        </Modal.Header>

        {editingProblem ? (
          // EDIT MODE: Show tabs with all sections
          <>
            {/* Form Tabs */}
            <div className="px-3 pt-2">
              <div className="d-flex border-bottom">
                <Button
                  variant="link"
                  className={`text-decoration-none px-3 py-2 ${activeFormTab === 'basic' ? 'border-primary border-bottom border-2 text-primary' : 'text-muted'}`}
                  onClick={() => setActiveFormTab('basic')}
                >
                  Basic Info
                </Button>
                <Button
                  variant="link"
                  className={`text-decoration-none px-3 py-2 ${activeFormTab === 'hints' ? 'border-primary border-bottom border-2 text-primary' : 'text-muted'}`}
                  onClick={() => setActiveFormTab('hints')}
                >
                  Hints ({formData.hints.filter(h => h.trim()).length})
                </Button>
                <Button
                  variant="link"
                  className={`text-decoration-none px-3 py-2 ${activeFormTab === 'code' ? 'border-primary border-bottom border-2 text-primary' : 'text-muted'}`}
                  onClick={() => setActiveFormTab('code')}
                >
                  Code Snippets ({formData.codeSnippets.length})
                </Button>
                <Button
                  variant="link"
                  className={`text-decoration-none px-3 py-2 ${activeFormTab === 'testcases' ? 'border-primary border-bottom border-2 text-primary' : 'text-muted'}`}
                  onClick={() => setActiveFormTab('testcases')}
                >
                  Test Cases ({formData.testcases?.testcases?.length || 0})
                </Button>
              </div>
            </div>

            <Form onSubmit={handleSubmit}>
              <Modal.Body className="py-3" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

                {/* Basic Info Tab */}
                {activeFormTab === 'basic' && (
                  <Row className="g-3">
                    <Col md={8}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">
                          Problem Title <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., Two Sum"
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">
                          Slug <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleInputChange}
                            required
                            placeholder="two-sum"
                            className="py-2"
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={handleSlugGenerate}
                            type="button"
                          >
                            Generate
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">
                          Difficulty <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="difficulty"
                          value={formData.difficulty}
                          onChange={handleInputChange}
                          required
                        >
                          {difficultyOptions.map(diff => (
                            <option key={diff} value={diff}>{diff}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">Access Settings</Form.Label>
                        <div className="d-flex gap-4">
                          <Form.Check
                            type="switch"
                            id="isPublic"
                            label="Public"
                            checked={formData.isPublic}
                            onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                          />
                          <Form.Check
                            type="switch"
                            id="isPremium"
                            label="Premium"
                            checked={formData.isPremium}
                            onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">
                          Description <span className="text-danger">*</span>
                        </Form.Label>
                        <div>
                          <MDEditor
                            value={formData.description}
                            onChange={handleDescriptionChange}
                            height={300}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                {/* Hints Tab */}
                {activeFormTab === 'hints' && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="fw-semibold mb-0">Problem Hints</h6>
                        <p className="text-muted small mb-0">Add helpful hints for users</p>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleAddHint}
                        type="button"
                      >
                        <Plus size={14} /> Add Hint
                      </Button>
                    </div>
                    {formData.hints.map((hint, index) => (
                      <div key={index} className="mb-3">
                        <InputGroup>
                          <Form.Control
                            as="textarea"
                            value={hint}
                            onChange={(e) => handleHintChange(index, e.target.value)}
                            placeholder={`Hint ${index + 1}`}
                            rows={3}
                          />
                          <Button
                            variant="outline-danger"
                            onClick={() => handleRemoveHint(index)}
                            disabled={formData.hints.length === 1}
                          >
                            <Trash size={14} />
                          </Button>
                        </InputGroup>
                      </div>
                    ))}
                    {formData.hints.length === 0 && (
                      <Alert variant="info">
                        No hints added. Hints are optional but can help users solve the problem.
                      </Alert>
                    )}
                  </div>
                )}

                {/* Code Snippets Tab */}
                {activeFormTab === 'code' && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="fw-semibold mb-0">Code Snippets</h6>
                        <p className="text-muted small mb-0">
                          Supported languages: {supportedLanguages.map(l => l.languageName).join(', ')}
                        </p>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleAddCodeSnippet}
                        type="button"
                        disabled={formData.codeSnippets.length >= supportedLanguages.length}
                        title={
                          formData.codeSnippets.length >= supportedLanguages.length
                            ? 'All supported languages are already added'
                            : 'Add another language'
                        }
                      >
                        <Plus size={14} /> Add Language
                      </Button>
                    </div>
                    {formData.codeSnippets.map((snippet, index) => {
                      const availableLanguages = getAvailableLanguages(index);
                      const currentLanguage = supportedLanguages.find(l => l.languageSlug === snippet.languageSlug);

                      return (
                        <Card key={index} className="mb-4">
                          <Card.Header>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="fw-semibold">
                                Language #{index + 1}: {currentLanguage?.languageName || 'Select Language'}
                              </div>
                              <div className="d-flex gap-2">
                                <Form.Select
                                  value={snippet.languageSlug}
                                  onChange={(e) => handleLanguageChange(index, e.target.value)}
                                  size="sm"
                                  style={{ width: '200px' }}
                                >
                                  <option value="">Select Language</option>
                                  {currentLanguage && (
                                    <option value={currentLanguage.languageSlug}>
                                      {currentLanguage.languageName} (current)
                                    </option>
                                  )}
                                  {availableLanguages.map(lang => (
                                    <option key={lang.languageSlug} value={lang.languageSlug}>
                                      {lang.languageName}
                                    </option>
                                  ))}
                                </Form.Select>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleRemoveCodeSnippet(index)}
                                >
                                  <Trash size={14} /> Remove
                                </Button>
                              </div>
                            </div>
                          </Card.Header>
                          <Card.Body>
                            <Row className="g-3">
                              <Col md={12}>
                                <Form.Label className="fw-semibold">Code Snippet (shown to user)</Form.Label>
                                <div style={{ height: '200px', border: '1px solid #dee2e6', borderRadius: '0.375rem' }}>
                                  <CodeEditor
                                    code={snippet.codeSnippet}
                                    language={snippet.languageSlug}
                                    onCodeChange={(value) => handleCodeSnippetChange(index, 'codeSnippet', value)}
                                    readonly={false}
                                  />
                                </div>
                              </Col>

                              <Col md={12}>
                                <Form.Label className="fw-semibold">Driver Code</Form.Label>
                                <div style={{ height: '200px', border: '1px solid #dee2e6', borderRadius: '0.375rem' }}>
                                  <CodeEditor
                                    code={snippet.driverCode}
                                    language={snippet.languageSlug}
                                    onCodeChange={(value) => handleCodeSnippetChange(index, 'driverCode', value)}
                                    readonly={false}
                                  />
                                </div>
                                <small className="text-muted">
                                  Main function that calls the user's solution
                                </small>
                              </Col>

                              <Col md={12}>
                                <Form.Label className="fw-semibold">Tester Code</Form.Label>
                                <div style={{ height: '200px', border: '1px solid #dee2e6', borderRadius: '0.375rem' }}>
                                  <CodeEditor
                                    code={snippet.testerCode}
                                    language={snippet.languageSlug}
                                    onCodeChange={(value) => handleCodeSnippetChange(index, 'testerCode', value)}
                                    readonly={false}
                                  />
                                </div>
                                <small className="text-muted">
                                  Code that runs tests on the solution
                                </small>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      );
                    })}
                    {formData.codeSnippets.length === 0 && (
                      <Alert variant="info">
                        No code snippets added. Add at least one language to support code execution.
                      </Alert>
                    )}
                  </div>
                )}

                {/* Test Cases Tab */}
                {activeFormTab === 'testcases' && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="fw-semibold mb-0">Test Cases</h6>
                        <p className="text-muted small mb-0">Configure test cases and limits</p>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleAddTestcase}
                        type="button"
                      >
                        <Plus size={14} /> Add Test Case
                      </Button>
                    </div>

                    {/* Limits */}
                    <Row className="mb-4">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Time Limit (ms)</Form.Label>
                          <Form.Control
                            type="number"
                            value={formData.testcases?.timeLimit || 1000}
                            onChange={(e) => handleTestcasesChange('timeLimit', parseInt(e.target.value))}
                            min="100"
                            max="10000"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Memory Limit (MB)</Form.Label>
                          <Form.Control
                            type="number"
                            value={formData.testcases?.memoryLimit || 256}
                            onChange={(e) => handleTestcasesChange('memoryLimit', parseInt(e.target.value))}
                            min="1"
                            max="2048"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Test Cases List */}
                    {formData.testcases?.testcases.map((testcase, index) => (
                      <Card key={index} className="mb-3">
                        <Card.Header>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="fw-semibold">
                              Test Case #{index + 1}
                            </div>
                            <div className="d-flex gap-2">
                              <Form.Check
                                type="switch"
                                id={`isPublic-${index}`}
                                label="Public"
                                checked={testcase.isPublic}
                                onChange={(e) => handleTestcaseChange(index, 'isPublic', e.target.checked)}
                              />
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleRemoveTestcase(index)}
                              >
                                <Trash size={14} />
                              </Button>
                            </div>
                          </div>
                        </Card.Header>
                        <Card.Body>
                          <Row className="g-3">
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Input (JSON)</Form.Label>
                                <div style={{ height: '150px', border: '1px solid #dee2e6', borderRadius: '0.375rem' }}>
                                  <CodeEditor
                                    code={typeof testcase.input === 'string' ? testcase.input : JSON.stringify(testcase.input, null, 2)}
                                    language="json"
                                    onCodeChange={(value) => handleTestcaseChange(index, 'input', value)}
                                    readonly={false}
                                  />
                                </div>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Expected Output (JSON)</Form.Label>
                                <div style={{ height: '150px', border: '1px solid #dee2e6', borderRadius: '0.375rem' }}>
                                  <CodeEditor
                                    code={typeof testcase.expected === 'string' ? testcase.expected : JSON.stringify(testcase.expected, null, 2)}
                                    language="json"
                                    onCodeChange={(value) => handleTestcaseChange(index, 'expected', value)}
                                    readonly={false}
                                  />
                                </div>
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}

                    {(!formData.testcases || formData.testcases.testcases.length === 0) && (
                      <Alert variant="info">
                        No test cases added. Test cases are required for problem validation.
                      </Alert>
                    )}
                  </div>
                )}
              </Modal.Body>

              <Modal.Footer>
                <div className="d-flex justify-content-between w-100">
                  <div className="d-flex gap-2">
                    <Button
                      variant={activeFormTab === 'basic' ? 'primary' : 'outline-primary'}
                      onClick={() => setActiveFormTab('basic')}
                      size="sm"
                    >
                      Basic
                    </Button>
                    <Button
                      variant={activeFormTab === 'hints' ? 'primary' : 'outline-primary'}
                      onClick={() => setActiveFormTab('hints')}
                      size="sm"
                    >
                      Hints
                    </Button>
                    <Button
                      variant={activeFormTab === 'code' ? 'primary' : 'outline-primary'}
                      onClick={() => setActiveFormTab('code')}
                      size="sm"
                    >
                      Code
                    </Button>
                    <Button
                      variant={activeFormTab === 'testcases' ? 'primary' : 'outline-primary'}
                      onClick={() => setActiveFormTab('testcases')}
                      size="sm"
                    >
                      Test Cases
                    </Button>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      onClick={handleCloseModal}
                      className="px-4"
                      disabled={createProblemMutation.isPending || updateProblemMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      className="px-4"
                      disabled={createProblemMutation.isPending || updateProblemMutation.isPending}
                    >
                      {createProblemMutation.isPending || updateProblemMutation.isPending ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Updating...
                        </>
                      ) : (
                        'Update Problem'
                      )}
                    </Button>
                  </div>
                </div>
              </Modal.Footer>
            </Form>
          </>
        ) : (
          // CREATE MODE: Simple form with only basic info
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Alert variant="info" className="mb-4">
                <p className="mb-0">
                  Create a basic problem first. You can add hints, code snippets, and test cases later when editing.
                </p>
              </Alert>

              <Row className="g-3">
                <Col md={8}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Problem Title <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Two Sum"
                      className="py-2"
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Slug <span className="text-danger">*</span>
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        required
                        placeholder="two-sum"
                        className="py-2"
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={handleSlugGenerate}
                        type="button"
                      >
                        Generate
                      </Button>
                    </InputGroup>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Difficulty <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      required
                    >
                      {difficultyOptions.map(diff => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Access Settings</Form.Label>
                    <div className="d-flex gap-4">
                      <Form.Check
                        type="switch"
                        id="isPublic"
                        label="Public"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      />
                      <Form.Check
                        type="switch"
                        id="isPremium"
                        label="Premium"
                        checked={formData.isPremium}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                      />
                    </div>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Description <span className="text-danger">*</span>
                    </Form.Label>
                    <div data-color-mode="light">
                      <MDEditor
                        value={formData.description}
                        onChange={handleDescriptionChange}
                        height={300}
                        preview="edit"
                        visibleDragbar={false}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="outline-secondary"
                onClick={handleCloseModal}
                className="px-4"
                disabled={createProblemMutation.isPending || updateProblemMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="px-4"
                disabled={createProblemMutation.isPending || updateProblemMutation.isPending}
              >
                {createProblemMutation.isPending ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Creating...
                  </>
                ) : (
                  'Create Problem'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>

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
    </Container>
  );
}
