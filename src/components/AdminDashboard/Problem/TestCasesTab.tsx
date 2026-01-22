import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Alert,
  Form,
  Badge,
  Dropdown,
} from "react-bootstrap";
import {
  Plus,
  Trash,
  Pencil,
  Copy,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "react-bootstrap-icons";
import CodeEditor from "~/components/Shared/CodeEditor";

interface Testcase {
  id: number;
  input: any;
  expected: any;
  isPublic: boolean;
}

interface LimitsConfig {
  timeLimit: number;
  memoryLimit: number;
}

interface TestCasesTabProps {
  testcases: Testcase[];
  recentTestcases: Testcase[];
  limitsConfig: LimitsConfig;
  setLimitsConfig: React.Dispatch<React.SetStateAction<LimitsConfig>>;
  handleAddTestcase: () => void;
  handleAddTestcaseWithTemplate: (testcase: Testcase) => void;
  handleEditTestcase: (testcase: Testcase) => void;
  handleDeleteTestcase: (testcaseId: number) => void;
  handleLimitsChange: (field: keyof LimitsConfig, value: number) => void;
  handleSaveLimits: () => void;
  updateLimitsConfigMutationPending: boolean;
}

export default function TestCasesTab({
  testcases,
  recentTestcases,
  limitsConfig,
  handleAddTestcase,
  handleAddTestcaseWithTemplate,
  handleEditTestcase,
  handleDeleteTestcase,
  handleLimitsChange,
  handleSaveLimits,
  updateLimitsConfigMutationPending,
}: TestCasesTabProps) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const testcasesPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(testcases.length / testcasesPerPage);
  const startIndex = (currentPage - 1) * testcasesPerPage;
  const endIndex = startIndex + testcasesPerPage;
  const currentTestcases = testcases.slice(startIndex, endIndex);

  // Reset to page 1 when test cases change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [testcases.length, currentPage, totalPages]);

  return (
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
                  <div className="fw-semibold">New Empty Test Case</div>
                  <small className="text-muted">Start from scratch</small>
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
                    onClick={() => handleAddTestcaseWithTemplate(testcase)}
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
                <Form.Label className="fw-semibold">Time Limit (ms)</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="number"
                    value={limitsConfig.timeLimit}
                    onChange={(e) =>
                      handleLimitsChange("timeLimit", parseInt(e.target.value))
                    }
                    min="100"
                    max="10000"
                  />
                  <Button
                    variant="primary"
                    onClick={handleSaveLimits}
                    disabled={updateLimitsConfigMutationPending}
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
                      handleLimitsChange("memoryLimit", parseInt(e.target.value))
                    }
                    min="1"
                    max="2048"
                  />
                  <Button
                    variant="primary"
                    onClick={handleSaveLimits}
                    disabled={updateLimitsConfigMutationPending}
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
          No test cases added. Test cases are required for problem validation.
          Click "Add Test Case" to create your first test case.
        </Alert>
      ) : (
        <div>
          {/* Pagination Info */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="text-muted">
              Showing {startIndex + 1} -{" "}
              {Math.min(endIndex, testcases.length)} of {testcases.length} test
              cases
            </div>
            {totalPages > 1 && (
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={14} /> Previous
                </Button>
                <span className="text-muted">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight size={14} />
                </Button>
              </div>
            )}
          </div>

          {currentTestcases.map((testcase) => {
            const index = testcases.indexOf(testcase);
            return (
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
                            onClick={() => handleDeleteTestcase(testcase.id)}
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
                              : JSON.stringify(testcase.expected, null, 2)
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
            );
          })}

          {/* Bottom Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={14} /> Previous
              </Button>
              <span className="text-muted">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
