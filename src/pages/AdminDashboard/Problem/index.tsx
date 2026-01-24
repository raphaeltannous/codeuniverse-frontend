import { useParams, useNavigate } from "react-router";
import {
  Container,
  Card,
  Button,
  Alert,
  Tabs,
  Tab,
} from "react-bootstrap";
import {
  ArrowLeft,
} from "react-bootstrap-icons";
import { useAdminProblem, type Difficulty } from "~/hooks/useAdminProblem";
import { useNotification } from "~/hooks/useNotification";
import TestCasesTab from "~/components/AdminDashboard/Problem/TestCasesTab";
import CodeSnippetsTab from "~/components/AdminDashboard/Problem/CodeSnippetsTab";
import HintsTab from "~/components/AdminDashboard/Problem/HintsTab";
import BasicInfoTab from "~/components/AdminDashboard/Problem/BasicInfoTab";
import ProblemEditSkeleton from "~/components/AdminDashboard/Problem/ProblemEditSkeleton";

export default function EditProblemPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const notification = useNotification();

  const {
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
  } = useAdminProblem(slug || "");

  // Handler functions
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "difficulty" 
        ? (value as Difficulty)
        : type === "checkbox" 
        ? (e.target as HTMLInputElement).checked 
        : value,
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

  const handleEditHint = (hint: any) => {
    setEditingHint(hint);
    setHintForm({ hint: hint.hint });
    setShowHintModal(true);
  };

  const handleDeleteHint = (hintId: string) => {
    if (window.confirm("Are you sure you want to delete this hint?")) {
      deleteHintMutation.mutate(hintId);
    }
  };

  const handleSubmitHint = (hint: string) => {
    if (editingHint) {
      updateHintMutation.mutate({ hintId: editingHint.id, hint });
    } else {
      createHintMutation.mutate(hint);
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

  const handleCodeSnippetEditFormChange = (field: keyof typeof codeSnippetEditForm, value: any) => {
    setCodeSnippetEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveCodeSnippet = () => {
    if (!currentCodeSnippet) return;

    const selectedLang = supportedLanguages.find(
      (lang) => lang.languageSlug === currentCodeSnippet.languageSlug
    );
    if (!selectedLang) {
      notification.error("Invalid language selected");
      return;
    }

    const data = {
      codeSnippet: codeSnippetEditForm.codeSnippet,
      checker: codeSnippetEditForm.checker,
      driver: codeSnippetEditForm.driver,
      isPublic: codeSnippetEditForm.isPublic,
      languageName: selectedLang.languageName,
      languageSlug: currentCodeSnippet.languageSlug,
    };

    updateCodeSnippetMutation.mutate({ languageSlug: currentCodeSnippet.languageSlug, data });
  };

  // Testcase handlers
  const handleAddTestcase = () => {
    setEditingTestcase(null);
    setTestcaseForm({ input: "", expected: "", isPublic: false });
    setShowTestcaseModal(true);
  };

  const handleAddTestcaseWithTemplate = (templateTestcase: any) => {
    setEditingTestcase(null);
    setTestcaseForm({
      input: typeof templateTestcase.input === "string"
        ? templateTestcase.input
        : JSON.stringify(templateTestcase.input, null, 2),
      expected: typeof templateTestcase.expected === "string"
        ? templateTestcase.expected
        : JSON.stringify(templateTestcase.expected, null, 2),
      isPublic: templateTestcase.isPublic
    });
    setShowTestcaseModal(true);
  };

  const handleEditTestcase = (testcase: any) => {
    setEditingTestcase(testcase);
    setTestcaseForm({
      input: typeof testcase.input === "string"
        ? testcase.input
        : JSON.stringify(testcase.input, null, 2),
      expected: typeof testcase.expected === "string"
        ? testcase.expected
        : JSON.stringify(testcase.expected, null, 2),
      isPublic: testcase.isPublic
    });
    setShowTestcaseModal(true);
  };

  const handleDeleteTestcase = (testcaseId: number) => {
    if (window.confirm("Are you sure you want to delete this test case?")) {
      deleteTestcaseMutation.mutate(testcaseId);
    }
  };

  const handleSubmitTestcase = (data: { input: any; expected: any; isPublic: boolean }) => {
    if (editingTestcase) {
      updateTestcaseMutation.mutate({ testcaseId: editingTestcase.id, data });
    } else {
      createTestcaseMutation.mutate(data);
    }
  };

  // Limits handlers
  const handleLimitsChange = (field: keyof typeof limitsConfig, value: number) => {
    setLimitsConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveLimits = () => {
    updateLimitsConfigMutation.mutate(limitsConfig);
  };

  // Handle save button click
  const handleSaveClick = () => {
    if (!formData.title.trim()) {
      notification.error("Problem title is required");
      return;
    }

    if (!formData.slug.trim()) {
      notification.error("Problem slug is required");
      return;
    }

    if (!formData.description.trim()) {
      notification.error("Problem description is required");
      return;
    }

    if (!formData.difficulty.trim()) {
      notification.error("Problem difficulty is required");
      return;
    }

    updateProblemMutation.mutate(formData);
  };

  const difficultyOptions: Difficulty[] = [
    "Easy",
    "Medium",
    "Hard",
  ];

  if (isLoading) {
    return <ProblemEditSkeleton />;
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
      <Card className="border-0 mb-4">
        <Card.Body className="p-0">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || "basic")}
            className="border-bottom px-3 pt-2"
            fill
          >
            <Tab eventKey="basic" title="Basic Info">
              <BasicInfoTab
                formData={formData}
                setFormData={setFormData as any}
                difficultyOptions={difficultyOptions}
                handleInputChange={handleInputChange}
                handleSlugGenerate={handleSlugGenerate}
                handleDescriptionChange={handleDescriptionChange}
                handleSaveClick={handleSaveClick}
                updateProblemMutationPending={updateProblemMutation.isPending}
                onCancel={() => navigate("/dashboard/problems")}
              />
            </Tab>

            <Tab eventKey="hints" title={`Hints (${hints.length})`}>
              <HintsTab
                hints={hints}
                handleAddHint={handleAddHint}
                handleEditHint={handleEditHint}
                handleDeleteHint={handleDeleteHint}
                createHintMutationPending={createHintMutation.isPending}
                updateHintMutationPending={updateHintMutation.isPending}
                deleteHintMutationPending={deleteHintMutation.isPending}
                showHintModal={showHintModal}
                setShowHintModal={setShowHintModal}
                editingHint={editingHint}
                setEditingHint={setEditingHint}
                handleSubmitHint={handleSubmitHint}
                isHintSubmitting={
                  createHintMutation.isPending ||
                  updateHintMutation.isPending
                }
              />
            </Tab>

            <Tab
              eventKey="code"
              title={`Code Snippets (${codeSnippets.length})`}
            >
              <CodeSnippetsTab
                codeSnippets={codeSnippets}
                supportedLanguages={supportedLanguages}
                currentCodeSnippet={currentCodeSnippet || null}
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
                editingCodeSnippet={editingCodeSnippet}
                codeSnippetEditForm={codeSnippetEditForm}
                handleStartEditCodeSnippet={handleStartEditCodeSnippet}
                handleCancelEditCodeSnippet={handleCancelEditCodeSnippet}
                handleCodeSnippetEditFormChange={handleCodeSnippetEditFormChange}
                handleSaveCodeSnippet={handleSaveCodeSnippet}
                updateCodeSnippetMutationPending={updateCodeSnippetMutation.isPending}
              />
            </Tab>

            <Tab
              eventKey="testcases"
              title={`Test Cases (${testcases.length})`}
            >
              <TestCasesTab
                testcases={testcases}
                recentTestcases={recentTestcases}
                limitsConfig={limitsConfig}
                setLimitsConfig={setLimitsConfig}
                handleAddTestcase={handleAddTestcase}
                handleAddTestcaseWithTemplate={handleAddTestcaseWithTemplate}
                handleEditTestcase={handleEditTestcase}
                handleDeleteTestcase={handleDeleteTestcase}
                handleLimitsChange={handleLimitsChange}
                handleSaveLimits={handleSaveLimits}
                updateLimitsConfigMutationPending={updateLimitsConfigMutation.isPending}
                showTestcaseModal={showTestcaseModal}
                setShowTestcaseModal={setShowTestcaseModal}
                editingTestcase={editingTestcase}
                setEditingTestcase={setEditingTestcase}
                testcaseForm={testcaseForm}
                handleSubmitTestcase={handleSubmitTestcase}
                isTestcaseSubmitting={
                  createTestcaseMutation.isPending ||
                  updateTestcaseMutation.isPending
                }
              />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
}
