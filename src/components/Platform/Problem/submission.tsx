import { Badge, Card, Col, Row, Accordion } from "react-bootstrap";
import CodeEditor from "~/components/Shared/CodeEditor";
import type { ResultStatus } from "~/types/problem/status";
import type { Submission } from "~/types/problem/submission";

interface SubmissionProps {
  submission: Submission;
}

export default function SubmissionCard({ submission }: SubmissionProps) {
  const getStatusBadgeColor = (status: ResultStatus): string => {
    switch (status) {
      case "Accepted":
        return "success";
      case "Pending":
      case "Started":
        return "warning";
      case "Time Limit Exceeded":
      case "Memory Limit Exceeded":
        return "info";
      case "Compile Error":
      case "Runtime Error":
        return "secondary";
      case "Internal Server Error":
        return "dark";
      default:
        return "danger";
    }
  };

  const formatBytes = (bytes: number): string => {
    return `${bytes.toFixed(2)} MB`;
  };

  return (
    <Card className="mb-3">
      <Card.Header>
        <Row className="align-items-center mb-2">
          <Col>
            <h5 className="mb-0">Submission #{submission.id.slice(0, 8)}</h5>
          </Col>
          <Col xs="auto">
            <Badge bg={getStatusBadgeColor(submission.status)}>
              {submission.status}
            </Badge>
          </Col>
        </Row>

        <Row className="mb-2">
          <Col xs={12} md={4} className="mb-2 mb-md-0">
            <div className="text-muted small">Execution Time</div>
            <div className="fw-medium">{submission.executionTime} ms</div>
          </Col>
          <Col xs={12} md={4} className="mb-2 mb-md-0">
            <div className="text-muted small">Memory Usage</div>
            <div className="fw-medium">
              {formatBytes(submission.memoryUsage)}
            </div>
          </Col>
          <Col xs={12} md={4}>
            <div className="text-muted small">Language</div>
            <div className="fw-medium">{capitalize(submission.language)}</div>
          </Col>
        </Row>
      </Card.Header>

      <Card.Body className="p-0">
        <div className="submission-editor-height">
          <CodeEditor
            code={submission.code}
            language={submission.language}
            readonly={true}
            onCodeChange={() => {}}
          />
        </div>

        {submission.failedTestcases &&
          submission.failedTestcases.length > 0 && (
            <div className="mt-3 p-3 border-top">
              <h6 className="mb-3">
                Failed Test Cases ({submission.failedTestcases.length})
              </h6>
              <Accordion defaultActiveKey="0">
                {submission.failedTestcases.map((testcase, index) => (
                  <Accordion.Item key={testcase.id} eventKey={index.toString()}>
                    <Accordion.Header>
                      Test Case #{testcase.id}{" "}
                      {testcase.isPublic ? "(Public)" : "(Hidden)"}
                    </Accordion.Header>
                    <Accordion.Body>
                      <Row>
                        <Col xs={12} md={6}>
                          <div className="mb-2">
                            <small className="text-muted">Input:</small>
                            <pre className="bg-body-tertiary p-2 rounded mt-1 mb-2">
                              {JSON.stringify(testcase.input, null, 2)}
                            </pre>
                          </div>
                          <div className="mb-2">
                            <small className="text-muted">
                              Expected Output:
                            </small>
                            <pre className="bg-body-tertiary p-2 rounded mt-1">
                              {JSON.stringify(testcase.expected, null, 2)}
                            </pre>
                          </div>
                        </Col>
                        <Col xs={12} md={6}>
                          <div className="mb-2">
                            <small className="text-muted">Your Output:</small>
                            <pre className="bg-body-tertiary p-2 rounded mt-1 mb-2">
                              {JSON.stringify(testcase.got, null, 2)}
                            </pre>
                          </div>
                          {testcase.stdOut && (
                            <div className="mb-2">
                              <small className="text-muted">
                                Standard Output:
                              </small>
                              <pre className="bg-body-tertiary p-2 rounded mt-1">
                                {testcase.stdOut}
                              </pre>
                            </div>
                          )}
                        </Col>
                      </Row>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          )}

        {/* Standard Output/Error Section */}
        {(submission.stdOut || submission.stdErr) && (
          <div className="mt-3 p-3 border-top">
            <h6 className="mb-3">Execution Details</h6>
            {submission.stdOut && (
              <div className="mb-3">
                <small className="text-muted">Standard Output:</small>
                <pre className="bg-body-tertiary p-2 rounded mt-1 overflow-auto">
                  {submission.stdOut}
                </pre>
              </div>
            )}
            {submission.stdErr && (
              <div>
                <small className="text-muted">Standard Error:</small>
                <pre className="bg-body-tertiary p-2 rounded mt-1 overflow-auto text-danger">
                  {submission.stdErr}
                </pre>
              </div>
            )}
          </div>
        )}
      </Card.Body>

      <Card.Footer className="text-muted">
        <Row>
          <Col xs={12} md={6} className="mb-2 mb-md-0">
            Submitted: {new Date(submission.createdAt).toLocaleString()}
          </Col>
          <Col xs={12} md={6} className="text-md-end">
            Last Updated: {new Date(submission.updatedAt).toLocaleString()}
          </Col>
        </Row>
      </Card.Footer>
    </Card>
  );
}

function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
