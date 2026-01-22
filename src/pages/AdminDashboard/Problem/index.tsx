import { useParams, useNavigate } from "react-router";
import {
  Container,
  Card,
  Button,
  Spinner,
  Alert,
  Form,
  Tabs,
  Tab,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "react-bootstrap-icons";
import MDEditor from "@uiw/react-md-editor";
import CodeEditor from "~/components/Shared/CodeEditor";
import { useAdminProblem, type Difficulty } from "~/hooks/useAdminProblem";
import TestCasesTab from "~/components/AdminDashboard/Problem/TestCasesTab";
import CodeSnippetsTab from "~/components/AdminDashboard/Problem/CodeSnippetsTab";
import HintsTab from "~/components/AdminDashboard/Problem/HintsTab";
import BasicInfoTab from "~/components/AdminDashboard/Problem/BasicInfoTab";

export default function EditProblemPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

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
    actionSuccess,
    setActionSuccess,
    actionError,
    setActionError,
    
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

  const handleHintFormChange = (value: string | undefined) => {
    setHintForm({ hint: value || "" });
  };

  const handleSubmitHint = () => {
    if (!hintForm.hint.trim()) {
      setActionError("Hint text is required");
      return;
    }

    if (editingHint) {
      updateHintMutation.mutate({ hintId: editingHint.id, hint: hintForm.hint });
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

  const handleCodeSnippetEditFormChange = (field: keyof typeof codeSnippetEditForm, value: any) => {
    setCodeSnippetEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveCodeSnippet = () => {
    if (!currentCodeSnippet) return;

    const selectedLang = supportedLanguages.find(
      (lang) => lang.languageSlug === currentCodeSnippet.languageSlug
    );
    if (!selectedLang) {
      setActionError("Invalid language selected");
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

  const handleTestcaseFormChange = (field: keyof typeof testcaseForm, value: any) => {
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
  const handleLimitsChange = (field: keyof typeof limitsConfig, value: number) => {
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
    "Easy",
    "Medium",
    "Hard",
  ];

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
              />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Hint Modal with Markdown Editor */}
      <Modal
        show={showHintModal}
        onHide={() => {
          setShowHintModal(false);
          setEditingHint(null);
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{editingHint ? "Edit Hint" : "Add Hint"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Hint Text (Markdown supported)</Form.Label>
            <div>
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
          <Button variant="secondary" onClick={() => {
            setShowHintModal(false);
            setEditingHint(null);
          }}>
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
        onHide={() => {
          setShowTestcaseModal(false);
          setEditingTestcase(null);
        }}
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
            onClick={() => {
              setShowTestcaseModal(false);
              setEditingTestcase(null);
            }}
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
