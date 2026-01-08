import { useMutation, useQuery } from "@tanstack/react-query";
import MDEditor from "@uiw/react-md-editor";
import { Activity, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import CodeEditor from "~/components/shared/code-editor";
import { useAuth } from "~/context/AuthContext";
import type { APIError } from "~/types/api-error";
import type { Problem } from "~/types/problem";
import type { RunRequest, RunResponse } from "~/types/problem/run";
import type { Submission, SubmitRequest, SubmitResponse } from "~/types/problem/submission";

interface ProblemEditorProps {
  problem: Problem;
}

export default function ProblemEditor({ problem }: ProblemEditorProps) {
  const { auth } = useAuth();

  const problemSlug = problem.slug;

  if (!problemSlug) {
    return <div>Problem not found</div>;
  }

  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState<boolean>(problem.codeSnippets?.length != 0);

  const [language, setLanguage] = useState(() => {
    return problem.codeSnippets?.[0]?.languageSlug || "go";
  });

  const runMutation = useMutation<RunResponse, APIError, RunRequest>({
    mutationFn: async (body: RunRequest) => {
      const res = await fetch(`/api/problems/${problem.slug}/run/${language}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.jwt}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      };

      return (await res.json()) as RunResponse;
    },
    onSuccess: (data) => {
      setRunId(data.runId);
      setSubmissionId(null);
    },
  });

  const runStatusQuery = useQuery<Submission, APIError>({
    queryKey: ["run-status", runId],
    queryFn: async () => {
      const res = await fetch(`/api/problems/${problemSlug}/run/${runId}/check`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.jwt}`,
        },
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    enabled: !!runId,
    refetchInterval: (query) => {
      if (!query.state.data) return 1000;

      const status = query.state.data.status;
      const completedStatus = ['ACCEPTED', 'FAILED', 'ERROR', 'TIME LIMIT EXCEEDED'];

      return completedStatus.includes(status) ? false : 1000;
    },
    refetchIntervalInBackground: false,
  });

  const showRunChecking = !!runId &&
    (!runStatusQuery.data ||
      !['ACCEPTED', 'FAILED', 'ERROR', 'TIME LIMIT EXCEEDED'].includes(runStatusQuery.data.status));

  const showRunResult = !!runId &&
    (runStatusQuery.data &&
      ['ACCEPTED', 'FAILED', 'ERROR', 'TIME LIMIT EXCEEDED'].includes(runStatusQuery.data.status));

  const submitMutation = useMutation<SubmitResponse, APIError, SubmitRequest>({
    mutationFn: async (body: SubmitRequest) => {
      const res = await fetch(`/api/problems/${problem.slug}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.jwt}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      };

      return (await res.json()) as SubmitResponse;
    },
    onSuccess: (data) => {
      setSubmissionId(data.submissionId);
      setRunId(null);
    },
  });

  const submissionStatusQuery = useQuery<Submission, APIError>({
    queryKey: ["submission-status", submissionId],
    queryFn: async () => {
      const res = await fetch(`/api/problems/${problemSlug}/submit/${submissionId}/check`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.jwt}`,
        },
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    enabled: !!submissionId,
    refetchInterval: (query) => {
      if (!query.state.data) return 1000;

      const status = query.state.data.status;
      const completedStatus = ['ACCEPTED', 'FAILED', 'ERROR', 'TIME LIMIT EXCEEDED'];

      return completedStatus.includes(status) ? false : 1000;
    },
    refetchIntervalInBackground: false,
  });

  const showSubmitChecking = !!submissionId &&
    (!submissionStatusQuery.data ||
      !['ACCEPTED', 'FAILED', 'ERROR', 'TIME LIMIT EXCEEDED'].includes(submissionStatusQuery.data.status));

  const showSubmitResult = !!submissionId &&
    (submissionStatusQuery.data &&
      ['ACCEPTED', 'FAILED', 'ERROR', 'TIME LIMIT EXCEEDED'].includes(submissionStatusQuery.data.status));

  const [code, setCode] = useState(() => {
    return problem.codeSnippets?.[0]?.code || "";
  });

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    const snippet = problem?.codeSnippets.find(c => c.languageSlug === newLang);
    setCode(snippet?.code || "");
  };

  const handleRun = () => {
    runMutation.mutate({
      code,
    })
  };

  const handleSubmit = () => {
    submitMutation.mutate({
      problemSlug,
      languageSlug: language,
      code,
    })
  };

  if (!problem) {
    return (
      <>
        No problem?
      </>
    )
  }

  return (
    <div>
      <div className="mb-3">
        <MDEditor.Markdown source={problem.description} />
      </div>

      <Activity mode={showEditor ? "visible" : "hidden"}>
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>Code</span>
            <Form.Select
              value={language}
              onChange={handleLanguageChange}
              style={{ width: "150px" }}
            >
              {problem.codeSnippets?.map((snippet) => (
                <option key={snippet.languageSlug} value={snippet.languageSlug}>
                  {snippet.languageName}
                </option>
              ))}
            </Form.Select>
          </Card.Header>

          <Card.Body className="p-0 code-editor-height">
            <CodeEditor code={code} language={language} onCodeChange={setCode} readonly={false} />
          </Card.Body>

          <Card.Footer className="d-flex justify-content-end gap-2">
            <Button variant="primary" onClick={handleRun} disabled={submitMutation.isPending || runMutation.isPending || showSubmitChecking || showRunChecking}>
              Run
            </Button>
            <Button variant="success" onClick={handleSubmit} disabled={submitMutation.isPending || runMutation.isPending || showSubmitChecking || showRunChecking}>
              Submit
            </Button>
          </Card.Footer>
        </Card>

        <Activity mode={showRunChecking ? "visible" : "hidden"}>
          <Row className="align-items-center mb-3">
            <Col>
              <h5>
                Running...
              </h5>
            </Col>
            <Col xs="auto">
              <Spinner animation="border" variant="warning" />
            </Col>
          </Row>
        </Activity>

        <Activity mode={showRunResult ? "visible" : "hidden"}>
          <Row className="align-items-center mb-3">
            <Col>
              <h5>
                {runStatusQuery.data?.status}
              </h5>
            </Col>
            <Col xs="auto">
              {runStatusQuery.data?.status === 'ACCEPTED' && (
                <FaCheckCircle className="text-success" size="1.5em" />
              )}

              {(runStatusQuery.data?.status === 'FAILED' || runStatusQuery.data?.status === 'ERROR' || runStatusQuery.data?.status == "TIME LIMIT EXCEEDED") && (
                <FaTimesCircle className="text-danger" size="1.5em" />
              )}
            </Col>
          </Row>
        </Activity>

        <Activity mode={showSubmitChecking ? "visible" : "hidden"}>
          <Row className="align-items-center mb-3">
            <Col>
              <h5>
                Submitting...
              </h5>
            </Col>
            <Col xs="auto">
              <Spinner animation="border" variant="warning" />
            </Col>
          </Row>
        </Activity>

        <Activity mode={showSubmitResult ? "visible" : "hidden"}>
          <Row className="align-items-center mb-3">
            <Col>
              <h5>
                {submissionStatusQuery.data?.status}
              </h5>
            </Col>
            <Col xs="auto">
              {submissionStatusQuery.data?.status === 'ACCEPTED' && (
                <FaCheckCircle className="text-success" size="1.5em" />
              )}

              {(submissionStatusQuery.data?.status === 'FAILED' || submissionStatusQuery.data?.status === 'ERROR' || submissionStatusQuery.data?.status == "TIME LIMIT EXCEEDED") && (
                <FaTimesCircle className="text-danger" size="1.5em" />
              )}
            </Col>
          </Row>
        </Activity>

        <div className="mb-4">
          <h5>Run Testcases</h5>
          <ul className="list-group">
            {problem.testcases?.map((tc, i) => (
              <li key={i} className="list-group-item">
                Input: {JSON.stringify(tc.input)}
                <br />
                Expected Output: {JSON.stringify(tc.expected)}
              </li>
            ))}
          </ul>
        </div>
      </Activity>
      <Activity mode={showEditor ? "hidden" : "visible"}>
        <Alert className="text-center" key="info" variant="info">
          <p className="p-0 m-0">
            This problem doesn't have test cases or execution drivers configured yet.
          </p>
        </Alert>
      </Activity>
    </div>
  )
}
