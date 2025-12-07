import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import CodeEditor from "~/components/shared/code-editor";
import DifficultyBadge from "~/components/shared/difficulty-badge";
import type { APIError } from "~/types/api-error";
import type { Problem } from "~/types/problem";
import type { RunRequest, RunResponse } from "~/types/problem/run";
import type { SubmitRequest, SubmitResponse } from "~/types/problem/submission";

interface ProblemEditorProps {
  problem: Problem;
}

export default function ProblemEditor({problem}: ProblemEditorProps) {
  const problemSlug = problem.slug;
  const token = localStorage.getItem("token");

  if (!problemSlug) {
    return <div>Problem not found</div>;
  }

  const runMutation = useMutation<RunResponse, APIError, RunRequest>({
    mutationFn: async (body: RunRequest) => {
      const res = await fetch(`/api/problems/${problem.slug}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      };

      return (await res.json()) as RunResponse;
    },
  });

  const submitMutation = useMutation<SubmitResponse, APIError, SubmitRequest>({
    mutationFn: async (body: RunRequest) => {
      const res = await fetch(`/api/problems/${problem.slug}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      };

      return (await res.json()) as SubmitResponse;
    },
  });

  const [language, setLanguage] = useState("golang");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (problem?.codeSnippets?.length) {
      const initialLang = problem.codeSnippets[0].languageSlug;
      setLanguage(initialLang);
      setCode(problem.codeSnippets[0].code);
    }
  }, [problem]);

  const [output, setOutput] = useState<string | null>(null);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    const snippet = problem?.codeSnippets.find(c => c.languageSlug === newLang);
    setCode(snippet?.code || "");
  };

  const handleRun = () => {
    setOutput(`Running code in ${language}:\n\n${code}`);

    runMutation.mutate({
      problemSlug,
      languageSlug: language,
      code,
    })
  };

  const handleSubmit = () => {
    setOutput(`Submitting code in ${language}:\n\n${code}`);

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
      <div className="mb-2">
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>

      <div dangerouslySetInnerHTML={{ __html: problem.description }}>
      </div>

      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Code</span>
          <Form.Select
            value={language}
            onChange={handleLanguageChange}
            style={{ width: "150px" }}
          >
            {problem.codeSnippets.map((snippet) => (
              <option key={snippet.languageSlug} value={snippet.languageSlug}>
                {snippet.languageName}
              </option>
            ))}
          </Form.Select>
        </Card.Header>

        <Card.Body className="p-0 code-editor-height">
          <CodeEditor code={code} language={language} onCodeChange={setCode} />
        </Card.Body>

        <Card.Footer className="d-flex justify-content-end gap-2">
          <Button variant="primary" onClick={handleRun}>
            Run
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            Submit
          </Button>
        </Card.Footer>
      </Card>

      <div className="mb-4">
        <h5>Testcases</h5>
        <ul className="list-group">
          {problem.testcases?.map((tc, i) => (
            <li key={i} className="list-group-item">
              {tc}
            </li>
          ))}
        </ul>
      </div>

      {output && (
        <div className="mb-4">
          <h5>Result</h5>
          <pre className="bg-dark text-white p-3">{output}</pre>
        </div>
      )}
    </div>
  )
}
