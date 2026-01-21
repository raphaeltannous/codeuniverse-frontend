import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
  Alert,
  Tabs,
  Tab,
} from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import CodeEditor from "~/components/Shared/CodeEditor";
import { useRunProblem } from "~/hooks/useRunProblem";
import { useSubmitProblem } from "~/hooks/useSubmitProblem";
import type { Problem } from "~/types/problem/problem";
import { ResultStatus } from "~/types/problem/status";
import type { FailedTestcase } from "~/types/problem/testcase";
import { ChevronDown, ChevronUp } from "react-bootstrap-icons";

interface ProblemEditorProps {
  problem: Problem;
  isAuthenticated?: boolean;
}

export default function ProblemEditor({ problem, isAuthenticated = true }: ProblemEditorProps) {
  const problemSlug = problem.slug;
  const [language, setLanguage] = useState(
    problem.codeSnippets?.[0]?.languageSlug || "go",
  );
  const [code, setCode] = useState(problem.codeSnippets?.[0]?.code || "");

  const { runMutation, runStatusQuery, runId, isCompleted } = useRunProblem(
    problemSlug,
    language,
  );
  const { submitMutation, submissionStatusQuery } = useSubmitProblem(
    problemSlug,
    language,
  );

  const handleRun = () => runMutation.mutate({ code });
  const handleSubmit = () =>
    submitMutation.mutate({ problemSlug, languageSlug: language, code });
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    const snippet = problem.codeSnippets.find(
      (c) => c.languageSlug === newLang,
    );
    setCode(snippet?.code || "");
  };

  if (!problem) return <>Problem not found</>;

  const showRunChecking = !!runId && !isCompleted(runStatusQuery.data?.status ?? ResultStatus.Pending);
  const showRunResult = !!runId && isCompleted(runStatusQuery.data?.status ?? ResultStatus.Pending);
  const showSubmitChecking =
    !!submissionStatusQuery.data &&
    !isCompleted(submissionStatusQuery.data.status);
  const showSubmitResult =
    !!submissionStatusQuery.data &&
    isCompleted(submissionStatusQuery.data.status);

  return (
    <div>
      <MDEditor.Markdown source={problem.description} className="mb-3" />

      {problem.codeSnippets?.length ? (
        <>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Code</span>
              <Form.Select
                value={language}
                onChange={handleLanguageChange}
                style={{ width: 150 }}
              >
                {problem.codeSnippets.map((snippet) => (
                  <option
                    key={snippet.languageSlug}
                    value={snippet.languageSlug}
                  >
                    {snippet.languageName}
                  </option>
                ))}
              </Form.Select>
            </Card.Header>

            <Card.Body className="p-0 code-editor-height">
              <CodeEditor
                code={code}
                language={language}
                onCodeChange={setCode}
                readonly={false}
              />
            </Card.Body>

            {!isAuthenticated && (
              <div className="border-top border-info bg-info-subtle p-3">
                <h6 className="mb-2 fw-bold">Login Required</h6>
                <p className="mb-0">
                  You need to be logged in to run or submit your code.
                </p>
              </div>
            )}

            <Card.Footer className="d-flex justify-content-end gap-2">
              <Button
                variant="primary"
                onClick={handleRun}
                disabled={
                  !isAuthenticated ||
                  runMutation.isPending ||
                  submitMutation.isPending ||
                  showRunChecking ||
                  showSubmitChecking
                }
              >
                Run
              </Button>
              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={
                  !isAuthenticated ||
                  runMutation.isPending ||
                  submitMutation.isPending ||
                  showRunChecking ||
                  showSubmitChecking
                }
              >
                Submit
              </Button>
            </Card.Footer>
          </Card>

          {showRunChecking && <StatusRow title="Running..." />}
          {showRunResult && (
            <StatusRow
              title={runStatusQuery.data?.status ?? "Unknown Result"}
              status={runStatusQuery.data?.status}
              stdout={runStatusQuery.data?.stdOut}
              stderr={runStatusQuery.data?.stdErr}
              failedTestcases={runStatusQuery.data?.failedTestcases}
            />
          )}

          {showSubmitChecking && <StatusRow title="Submitting..." />}
          {showSubmitResult && (
            <StatusRow
              title={submissionStatusQuery.data?.status}
              status={submissionStatusQuery.data?.status}
              stdout={submissionStatusQuery.data?.stdOut}
              stderr={submissionStatusQuery.data?.stdErr}
              failedTestcases={submissionStatusQuery.data?.failedTestcases}
            />
          )}

          <div className="mb-4">
            <h5>Run Testcases</h5>
            <ul className="list-group">
              {problem.testcases?.map((tc, i) => (
                <li key={i} className="list-group-item">
                  Input: {JSON.stringify(tc.input)} <br />
                  Expected Output: {JSON.stringify(tc.expected)}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <Alert variant="info" className="text-center">
          This problem doesn't have test cases or execution drivers configured
          yet.
        </Alert>
      )}
    </div>
  );
}

function StatusRow({
  title,
  status,
  stdout,
  stderr,
  failedTestcases,
}: {
  title: ResultStatus | string;
  status?: ResultStatus;
  stdout?: string;
  stderr?: string;
  failedTestcases?: FailedTestcase[];
}) {
  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h5>{title}</h5>
        </Col>
        <Col xs="auto">
          {status === "Accepted" && (
            <FaCheckCircle className="text-success" size="1.5em" />
          )}
          {status && [
            ResultStatus.Failed,
            ResultStatus.CompileError,
            ResultStatus.TimeLimitExceeded,
            ResultStatus.InternalServerError,
          ].includes(status as any) && (
            <FaTimesCircle className="text-danger" size="1.5em" />
          )}
          {!status && <Spinner animation="border" variant="warning" />}
        </Col>
      </Row>

      {(stdout || stderr) && (
        <Card className="my-3 p-2">
          {stdout && (
            <>
              <Card.Title>Output</Card.Title>
              <Card.Body className="bg-body-tertiary">
                <pre className="mb-1">{stdout}</pre>
              </Card.Body>
            </>
          )}
          {stderr && (
            <>
              <Card.Title className="text-danger">Error</Card.Title>
              <Card.Body className="bg-body-tertiary">
                <pre className="mb-1 text-danger">{stderr}</pre>
              </Card.Body>
            </>
          )}
        </Card>
      )}

      {failedTestcases && failedTestcases.length > 0 && (
        <div className="card my-3">
          <div className="card-body">
            <h5 className="card-title text-danger mb-3">
              Failed Test Cases ({failedTestcases.length})
            </h5>

            <Tabs
              defaultActiveKey={0}
              id="failed-testcases-tabs"
              className="mb-3"
              mountOnEnter={true}
              unmountOnExit={false}
            >
              {failedTestcases.map((testcase, index) => (
                <Tab
                  key={testcase.id}
                  eventKey={index}
                  title={`Case ${index + 1}`}
                  tabClassName={index === 0 ? "" : ""}
                >
                  <div className="mt-3">
                    {/* Test case details */}
                    <div className="mb-2">
                      <strong>Input:</strong>
                      <code className="d-block bg-body-tertiary p-2 mt-1 rounded">
                        {JSON.stringify(testcase.input)}
                      </code>
                    </div>

                    <div className="mb-2">
                      <strong>Expected:</strong>
                      <code className="d-block bg-body-tertiary p-2 mt-1 rounded">
                        {JSON.stringify(testcase.expected)}
                      </code>
                    </div>

                    <div className="mb-2">
                      <strong>Got:</strong>
                      <code className="d-block bg-body-tertiary p-2 mt-1 rounded">
                        {JSON.stringify(testcase.got)}
                      </code>
                    </div>

                    {testcase.stdOut && (
                      <ExpandableStdout stdOut={testcase.stdOut} />
                    )}
                  </div>
                </Tab>
              ))}
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
}

function ExpandableStdout({ stdOut }: { stdOut: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLines = 10;
  const lines = stdOut.split("\n");
  const needsTruncation = lines.length > maxLines;

  const displayLines = isExpanded
    ? lines
    : needsTruncation
      ? lines.slice(0, maxLines)
      : lines;

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-2">
          <strong>Output:</strong>
          {needsTruncation && !isExpanded && (
            <span className="badge bg-warning">Truncated</span>
          )}
        </div>
        {needsTruncation && (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="d-flex align-items-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={12} />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown size={12} />
                Expand
              </>
            )}
          </Button>
        )}
      </div>

      <div
        className="bg-body-tertiary p-3 rounded"
        style={{
          maxHeight: isExpanded ? "none" : "250px",
          overflowY: "auto",
        }}
      >
        <pre className="m-0" style={{ whiteSpace: "pre-wrap" }}>
          {displayLines.join("\n")}
        </pre>
      </div>

      {needsTruncation && (
        <div className="mt-2 text-center">
          <small className="text-muted">
            {isExpanded
              ? `Showing all ${lines.length} lines`
              : `Showing first ${maxLines} of ${lines.length} lines`}
          </small>
        </div>
      )}
    </div>
  );
}
