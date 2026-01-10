import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
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
  Tabs,
  Tab,
  Modal,
  Dropdown,
} from "react-bootstrap";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash,
  Code,
  Lock,
  Globe,
  CheckCircle,
  XCircle,
  Award,
  Pencil,
  Eye,
  EyeSlash,
  Check,
  Copy,
  Clock,
} from "react-bootstrap-icons";
import { useAuth } from "~/context/AuthContext";
import MDEditor from "@uiw/react-md-editor";
import CodeEditor from "~/components/shared/code-editor";

// Interfaces
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

export type Difficulty =
  | "Easy"
  | "Medium"
  | "Hard"
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Expert";

interface Hint {
  id: string;
  problemId: string;
  hint: string;
  createdAt: string;
  updatedAt: string;
}

interface ProblemCode {
  id?: string;
  codeSnippet: string;
  checker: string;
  driver: string;
  isPublic: boolean;
  languageName: string;
  languageSlug: string;
}

interface ProblemTestcase {
  id: number;
  input: any;
  expected: any;
  isPublic: boolean;
}

interface ProblemCodeConfig {
  timeLimit: number;
  memoryLimit: number;
}

interface Language {
  languageName: string;
  languageSlug: string;
}

interface Problem extends ProblemBasic {
  hints: Hint[];
  codeSnippets: ProblemCode[];
  testcases: ProblemTestcase[];
}

interface ProblemFormData {
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  isPremium: boolean;
  isPublic: boolean;
}

export default function EditProblemPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const queryClient = useQueryClient();

  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  // Modal states
  const [showHintModal, setShowHintModal] = useState(false);
  const [showTestcaseModal, setShowTestcaseModal] = useState(false);
  const [editingHint, setEditingHint] = useState<Hint | null>(null);
  const [editingTestcase, setEditingTestcase] =
    useState<ProblemTestcase | null>(null);

  // Form states
  const [hintForm, setHintForm] = useState({ hint: "" });
  const [testcaseForm, setTestcaseForm] = useState({
    input: "",
    expected: "",
    isPublic: false,
  });

  // Basic problem form
  const [formData, setFormData] = useState<ProblemFormData>({
    title: "",
    slug: "",
    description: "",
    difficulty: "Easy",
    isPremium: false,
    isPublic: true,
  });

  // Limits config
  const [limitsConfig, setLimitsConfig] = useState<ProblemCodeConfig>({
    timeLimit: 1000,
    memoryLimit: 256,
  });

  // Testcases
  const [testcases, setTestcases] = useState<ProblemTestcase[]>([]);

  // Selected language for code snippets tab
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  // Editing state for code snippet
  const [editingCodeSnippet, setEditingCodeSnippet] =
    useState<ProblemCode | null>(null);
  // Form for editing code snippet directly
  const [codeSnippetEditForm, setCodeSnippetEditForm] = useState<{
    codeSnippet: string;
    driver: string;
    checker: string;
    isPublic: boolean;
  }>({
    codeSnippet: "",
    driver: "",
    checker: "",
    isPublic: false,
  });

  // Fetch basic problem data
  const {
    data: problem,
    isLoading: isLoadingProblem,
    isError: isProblemError,
    error: problemError,
  } = useQuery<Problem>({
    queryKey: ["admin-problem", slug],
    queryFn: async () => {
      const response = await fetch(`/api/admin/problems/${slug}`, {
        headers: {
          Authorization: `Bearer ${auth.jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch problem");
      }
      return response.json();
    },
    enabled: !!auth.jwt && !!slug,
  });

  // Fetch hints separately
  const {
    data: hints = [],
    isLoading: isLoadingHints,
    refetch: refetchHints,
  } = useQuery<Hint[]>({
    queryKey: ["admin-problem-hints", slug],
    queryFn: async () => {
      const response = await fetch(`/api/admin/problems/${slug}/hints`, {
        headers: {
          Authorization: `Bearer ${auth.jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch hints");
      }
      return response.json();
    },
    enabled: !!auth.jwt && !!slug,
  });

  // Fetch code snippets separately
  const {
    data: codeSnippets = [],
    isLoading: isLoadingCodeSnippets,
    refetch: refetchCodeSnippets,
  } = useQuery<ProblemCode[]>({
    queryKey: ["admin-problem-code-snippets", slug],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/problems/${slug}/code-snippets`,
        {
          headers: {
            Authorization: `Bearer ${auth.jwt}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch code snippets");
      }
      return response.json();
    },
    enabled: !!auth.jwt && !!slug,
  });

  // Fetch testcases separately
  const {
    data: fetchedTestcases = [],
    isLoading: isLoadingTestcases,
    refetch: refetchTestcases,
  } = useQuery<ProblemTestcase[]>({
    queryKey: ["admin-problem-testcases", slug],
    queryFn: async () => {
      const response = await fetch(`/api/admin/problems/${slug}/testcases`, {
        headers: {
          Authorization: `Bearer ${auth.jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch test cases");
      }
      return response.json();
    },
    enabled: !!auth.jwt && !!slug,
  });

  // Fetch limits config separately
  const {
    data: fetchedLimitsConfig,
    isLoading: isLoadingLimits,
    refetch: refetchLimits,
  } = useQuery<ProblemCodeConfig>({
    queryKey: ["admin-problem-limits", slug],
    queryFn: async () => {
      const response = await fetch(`/api/admin/problems/${slug}/config`, {
        headers: {
          Authorization: `Bearer ${auth.jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch limits config");
      }
      return response.json();
    },
    enabled: !!auth.jwt && !!slug,
  });

  // Fetch supported languages (not used for creating snippets anymore)
  const { data: supportedLanguages = [], isLoading: isLoadingLanguages } =
    useQuery<Language[]>({
      queryKey: ["supported-languages"],
      queryFn: async () => {
        const response = await fetch("/api/admin/supported-languages", {
          headers: {
            Authorization: `Bearer ${auth.jwt}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch supported languages");
        }
        return (await response.json()) as Language[];
      },
      enabled: !!auth.jwt,
    });

  // Use effect to set form data when problem loads
  useEffect(() => {
    if (problem) {
      setFormData({
        title: problem.title,
        slug: problem.slug,
        description: problem.description,
        difficulty: problem.difficulty,
        isPremium: problem.isPremium,
        isPublic: problem.isPublic,
      });
    }
  }, [problem]);

  // Use effect to set testcases
  useEffect(() => {
    if (fetchedTestcases) {
      setTestcases(fetchedTestcases);
    }
  }, [fetchedTestcases]);

  // Use effect to set limits config
  useEffect(() => {
    if (fetchedLimitsConfig) {
      setLimitsConfig(fetchedLimitsConfig);
    }
  }, [fetchedLimitsConfig]);

  // Use effect to set default selected language when code snippets load
  useEffect(() => {
    if (codeSnippets.length > 0 && !selectedLanguage) {
      setSelectedLanguage(codeSnippets[0].languageSlug);
    }
  }, [codeSnippets, selectedLanguage]);

  // Use effect to reset editing state when selected language changes
  useEffect(() => {
    if (selectedLanguage) {
      setEditingCodeSnippet(null);
      const snippet = codeSnippets.find(
        (s) => s.languageSlug === selectedLanguage,
      );
      if (snippet) {
        setCodeSnippetEditForm({
          codeSnippet: snippet.codeSnippet,
          driver: snippet.driver,
          checker: snippet.checker,
          isPublic: snippet.isPublic,
        });
      }
    }
  }, [selectedLanguage, codeSnippets]);

  // Get current selected code snippet
  const currentCodeSnippet = codeSnippets.find(
    (snippet) => snippet.languageSlug === selectedLanguage,
  );

  // Get recent 3 testcases for templates (assuming higher IDs are more recent)
  const recentTestcases = [...testcases]
    .sort((a, b) => b.id - a.id) // Sort by ID descending (higher ID = more recent)
    .slice(0, 3); // Take only first 3

  // Update problem mutation
  const updateProblemMutation = useMutation({
    mutationFn: async (data: ProblemFormData) => {
      const response = await fetch(`/api/admin/problems/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.jwt}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update problem");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-problem", slug] });
      queryClient.invalidateQueries({ queryKey: ["admin-problems"] });
      setActionSuccess("Problem updated successfully");
      setTimeout(() => setActionSuccess(""), 3000);
    },
    onError: (error) => {
      setActionError(error.message || "Failed to update problem");
      setTimeout(() => setActionError(""), 5000);
    },
  });

  // Create hint mutation
  const createHintMutation = useMutation({
    mutationFn: async (hint: string) => {
      const response = await fetch(`/api/admin/problems/${slug}/hints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.jwt}`,
        },
        body: JSON.stringify({ hint }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create hint");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-problem-hints", slug],
      });
      setShowHintModal(false);
      setHintForm({ hint: "" });
      setEditingHint(null);
      setActionSuccess("Hint added successfully");
      setTimeout(() => setActionSuccess(""), 3000);
    },
    onError: (error) => {
      setActionError(error.message || "Failed to create hint");
      setTimeout(() => setActionError(""), 5000);
    },
  });

  // Update hint mutation
  const updateHintMutation = useMutation({
    mutationFn: async ({ hintId, hint }: { hintId: string; hint: string }) => {
      const response = await fetch(
        `/api/admin/problems/${slug}/hints/${hintId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.jwt}`,
          },
          body: JSON.stringify({ hint }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update hint");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-problem-hints", slug],
      });
      setShowHintModal(false);
      setHintForm({ hint: "" });
      setEditingHint(null);
      setActionSuccess("Hint updated successfully");
      setTimeout(() => setActionSuccess(""), 3000);
    },
    onError: (error) => {
      setActionError(error.message || "Failed to update hint");
      setTimeout(() => setActionError(""), 5000);
    },
  });

  // Delete hint mutation
  const deleteHintMutation = useMutation({
    mutationFn: async (hintId: string) => {
      const response = await fetch(
        `/api/admin/problems/${slug}/hints/${hintId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${auth.jwt}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete hint");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-problem-hints", slug],
      });
      setActionSuccess("Hint deleted successfully");
      setTimeout(() => setActionSuccess(""), 3000);
    },
    onError: (error) => {
      setActionError(error.message || "Failed to delete hint");
      setTimeout(() => setActionError(""), 5000);
    },
  });

  // Update code snippet mutation
  const updateCodeSnippetMutation = useMutation({
    mutationFn: async ({
      languageSlug,
      data,
    }: {
      languageSlug: string;
      data: ProblemCode;
    }) => {
      const response = await fetch(
        `/api/admin/problems/${slug}/code-snippets/${languageSlug}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.jwt}`,
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update code snippet");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-problem-code-snippets", slug],
      });
      setEditingCodeSnippet(null);
      setActionSuccess("Code snippet updated successfully");
      setTimeout(() => setActionSuccess(""), 3000);
    },
    onError: (error) => {
      setActionError(error.message || "Failed to update code snippet");
      setTimeout(() => setActionError(""), 5000);
    },
  });

  // Create testcase mutation (sends individual testcase)
  const createTestcaseMutation = useMutation({
    mutationFn: async (data: Omit<ProblemTestcase, "id">) => {
      const response = await fetch(`/api/admin/problems/${slug}/testcases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.jwt}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create test case");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-problem-testcases", slug],
      });
      setShowTestcaseModal(false);
      setTestcaseForm({
        input: "",
        expected: "",
        isPublic: false,
      });
      setEditingTestcase(null);
      setActionSuccess("Test case added successfully");
      setTimeout(() => setActionSuccess(""), 3000);
    },
    onError: (error) => {
      setActionError(error.message || "Failed to create test case");
      setTimeout(() => setActionError(""), 5000);
    },
  });

  // Update testcase mutation (updates individual testcase)
  const updateTestcaseMutation = useMutation({
    mutationFn: async ({
      testcaseId,
      data,
    }: {
      testcaseId: number;
      data: Omit<ProblemTestcase, "id">;
    }) => {
      const response = await fetch(
        `/api/admin/problems/${slug}/testcases/${testcaseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.jwt}`,
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update test case");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-problem-testcases", slug],
      });
      setShowTestcaseModal(false);
      setTestcaseForm({
        input: "",
        expected: "",
        isPublic: false,
      });
      setEditingTestcase(null);
      setActionSuccess("Test case updated successfully");
      setTimeout(() => setActionSuccess(""), 3000);
    },
    onError: (error) => {
      setActionError(error.message || "Failed to update test case");
      setTimeout(() => setActionError(""), 5000);
    },
  });

  // Delete testcase mutation
  const deleteTestcaseMutation = useMutation({
    mutationFn: async (testcaseId: number) => {
      const response = await fetch(
        `/api/admin/problems/${slug}/testcases/${testcaseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${auth.jwt}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete test case");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-problem-testcases", slug],
      });
      setActionSuccess("Test case deleted successfully");
      setTimeout(() => setActionSuccess(""), 3000);
    },
    onError: (error) => {
      setActionError(error.message || "Failed to delete test case");
      setTimeout(() => setActionError(""), 5000);
    },
  });

  // Update limits config mutation
  const updateLimitsConfigMutation = useMutation({
    mutationFn: async (data: ProblemCodeConfig) => {
      const response = await fetch(`/api/admin/problems/${slug}/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.jwt}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update limits");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-problem-limits", slug],
      });
      setActionSuccess("Limits updated successfully");
      setTimeout(() => setActionSuccess(""), 3000);
    },
    onError: (error) => {
      setActionError(error.message || "Failed to update limits");
      setTimeout(() => setActionError(""), 5000);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSlugGenerate = () => {
    const newSlug = formData.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-");
    setFormData((prev) => ({ ...prev, slug: newSlug }));
  };

  const handleDescriptionChange = (value: string | undefined) => {
    setFormData((prev) => ({ ...prev, description: value || "" }));
  };

  // Hint handlers
  const handleAddHint = () => {
    setEditingHint(null);
    setHintForm({ hint: "" });
    setShowHintModal(true);
  };

  const handleEditHint = (hint: Hint) => {
    setEditingHint(hint);
    setHintForm({ hint: hint.hint });
    setShowHintModal(true);
  };

  const handleDeleteHint = (hintId: string) => {
    if (window.confirm("Are you sure you want to delete this hint?")) {
      deleteHintMutation.mutate(hintId);
    }
  };

  const handleHintFormChange = (value: string | undefined) => {
    setHintForm({ hint: value || "" });
  };

  const handleSubmitHint = () => {
    if (!hintForm.hint.trim()) {
      setActionError("Hint text is required");
      return;
    }

    if (editingHint) {
      updateHintMutation.mutate({
        hintId: editingHint.id,
        hint: hintForm.hint,
      });
    } else {
      createHintMutation.mutate(hintForm.hint);
    }
  };

  // Code snippet handlers
  const handleStartEditCodeSnippet = () => {
    if (currentCodeSnippet) {
      setEditingCodeSnippet(currentCodeSnippet);
    }
  };

  const handleCancelEditCodeSnippet = () => {
    setEditingCodeSnippet(null);
    if (currentCodeSnippet) {
      setCodeSnippetEditForm({
        codeSnippet: currentCodeSnippet.codeSnippet,
        driver: currentCodeSnippet.driver,
        checker: currentCodeSnippet.checker,
        isPublic: currentCodeSnippet.isPublic,
      });
    }
  };

  const handleCodeSnippetEditFormChange = (
    field: keyof typeof codeSnippetEditForm,
    value: any,
  ) => {
    setCodeSnippetEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveCodeSnippet = () => {
    if (!currentCodeSnippet) return;

    const selectedLang = supportedLanguages.find(
      (lang) => lang.languageSlug === currentCodeSnippet.languageSlug,
    );
    if (!selectedLang) {
      setActionError("Invalid language selected");
      return;
    }

    const data: ProblemCode = {
      codeSnippet: codeSnippetEditForm.codeSnippet,
      checker: codeSnippetEditForm.checker,
      driver: codeSnippetEditForm.driver,
      isPublic: codeSnippetEditForm.isPublic,
      languageName: selectedLang.languageName,
      languageSlug: currentCodeSnippet.languageSlug,
    };

    updateCodeSnippetMutation.mutate({
      languageSlug: currentCodeSnippet.languageSlug,
      data,
    });
  };

  // Testcase handlers
  const handleAddTestcase = () => {
    setEditingTestcase(null);
    setTestcaseForm({
      input: "",
      expected: "",
      isPublic: false,
    });
    setShowTestcaseModal(true);
  };

  const handleAddTestcaseWithTemplate = (templateTestcase: ProblemTestcase) => {
    setEditingTestcase(null);
    setTestcaseForm({
      input:
        typeof templateTestcase.input === "string"
          ? templateTestcase.input
          : JSON.stringify(templateTestcase.input, null, 2),
      expected:
        typeof templateTestcase.expected === "string"
          ? templateTestcase.expected
          : JSON.stringify(templateTestcase.expected, null, 2),
      isPublic: templateTestcase.isPublic,
    });
    setShowTestcaseModal(true);
  };

  const handleEditTestcase = (testcase: ProblemTestcase) => {
    setEditingTestcase(testcase);
    setTestcaseForm({
      input:
        typeof testcase.input === "string"
          ? testcase.input
          : JSON.stringify(testcase.input, null, 2),
      expected:
        typeof testcase.expected === "string"
          ? testcase.expected
          : JSON.stringify(testcase.expected, null, 2),
      isPublic: testcase.isPublic,
    });
    setShowTestcaseModal(true);
  };

  const handleDeleteTestcase = (testcaseId: number) => {
    if (window.confirm("Are you sure you want to delete this test case?")) {
      deleteTestcaseMutation.mutate(testcaseId);
    }
  };

  const handleTestcaseFormChange = (
    field: keyof typeof testcaseForm,
    value: any,
  ) => {
    setTestcaseForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitTestcase = () => {
    if (!testcaseForm.input.trim()) {
      setActionError("Input is required");
      return;
    }

    if (!testcaseForm.expected.trim()) {
      setActionError("Expected output is required");
      return;
    }

    let inputData: any;
    let expectedData: any;

    try {
      inputData = JSON.parse(testcaseForm.input);
    } catch {
      inputData = testcaseForm.input;
    }

    try {
      expectedData = JSON.parse(testcaseForm.expected);
    } catch {
      expectedData = testcaseForm.expected;
    }

    const data = {
      input: inputData,
      expected: expectedData,
      isPublic: testcaseForm.isPublic,
    };

    if (editingTestcase) {
      updateTestcaseMutation.mutate({ testcaseId: editingTestcase.id, data });
    } else {
      createTestcaseMutation.mutate(data);
    }
  };

  // Limits handlers
  const handleLimitsChange = (
    field: keyof typeof limitsConfig,
    value: number,
  ) => {
    setLimitsConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveLimits = () => {
    updateLimitsConfigMutation.mutate(limitsConfig);
  };

  // Handle save button click
  const handleSaveClick = () => {
    setActionError("");

    if (!formData.title.trim()) {
      setActionError("Problem title is required");
      return;
    }

    if (!formData.slug.trim()) {
      setActionError("Problem slug is required");
      return;
    }

    if (!formData.description.trim()) {
      setActionError("Problem description is required");
      return;
    }

    if (!formData.difficulty.trim()) {
      setActionError("Problem difficulty is required");
      return;
    }

    updateProblemMutation.mutate(formData);
  };

  const difficultyOptions: Difficulty[] = [
    "Beginner",
    "Easy",
    "Medium",
    "Intermediate",
    "Hard",
    "Advanced",
    "Expert",
  ];

  const isLoading =
    isLoadingProblem ||
    isLoadingHints ||
    isLoadingCodeSnippets ||
    isLoadingTestcases ||
    isLoadingLimits ||
    isLoadingLanguages;

  if (isLoading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading problem...</p>
        </div>
      </Container>
    );
  }

  if (isProblemError) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Error loading problem:</strong>{" "}
              {problemError?.message || "Unknown error"}
            </div>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => navigate("/dashboard/problems")}
            >
              <ArrowLeft size={14} className="me-1" />
              Back to Problems
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Success/Error Alerts */}
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
          <h2>
            Editing: <span className="fw-semibold">{problem?.title}</span>
          </h2>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => window.open(`/problems/${slug}`, "_blank")}
          >
            View Problem
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-0">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || "basic")}
            className="border-bottom px-3 pt-2"
            fill
          >
            <Tab eventKey="basic" title="Basic Info">
              <div className="p-3">
                <Form>
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
                          {difficultyOptions.map((diff) => (
                            <option key={diff} value={diff}>
                              {diff}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">
                          Access Settings
                        </Form.Label>
                        <div className="d-flex gap-4">
                          <Form.Check
                            type="switch"
                            id="isPublic"
                            label="Public"
                            checked={formData.isPublic}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                isPublic: e.target.checked,
                              }))
                            }
                          />
                          <Form.Check
                            type="switch"
                            id="isPremium"
                            label="Premium"
                            checked={formData.isPremium}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                isPremium: e.target.checked,
                              }))
                            }
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
                            height={400}
                            preview="edit"
                            visibleDragbar={false}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                  {/* Save/Cancel buttons */}
                  <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <Button
                      variant="outline-secondary"
                      className="px-4"
                      onClick={() => navigate("/dashboard/problems")}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      type="button"
                      onClick={handleSaveClick}
                      disabled={updateProblemMutation.isPending}
                      className="px-4"
                    >
                      {updateProblemMutation.isPending ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save size={18} className="me-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </div>
            </Tab>

            <Tab eventKey="hints" title={`Hints (${hints.length})`}>
              <div className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h6 className="fw-semibold mb-0">Problem Hints</h6>
                    <p className="text-muted small mb-0">
                      Add helpful hints for users (Markdown supported)
                    </p>
                  </div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleAddHint}
                    type="button"
                    disabled={createHintMutation.isPending}
                  >
                    <Plus size={14} /> Add Hint
                  </Button>
                </div>

                {hints.length === 0 ? (
                  <Alert variant="info">
                    No hints added. Hints are optional but can help users solve
                    the problem.
                  </Alert>
                ) : (
                  <Row>
                    {hints?.map((hint) => (
                      <Col md={6} key={hint.id} className="mb-3">
                        <Card>
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="fw-semibold">
                                Hint #{hints.indexOf(hint) + 1}
                              </div>
                              <div className="d-flex gap-1">
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  onClick={() => handleEditHint(hint)}
                                  disabled={updateHintMutation.isPending}
                                >
                                  <Pencil size={12} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteHint(hint.id)}
                                  disabled={deleteHintMutation.isPending}
                                >
                                  <Trash size={12} />
                                </Button>
                              </div>
                            </div>
                            <div className="mb-2" data-color-mode="light">
                              <MDEditor.Markdown source={hint.hint} />
                            </div>
                            <small className="text-muted">
                              Created:{" "}
                              {new Date(hint.createdAt).toLocaleDateString()}
                            </small>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            </Tab>

            <Tab
              eventKey="code"
              title={`Code Snippets (${codeSnippets.length})`}
            >
              <div className="p-3">
                <div className="mb-3">
                  <h6 className="fw-semibold mb-0">Code Snippets</h6>
                  <p className="text-muted small mb-0">
                    Languages are automatically created by the backend. Edit to
                    make them public or update code.
                  </p>
                </div>

                {codeSnippets.length === 0 ? (
                  <Alert variant="info">
                    No code snippets available. The backend will automatically
                    create language entries.
                  </Alert>
                ) : (
                  <div>
                    {/* Beautiful Language Selector - Tabs Style */}
                    <div className="mb-4">
                      <div className="border rounded">
                        <div className="p-3 border-bottom bg-light">
                          <h6 className="fw-semibold mb-0">Select Language</h6>
                        </div>
                        <div className="p-3">
                          <div className="d-flex flex-wrap gap-2">
                            {codeSnippets.map((snippet) => (
                              <Button
                                key={snippet.languageSlug}
                                variant={
                                  selectedLanguage === snippet.languageSlug
                                    ? "primary"
                                    : "outline-secondary"
                                }
                                onClick={() =>
                                  setSelectedLanguage(snippet.languageSlug)
                                }
                                className="d-flex align-items-center gap-2 position-relative"
                              >
                                <span>{snippet.languageName}</span>
                                {snippet.isPublic ? (
                                  <Eye size={14} />
                                ) : (
                                  <EyeSlash size={14} />
                                )}
                                {selectedLanguage === snippet.languageSlug && (
                                  <Check size={14} className="ms-1" />
                                )}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Single Card for Current Language with Direct Editing */}
                    {currentCodeSnippet && (
                      <Card className="mb-4">
                        <Card.Header>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <div className="fw-semibold">
                                {currentCodeSnippet.languageName} Code Snippet
                              </div>
                              {currentCodeSnippet.isPublic ? (
                                <Badge
                                  bg="success"
                                  className="d-flex align-items-center gap-1"
                                >
                                  <Eye size={12} />
                                  Public
                                </Badge>
                              ) : (
                                <Badge
                                  bg="secondary"
                                  className="d-flex align-items-center gap-1"
                                >
                                  <EyeSlash size={12} />
                                  Private
                                </Badge>
                              )}
                            </div>
                            <div className="d-flex gap-2">
                              {editingCodeSnippet ? (
                                <>
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={handleCancelEditCodeSnippet}
                                    disabled={
                                      updateCodeSnippetMutation.isPending
                                    }
                                    className="d-flex align-items-center gap-2"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={handleSaveCodeSnippet}
                                    disabled={
                                      updateCodeSnippetMutation.isPending
                                    }
                                    className="d-flex align-items-center gap-2"
                                  >
                                    {updateCodeSnippetMutation.isPending ? (
                                      <Spinner animation="border" size="sm" />
                                    ) : (
                                      <>
                                        <Check size={14} /> Save
                                      </>
                                    )}
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  onClick={handleStartEditCodeSnippet}
                                  disabled={updateCodeSnippetMutation.isPending}
                                  className="d-flex align-items-center gap-2"
                                >
                                  <Pencil size={14} /> Edit
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card.Header>
                        <Card.Body>
                          <Row className="g-3">
                            {/* Public/Private Toggle */}
                            <Col md={12}>
                              <Form.Check
                                type="switch"
                                label="Make this language public (visible to users)"
                                checked={codeSnippetEditForm.isPublic}
                                onChange={(e) =>
                                  handleCodeSnippetEditFormChange(
                                    "isPublic",
                                    e.target.checked,
                                  )
                                }
                                disabled={!editingCodeSnippet}
                              />
                            </Col>

                            <Col md={12}>
                              <Form.Label className="fw-semibold">
                                Code Snippet (shown to user)
                              </Form.Label>
                              <div
                                style={{
                                  height: "400px",
                                  border: "1px solid #dee2e6",
                                  borderRadius: "0.375rem",
                                }}
                              >
                                <CodeEditor
                                  code={codeSnippetEditForm.codeSnippet}
                                  language={currentCodeSnippet.languageSlug}
                                  onCodeChange={(value) =>
                                    handleCodeSnippetEditFormChange(
                                      "codeSnippet",
                                      value,
                                    )
                                  }
                                  readonly={!editingCodeSnippet}
                                />
                              </div>
                            </Col>

                            <Col md={12}>
                              <Form.Label className="fw-semibold">
                                Driver Code
                              </Form.Label>
                              <div
                                style={{
                                  height: "400px",
                                  border: "1px solid #dee2e6",
                                  borderRadius: "0.375rem",
                                }}
                              >
                                <CodeEditor
                                  code={codeSnippetEditForm.driver}
                                  language={currentCodeSnippet.languageSlug}
                                  onCodeChange={(value) =>
                                    handleCodeSnippetEditFormChange(
                                      "driver",
                                      value,
                                    )
                                  }
                                  readonly={!editingCodeSnippet}
                                />
                              </div>
                            </Col>

                            <Col md={12}>
                              <Form.Label className="fw-semibold">
                                Checker Code
                              </Form.Label>
                              <div
                                style={{
                                  height: "400px",
                                  border: "1px solid #dee2e6",
                                  borderRadius: "0.375rem",
                                }}
                              >
                                <CodeEditor
                                  code={codeSnippetEditForm.checker}
                                  language={currentCodeSnippet.languageSlug}
                                  onCodeChange={(value) =>
                                    handleCodeSnippetEditFormChange(
                                      "checker",
                                      value,
                                    )
                                  }
                                  readonly={!editingCodeSnippet}
                                />
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </Tab>

            <Tab
              eventKey="testcases"
              title={`Test Cases (${testcases.length})`}
            >
              <div className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h6 className="fw-semibold mb-0">Test Cases</h6>
                    <p className="text-muted small mb-0">
                      Configure test cases and limits
                    </p>
                  </div>
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="outline-primary"
                      size="sm"
                      id="add-testcase-dropdown"
                    >
                      <Plus size={14} /> Add Test Case
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={handleAddTestcase}>
                        <div className="d-flex align-items-center gap-2">
                          <Plus size={14} />
                          <div>
                            <div className="fw-semibold">
                              New Empty Test Case
                            </div>
                            <small className="text-muted">
                              Start from scratch
                            </small>
                          </div>
                        </div>
                      </Dropdown.Item>
                      {recentTestcases.length > 0 && (
                        <>
                          <Dropdown.Divider />
                          <Dropdown.Header className="d-flex align-items-center gap-2">
                            <Clock size={14} />
                            Recent Templates
                          </Dropdown.Header>
                          {recentTestcases.map((testcase) => (
                            <Dropdown.Item
                              key={testcase.id}
                              onClick={() =>
                                handleAddTestcaseWithTemplate(testcase)
                              }
                            >
                              <div className="d-flex align-items-center gap-2">
                                <Copy size={14} />
                                <div>
                                  <div className="fw-semibold">
                                    Test Case #{testcases.indexOf(testcase) + 1}
                                  </div>
                                  <small className="text-muted">
                                    Copy input and expected output
                                    {testcase.isPublic && (
                                      <Badge bg="info" className="ms-2">
                                        Public
                                      </Badge>
                                    )}
                                  </small>
                                </div>
                              </div>
                            </Dropdown.Item>
                          ))}
                        </>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                {/* Limits */}
                <Row className="mb-4">
                  <Col md={6}>
                    <Card>
                      <Card.Body>
                        <Form.Group>
                          <Form.Label className="fw-semibold">
                            Time Limit (ms)
                          </Form.Label>
                          <div className="d-flex gap-2">
                            <Form.Control
                              type="number"
                              value={limitsConfig.timeLimit}
                              onChange={(e) =>
                                handleLimitsChange(
                                  "timeLimit",
                                  parseInt(e.target.value),
                                )
                              }
                              min="100"
                              max="10000"
                            />
                            <Button
                              variant="primary"
                              onClick={handleSaveLimits}
                              disabled={updateLimitsConfigMutation.isPending}
                            >
                              Save
                            </Button>
                          </div>
                          <small className="text-muted">
                            Maximum execution time in milliseconds
                          </small>
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card>
                      <Card.Body>
                        <Form.Group>
                          <Form.Label className="fw-semibold">
                            Memory Limit (MB)
                          </Form.Label>
                          <div className="d-flex gap-2">
                            <Form.Control
                              type="number"
                              value={limitsConfig.memoryLimit}
                              onChange={(e) =>
                                handleLimitsChange(
                                  "memoryLimit",
                                  parseInt(e.target.value),
                                )
                              }
                              min="1"
                              max="2048"
                            />
                            <Button
                              variant="primary"
                              onClick={handleSaveLimits}
                              disabled={updateLimitsConfigMutation.isPending}
                            >
                              Save
                            </Button>
                          </div>
                          <small className="text-muted">
                            Maximum memory usage in megabytes
                          </small>
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Test Cases List */}
                {testcases.length === 0 ? (
                  <Alert variant="info">
                    No test cases added. Test cases are required for problem
                    validation. Click "Add Test Case" to create your first test
                    case.
                  </Alert>
                ) : (
                  <div>
                    {testcases.map((testcase, index) => (
                      <Card key={testcase.id} className="mb-3">
                        <Card.Header>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="fw-semibold">
                              Test Case #{index + 1} (ID: {testcase.id})
                              {testcase.isPublic && (
                                <Badge bg="info" className="ms-2">
                                  Public
                                </Badge>
                              )}
                            </div>
                            <div className="d-flex gap-2">
                              <Dropdown>
                                <Dropdown.Toggle
                                  variant="outline-info"
                                  size="sm"
                                  id={`testcase-actions-${testcase.id}`}
                                >
                                  Actions
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item
                                    onClick={() => handleEditTestcase(testcase)}
                                  >
                                    <div className="d-flex align-items-center gap-2">
                                      <Pencil size={14} />
                                      Edit
                                    </div>
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() =>
                                      handleAddTestcaseWithTemplate(testcase)
                                    }
                                  >
                                    <div className="d-flex align-items-center gap-2">
                                      <Copy size={14} />
                                      Use as Template
                                    </div>
                                  </Dropdown.Item>
                                  <Dropdown.Divider />
                                  <Dropdown.Item
                                    onClick={() =>
                                      handleDeleteTestcase(testcase.id)
                                    }
                                    className="text-danger"
                                  >
                                    <div className="d-flex align-items-center gap-2">
                                      <Trash size={14} />
                                      Delete
                                    </div>
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                          </div>
                        </Card.Header>
                        <Card.Body>
                          <Row className="g-3">
                            <Col md={6}>
                              <Form.Label>Input</Form.Label>
                              <div
                                style={{
                                  height: "100px",
                                  border: "1px solid #dee2e6",
                                  borderRadius: "0.375rem",
                                }}
                              >
                                <CodeEditor
                                  code={
                                    typeof testcase.input === "string"
                                      ? testcase.input
                                      : JSON.stringify(testcase.input, null, 2)
                                  }
                                  language="json"
                                  onCodeChange={() => {}}
                                  readonly={true}
                                />
                              </div>
                            </Col>
                            <Col md={6}>
                              <Form.Label>Expected Output</Form.Label>
                              <div
                                style={{
                                  height: "100px",
                                  border: "1px solid #dee2e6",
                                  borderRadius: "0.375rem",
                                }}
                              >
                                <CodeEditor
                                  code={
                                    typeof testcase.expected === "string"
                                      ? testcase.expected
                                      : JSON.stringify(
                                          testcase.expected,
                                          null,
                                          2,
                                        )
                                  }
                                  language="json"
                                  onCodeChange={() => {}}
                                  readonly={true}
                                />
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Hint Modal with Markdown Editor */}
      <Modal
        show={showHintModal}
        onHide={() => setShowHintModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{editingHint ? "Edit Hint" : "Add Hint"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Hint Text (Markdown supported)</Form.Label>
            <div data-color-mode="light">
              <MDEditor
                value={hintForm.hint}
                onChange={handleHintFormChange}
                height={300}
                preview="edit"
                visibleDragbar={false}
              />
            </div>
            <small className="text-muted">
              You can use Markdown for formatting, code blocks, lists, etc.
            </small>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHintModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitHint}
            disabled={
              createHintMutation.isPending || updateHintMutation.isPending
            }
          >
            {createHintMutation.isPending || updateHintMutation.isPending ? (
              <Spinner animation="border" size="sm" />
            ) : editingHint ? (
              "Update Hint"
            ) : (
              "Add Hint"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Testcase Modal */}
      <Modal
        show={showTestcaseModal}
        onHide={() => setShowTestcaseModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTestcase ? "Edit Test Case" : "Add Test Case"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={12}>
              <Form.Check
                type="switch"
                label="Public (visible to users)"
                checked={testcaseForm.isPublic}
                onChange={(e) =>
                  handleTestcaseFormChange("isPublic", e.target.checked)
                }
              />
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Input (JSON)</Form.Label>
                <div
                  style={{
                    height: "200px",
                    border: "1px solid #dee2e6",
                    borderRadius: "0.375rem",
                  }}
                >
                  <CodeEditor
                    code={testcaseForm.input}
                    language="json"
                    onCodeChange={(value) =>
                      handleTestcaseFormChange("input", value)
                    }
                    readonly={false}
                  />
                </div>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Expected Output (JSON)</Form.Label>
                <div
                  style={{
                    height: "200px",
                    border: "1px solid #dee2e6",
                    borderRadius: "0.375rem",
                  }}
                >
                  <CodeEditor
                    code={testcaseForm.expected}
                    language="json"
                    onCodeChange={(value) =>
                      handleTestcaseFormChange("expected", value)
                    }
                    readonly={false}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowTestcaseModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitTestcase}
            disabled={
              createTestcaseMutation.isPending ||
              updateTestcaseMutation.isPending
            }
          >
            {createTestcaseMutation.isPending ||
            updateTestcaseMutation.isPending ? (
              <Spinner animation="border" size="sm" />
            ) : editingTestcase ? (
              "Update Test Case"
            ) : (
              "Add Test Case"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
