import { useState } from "react";
import {
  Card,
  Button,
  Alert,
  Form,
  Badge,
  Spinner,
  Dropdown,
  Tabs,
  Tab,
} from "react-bootstrap";
import {
  Pencil,
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
  const [activeCodeTab, setActiveCodeTab] = useState("snippet");

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
          {/* Language Selector - Dropdown */}
          <div className="mb-4">
            <Form.Group>
              <Form.Label className="fw-semibold">Select Language</Form.Label>
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" id="language-dropdown" className="w-100 d-flex justify-content-between align-items-center">
                  <span className="d-flex align-items-center gap-2">
                    {currentCodeSnippet?.languageName || "Select a language"}
                    {currentCodeSnippet?.isPublic ? (
                      <Badge bg="success" className="d-flex align-items-center gap-1">
                        Public
                      </Badge>
                    ) : currentCodeSnippet ? (
                      <Badge bg="secondary" className="d-flex align-items-center gap-1">
                        Private
                      </Badge>
                    ) : null}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100">
                  {codeSnippets.map((snippet) => (
                    <Dropdown.Item
                      key={snippet.languageSlug}
                      onClick={() => setSelectedLanguage(snippet.languageSlug)}
                      active={selectedLanguage === snippet.languageSlug}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span>{snippet.languageName}</span>
                        {snippet.isPublic ? (
                          <Badge bg="success" className="d-flex align-items-center gap-1">
                            Public
                          </Badge>
                        ) : (
                          <Badge bg="secondary" className="d-flex align-items-center gap-1">
                            Private
                          </Badge>
                        )}
                      </div>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>
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
                        Public
                      </Badge>
                    ) : (
                      <Badge
                        bg="secondary"
                        className="d-flex align-items-center gap-1"
                      >
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
              <Card.Body className="p-0">
                {/* Public/Private Toggle */}
                <div className="p-3">
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
                </div>

                {/* Tabs for Code Sections */}
                <Tabs
                  activeKey={activeCodeTab}
                  onSelect={(k) => setActiveCodeTab(k || "snippet")}
                  fill
                >
                  <Tab eventKey="snippet" title="Code Snippet">
                    <div className="">
                      <pre
                        className="rounded-bottom m-0"
                        style={{
                          height: "500px",
                          resize: "vertical",
                          overflow: "auto",
                          minHeight: "300px",
                          maxHeight: "1000px",
                        }}
                      >
                        <CodeEditor
                          code={codeSnippetEditForm.codeSnippet}
                          language={currentCodeSnippet.languageSlug}
                          onCodeChange={(value) =>
                            handleCodeSnippetEditFormChange("codeSnippet", value)
                          }
                          readonly={!editingCodeSnippet}
                          resizable={false}
                        />
                      </pre>
                    </div>
                  </Tab>

                  <Tab eventKey="driver" title="Driver Code">
                    <div className="">
                      <pre
                        className="rounded-bottom m-0"
                        style={{
                          height: "500px",
                          resize: "vertical",
                          overflow: "auto",
                          minHeight: "300px",
                          maxHeight: "1000px",
                        }}
                      >
                        <CodeEditor
                          code={codeSnippetEditForm.driver}
                          language={currentCodeSnippet.languageSlug}
                          onCodeChange={(value) =>
                            handleCodeSnippetEditFormChange("driver", value)
                          }
                          readonly={!editingCodeSnippet}
                          resizable={false}
                        />
                      </pre>
                    </div>
                  </Tab>

                  <Tab eventKey="checker" title="Checker Code">
                    <div className="">
                      <pre
                        className="rounded-bottom m-0"
                        style={{
                          height: "500px",
                          resize: "vertical",
                          overflow: "auto",
                          minHeight: "300px",
                          maxHeight: "1000px",
                        }}
                      >
                        <CodeEditor
                          code={codeSnippetEditForm.checker}
                          language={currentCodeSnippet.languageSlug}
                          onCodeChange={(value) =>
                            handleCodeSnippetEditFormChange("checker", value)
                          }
                          readonly={!editingCodeSnippet}
                          resizable={false}
                        />
                      </pre>
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
