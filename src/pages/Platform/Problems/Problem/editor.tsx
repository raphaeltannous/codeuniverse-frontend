import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button, Card, Col, Form, Row, Spinner, Alert } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import CodeEditor from "~/components/shared/code-editor";
import { useAuth } from "~/context/AuthContext";
import { useRunProblem } from "~/hooks/useRunProblem";
import { useSubmitProblem } from "~/hooks/useSubmitProblem";
import type { Problem } from "~/types/problem";
import { ResultStatus } from "~/types/problem/status";
import type { FailedTestcase } from "~/types/problem/testcase";

interface ProblemEditorProps {
  problem: Problem;
}

export default function ProblemEditor({ problem }: ProblemEditorProps) {
  const problemSlug = problem.slug;
  const [language, setLanguage] = useState(
    problem.codeSnippets?.[0]?.languageSlug || "go",
  );
  const [code, setCode] = useState(problem.codeSnippets?.[0]?.code || "");

  const { runMutation, runStatusQuery, runId, isCompleted } = useRunProblem(
    problemSlug,
    language,
  );
  const { submitMutation, submissionStatusQuery } =
    useSubmitProblem(problemSlug);

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

  const showRunChecking = !!runId && !isCompleted(runStatusQuery.data?.status);
  const showRunResult = !!runId && isCompleted(runStatusQuery.data?.status);
  const showSubmitChecking =
    !!submissionStatusQuery.data &&
    !["Accepted", "Failed", "Error", "Time Limit Exceeded"].includes(
      submissionStatusQuery.data.status,
    );
  const showSubmitResult =
    !!submissionStatusQuery.data &&
    ["Accepted", "Failed", "Error", "Time Limit Exceeded"].includes(
      submissionStatusQuery.data.status,
    );

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

            <Card.Footer className="d-flex justify-content-end gap-2">
              <Button
                variant="primary"
                onClick={handleRun}
                disabled={
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
              title={runStatusQuery.data?.status}
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
  title: string;
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
          {[
            ResultStatus.Failed,
            ResultStatus.CompileError,
            ResultStatus.TimeLimitExceeded,
            ResultStatus.InternalServerError,
          ].includes(status) && (
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
            <h5 className="card-title text-danger mb-3">Failed Test Case</h5>

            <div className="mb-2">
              <strong>Input:</strong>
              <code className="d-block bg-body-tertiary p-2 mt-1 rounded">
                {JSON.stringify(failedTestcases[0].input)}
              </code>
            </div>

            <div className="mb-2">
              <strong className="">Expected:</strong>
              <code className="d-block bg-body-tertiary p-2 mt-1 rounded">
                {JSON.stringify(failedTestcases[0].expected)}
              </code>
            </div>

            <div className="mb-0">
              <strong className="">Got:</strong>
              <code className="d-block p-2 bg-body-tertiary mt-1 rounded">
                {JSON.stringify(failedTestcases[0].got)}
              </code>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
