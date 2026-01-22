import {
  Row,
  Col,
  Card,
  Button,
  Alert,
  Form,
  Badge,
  Spinner,
} from "react-bootstrap";
import {
  Pencil,
  Eye,
  EyeSlash,
  Check,
} from "react-bootstrap-icons";
import CodeEditor from "~/components/Shared/CodeEditor";

interface CodeSnippet {
  languageSlug: string;
  languageName: string;
  codeSnippet: string;
  driver: string;
  checker: string;
  isPublic: boolean;
}

interface SupportedLanguage {
  languageSlug: string;
  languageName: string;
}

interface CodeSnippetEditForm {
  codeSnippet: string;
  driver: string;
  checker: string;
  isPublic: boolean;
}

interface CodeSnippetsTabProps {
  codeSnippets: CodeSnippet[];
  supportedLanguages: SupportedLanguage[];
  currentCodeSnippet: CodeSnippet | null;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  editingCodeSnippet: CodeSnippet | null;
  codeSnippetEditForm: CodeSnippetEditForm;
  handleStartEditCodeSnippet: () => void;
  handleCancelEditCodeSnippet: () => void;
  handleCodeSnippetEditFormChange: (field: keyof CodeSnippetEditForm, value: any) => void;
  handleSaveCodeSnippet: () => void;
  updateCodeSnippetMutationPending: boolean;
}

export default function CodeSnippetsTab({
  codeSnippets,
  currentCodeSnippet,
  selectedLanguage,
  setSelectedLanguage,
  editingCodeSnippet,
  codeSnippetEditForm,
  handleStartEditCodeSnippet,
  handleCancelEditCodeSnippet,
  handleCodeSnippetEditFormChange,
  handleSaveCodeSnippet,
  updateCodeSnippetMutationPending,
}: CodeSnippetsTabProps) {
  return (
    <div className="p-3">
      <div className="mb-3">
        <h6 className="fw-semibold mb-0">Code Snippets</h6>
        <p className="text-muted small mb-0">
          Languages are automatically created by the backend. Edit to make them
          public or update code.
        </p>
      </div>

      {codeSnippets.length === 0 ? (
        <Alert variant="info">
          No code snippets available. The backend will automatically create
          language entries.
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
                      onClick={() => setSelectedLanguage(snippet.languageSlug)}
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
                          disabled={updateCodeSnippetMutationPending}
                          className="d-flex align-items-center gap-2"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={handleSaveCodeSnippet}
                          disabled={updateCodeSnippetMutationPending}
                          className="d-flex align-items-center gap-2"
                        >
                          {updateCodeSnippetMutationPending ? (
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
                        disabled={updateCodeSnippetMutationPending}
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
                          e.target.checked
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
                          handleCodeSnippetEditFormChange("codeSnippet", value)
                        }
                        readonly={!editingCodeSnippet}
                      />
                    </div>
                  </Col>

                  <Col md={12}>
                    <Form.Label className="fw-semibold">Driver Code</Form.Label>
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
                          handleCodeSnippetEditFormChange("driver", value)
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
                          handleCodeSnippetEditFormChange("checker", value)
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
  );
}
