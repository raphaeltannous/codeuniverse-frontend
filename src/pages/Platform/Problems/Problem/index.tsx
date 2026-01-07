import { Activity, useState } from "react";
import { Col, Container, Row, Tab, Tabs } from "react-bootstrap";
import { useParams } from "react-router";
import type { APIError } from "~/types/api-error";
import type { Problem } from "~/types/problem";
import ProblemEditor from "./editor";
import { useQuery } from "@tanstack/react-query";
import ProblemSubmissions from "./submissions";
import ProblemNotes from "./notes";
import DifficultyBadge from "~/components/shared/difficulty-badge";

export default function PlatformProblemsProblem() {
  const { problemSlug } = useParams();
  const [activeTab, setActiveTab] = useState('editor');

  if (!problemSlug) {
    return <div>Problem not found</div>;
  }

  const { data: problem, isLoading, isError, error } = useQuery<Problem, APIError>({
    queryKey: [`problem-${problemSlug}-data`],
    queryFn: async () => {
      const res = await fetch(`/api/problems/${problemSlug}`);
      const data = await res.json();

      if (!res.ok) {
        throw data as APIError;
      }
      return data as Problem;
    }
  })

  if (isLoading) {
    return (
      <>
        Loading...
      </>
    )
  }

  if (isError) {
    return (
      <>
        {error.message}
      </>
    )
  }

  if (!problem) {
    return (
      <>
        No problem?
      </>
    )
  }

  return (
    <Container className="problem-page-width mt-4">
      <Row className="align-items-center">
        <Col>
          <h2>{problem.title}</h2>
        </Col>
        <Col xs="auto">
          <div className="mb-2">
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
        </Col>
      </Row>


      <Tabs
        defaultActiveKey={activeTab}
        id="problem-tab"
        onSelect={(k) => setActiveTab(k ?? "editor")}
        className="mb-3"
      >
        <Tab eventKey="editor" title="Editor">
          <Activity mode={activeTab === "editor" ? "visible" : "hidden"}>
            <ProblemEditor problem={problem} />
          </Activity>
        </Tab>
        {problem.codeSnippets?.length !== 0 && (
          <Tab eventKey="submissions" title="Submissions">
            <Activity mode={activeTab === "submissions" ? "visible" : "hidden"}>
              <ProblemSubmissions problem={problem} />
            </Activity>
          </Tab>
        )}
        <Tab eventKey="notes" title="Notes">
          <Activity mode={activeTab === "notes" ? "visible" : "hidden"}>
            <ProblemNotes problem={problem} />
          </Activity>
        </Tab>
      </Tabs>
    </Container>
  )
}
