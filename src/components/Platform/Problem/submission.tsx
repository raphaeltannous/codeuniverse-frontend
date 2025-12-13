import { Badge, Card, Col, Row } from "react-bootstrap";
import CodeEditor from "~/components/shared/code-editor";
import type { Submission } from "~/types/problem/submission"

interface SubmissionProps {
  submission: Submission;
}

export default function SubmissionCard({ submission }: SubmissionProps) {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header>
        <Row className="align-items-center mb-2">
          <Col><h5 className="mb-0">Submission</h5></Col>
          <Col xs="auto">
            <Badge
              bg={
                submission.status === "ACCEPTED"
                  ? "success"
                  : submission.status === "PENDING"
                    ? "warning"
                    : "danger"
              }
            >
              {submission.status}
            </Badge>

          </Col>
        </Row>

        <Row className="mb-2 text-center">
          <Col className="text-start">Memory Usage: {submission.memoryUsage} KB</Col>
          <Col>Execution Time: {submission.executionTime} ms</Col>
          <Col className="text-end">Language: {capitalize(submission.language)}</Col>
        </Row>
      </Card.Header>

      <Card.Body className="p-0 submission-editor-height">
        <CodeEditor code={submission.code} language={submission.language} readonly={true} onCodeChange={() => { }} />
      </Card.Body>

      <Card.Footer className="text-end text-muted">
        Submission date: {new Date(submission.createdAt).toLocaleString()}
      </Card.Footer>
    </Card>
  )
}

function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
