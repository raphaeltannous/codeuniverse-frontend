import { Activity, useState } from "react";
import { Col, Container, Row, Tab, Tabs } from "react-bootstrap";
import { useParams } from "react-router";
import ProblemEditor from "./editor";
import ProblemSubmissions from "./submissions";
import ProblemNotes from "./notes";
import DifficultyBadge from "~/components/Shared/DifficultyBadge";
import ProblemSkeleton from "~/components/Platform/Problem/ProblemSkeleton";
import { useProblem } from "~/hooks/useProblem";
import PremiumOnly from "~/components/Shared/PremiumOnly";
import { useUser } from "~/context/UserContext";

export default function PlatformProblemsProblem() {
  const { problemSlug } = useParams();
  const { problem, isLoading, isError, error } = useProblem(problemSlug || '');

  // Show premium banner if API returns 403 Forbidden
  const isForbidden = isError && (error as any)?.status === 403;

  if (isLoading) {
    return (
      <Container className="problem-page-width mt-4">
        <ProblemSkeleton />
      </Container>
    );
  }

  if (isForbidden) {
    return (
      <PremiumOnly message="Unlock premium coding problems! Upgrade to access advanced challenges, detailed solutions, and practice materials.">
        <div />
      </PremiumOnly>
    );
  }

  return <ProblemContent />;
}

function ProblemContent() {
  const { problemSlug } = useParams();
  const [activeTab, setActiveTab] = useState('editor');
  const { problem, isLoading, isError, error } = useProblem(problemSlug || '');

  if (!problemSlug) {
    return <div>Problem not found</div>;
  }

  if (isLoading) {
    return (
      <Container className="problem-page-width mt-4">
        <ProblemSkeleton />
      </Container>
    )
  }

  if (isError) {
    return (
      <Container className="problem-page-width mt-4">
        <div className="alert alert-danger">
          {error?.message || "Error loading problem"}
        </div>
      </Container>
    )
  }

  if (!problem) {
    return (
      <Container className="problem-page-width mt-4">
        <div className="alert alert-warning">
          Problem not found
        </div>
      </Container>
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
