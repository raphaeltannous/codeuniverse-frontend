import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "~/context/AuthContext";
import { apiFetch } from "~/utils/api";
import { useNotification } from "~/hooks/useNotification";

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

export function useAdminProblem(slug: string) {
  const { auth } = useAuth();
  const queryClient = useQueryClient();
  const notification = useNotification();

  const [activeTab, setActiveTab] = useState("basic");

  // Modal states
  const [showHintModal, setShowHintModal] = useState(false);
  const [showTestcaseModal, setShowTestcaseModal] = useState(false);
  const [editingHint, setEditingHint] = useState<Hint | null>(null);
  const [editingTestcase, setEditingTestcase] = useState<ProblemTestcase | null>(null);

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
  const [editingCodeSnippet, setEditingCodeSnippet] = useState<ProblemCode | null>(null);
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
      const response = await apiFetch(`/api/admin/problems/${slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch problem");
      }
      return response.json();
    },
    enabled: !!auth.isAuthenticated && !!slug,
  });

  // Fetch hints separately
  const {
    data: hints = [],
    isLoading: isLoadingHints,
  } = useQuery<Hint[]>({
    queryKey: ["admin-problem-hints", slug],
    queryFn: async () => {
      const response = await apiFetch(`/api/admin/problems/${slug}/hints`);
      if (!response.ok) {
        throw new Error("Failed to fetch hints");
      }
      return response.json();
    },
    enabled: !!auth.isAuthenticated && !!slug,
  });

  // Fetch code snippets separately
  const {
    data: codeSnippets = [],
    isLoading: isLoadingCodeSnippets,
  } = useQuery<ProblemCode[]>({
    queryKey: ["admin-problem-code-snippets", slug],
    queryFn: async () => {
      const response = await apiFetch(`/api/admin/problems/${slug}/code-snippets`);
      if (!response.ok) {
        throw new Error("Failed to fetch code snippets");
      }
      return response.json();
    },
    enabled: !!auth.isAuthenticated && !!slug,
  });

  // Fetch testcases separately
  const {
    data: fetchedTestcases = [],
    isLoading: isLoadingTestcases,
  } = useQuery<ProblemTestcase[]>({
    queryKey: ["admin-problem-testcases", slug],
    queryFn: async () => {
      const response = await apiFetch(`/api/admin/problems/${slug}/testcases`);
      if (!response.ok) {
        throw new Error("Failed to fetch test cases");
      }
      return response.json();
    },
    enabled: !!auth.isAuthenticated && !!slug,
  });

  // Fetch limits config separately
  const {
    data: fetchedLimitsConfig,
    isLoading: isLoadingLimits,
  } = useQuery<ProblemCodeConfig>({
    queryKey: ["admin-problem-limits", slug],
    queryFn: async () => {
      const response = await apiFetch(`/api/admin/problems/${slug}/config`);
      if (!response.ok) {
        throw new Error("Failed to fetch limits config");
      }
      return response.json();
    },
    enabled: !!auth.isAuthenticated && !!slug,
  });

  // Fetch supported languages
  const { data: supportedLanguages = [], isLoading: isLoadingLanguages } =
    useQuery<Language[]>({
      queryKey: ["supported-languages"],
      queryFn: async () => {
        const response = await apiFetch("/api/admin/supported-languages");
        if (!response.ok) {
          throw new Error("Failed to fetch supported languages");
        }
        return (await response.json()) as Language[];
      },
      enabled: !!auth.isAuthenticated,
    });

  // Use effects
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

  useEffect(() => {
    if (fetchedTestcases) {
      setTestcases(fetchedTestcases);
    }
  }, [fetchedTestcases]);

  useEffect(() => {
    if (fetchedLimitsConfig) {
      setLimitsConfig(fetchedLimitsConfig);
    }
  }, [fetchedLimitsConfig]);

  useEffect(() => {
    if (codeSnippets.length > 0 && !selectedLanguage) {
      setSelectedLanguage(codeSnippets[0].languageSlug);
    }
  }, [codeSnippets, selectedLanguage]);

  useEffect(() => {
    if (selectedLanguage) {
      setEditingCodeSnippet(null);
      const snippet = codeSnippets.find((s) => s.languageSlug === selectedLanguage);
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

  // Mutations
  const updateProblemMutation = useMutation({
    mutationFn: async (data: ProblemFormData) => {
      const response = await apiFetch(`/api/admin/problems/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
      notification.success("Problem updated successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to update problem");
    },
  });

  const createHintMutation = useMutation({
    mutationFn: async (hint: string) => {
      const response = await apiFetch(`/api/admin/problems/${slug}/hints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hint }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create hint");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-problem-hints", slug] });
      setShowHintModal(false);
      setHintForm({ hint: "" });
      setEditingHint(null);
      notification.success("Hint added successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to create hint");
    },
  });

  const updateHintMutation = useMutation({
    mutationFn: async ({ hintId, hint }: { hintId: string; hint: string }) => {
      const response = await apiFetch(`/api/admin/problems/${slug}/hints/${hintId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hint }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update hint");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-problem-hints", slug] });
      setShowHintModal(false);
      setHintForm({ hint: "" });
      setEditingHint(null);
      notification.success("Hint updated successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to update hint");
    },
  });

  const deleteHintMutation = useMutation({
    mutationFn: async (hintId: string) => {
      const response = await apiFetch(`/api/admin/problems/${slug}/hints/${hintId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete hint");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-problem-hints", slug] });
      notification.success("Hint deleted successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to delete hint");
    },
  });

  const updateCodeSnippetMutation = useMutation({
    mutationFn: async ({ languageSlug, data }: { languageSlug: string; data: ProblemCode }) => {
      const response = await apiFetch(
        `/api/admin/problems/${slug}/code-snippets/${languageSlug}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update code snippet");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-problem-code-snippets", slug] });
      setEditingCodeSnippet(null);
      notification.success("Code snippet updated successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to update code snippet");
    },
  });

  const createTestcaseMutation = useMutation({
    mutationFn: async (data: Omit<ProblemTestcase, "id">) => {
      const response = await apiFetch(`/api/admin/problems/${slug}/testcases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create test case");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-problem-testcases", slug] });
      setShowTestcaseModal(false);
      setTestcaseForm({ input: "", expected: "", isPublic: false });
      setEditingTestcase(null);
      notification.success("Test case added successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to create test case");
    },
  });

  const updateTestcaseMutation = useMutation({
    mutationFn: async ({
      testcaseId,
      data,
    }: {
      testcaseId: number;
      data: Omit<ProblemTestcase, "id">;
    }) => {
      const response = await apiFetch(
        `/api/admin/problems/${slug}/testcases/${testcaseId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update test case");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-problem-testcases", slug] });
      setShowTestcaseModal(false);
      setTestcaseForm({ input: "", expected: "", isPublic: false });
      setEditingTestcase(null);
      notification.success("Test case updated successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to update test case");
    },
  });

  const deleteTestcaseMutation = useMutation({
    mutationFn: async (testcaseId: number) => {
      const response = await apiFetch(
        `/api/admin/problems/${slug}/testcases/${testcaseId}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        throw new Error("Failed to delete test case");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-problem-testcases", slug] });
      notification.success("Test case deleted successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to delete test case");
    },
  });

  const updateLimitsConfigMutation = useMutation({
    mutationFn: async (data: ProblemCodeConfig) => {
      const response = await apiFetch(`/api/admin/problems/${slug}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update limits");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-problem-limits", slug] });
      notification.success("Limits updated successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to update limits");
    },
  });

  // Computed values
  const currentCodeSnippet = codeSnippets.find(
    (snippet) => snippet.languageSlug === selectedLanguage
  );

  const recentTestcases = [...testcases]
    .sort((a, b) => b.id - a.id)
    .slice(0, 3);

  const isLoading =
    isLoadingProblem ||
    isLoadingHints ||
    isLoadingCodeSnippets ||
    isLoadingTestcases ||
    isLoadingLimits ||
    isLoadingLanguages;

  return {
    // Data
    problem,
    hints,
    codeSnippets,
    testcases,
    limitsConfig,
    supportedLanguages,
    currentCodeSnippet,
    recentTestcases,
    
    // Loading states
    isLoading,
    isLoadingProblem,
    isProblemError,
    problemError,
    
    // UI State
    activeTab,
    setActiveTab,
    
    // Modals
    showHintModal,
    setShowHintModal,
    showTestcaseModal,
    setShowTestcaseModal,
    editingHint,
    setEditingHint,
    editingTestcase,
    setEditingTestcase,
    
    // Forms
    formData,
    setFormData,
    hintForm,
    setHintForm,
    testcaseForm,
    setTestcaseForm,
    setLimitsConfig,
    
    // Code snippet state
    selectedLanguage,
    setSelectedLanguage,
    editingCodeSnippet,
    setEditingCodeSnippet,
    codeSnippetEditForm,
    setCodeSnippetEditForm,
    
    // Mutations
    updateProblemMutation,
    createHintMutation,
    updateHintMutation,
    deleteHintMutation,
    updateCodeSnippetMutation,
    createTestcaseMutation,
    updateTestcaseMutation,
    deleteTestcaseMutation,
    updateLimitsConfigMutation,
  };
}
