import MDEditor from '@uiw/react-md-editor';
import { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Spinner } from 'react-bootstrap';
import { CheckCircle } from 'react-bootstrap-icons';
import { useProblemNote } from '~/hooks/useProblemNote';
import type { Problem } from '~/types/problem/problem';

interface ProblemNotesProps {
  problem: Problem;
}

export default function ProblemNotes({ problem }: ProblemNotesProps) {
  const [value, setValue] = useState<string | undefined>("");
  const [showSaved, setShowSaved] = useState(false);

  const handleSaveSuccess = () => {
    setShowSaved(true);
    const timer = setTimeout(() => setShowSaved(false), 2000);
    return () => clearTimeout(timer);
  };

  const { problemNote, isLoading, isError, error, saveMutation } = useProblemNote(problem.slug, {
    onSaveSuccess: handleSaveSuccess,
  });
  useEffect(() => {
    if (problemNote) setValue(problemNote.markdown)
  }, [problemNote])

  const handleSave = () => {
    saveMutation.mutate({
      method: problemNote ? "PUT" : "POST",
      markdown: value,
    })
  };

  if (isLoading) {
    return (
      <>
        Loading...
      </>
    )
  }

  if (isError) {
    if (error && error.code !== "PROBLEM_NOTE_NOT_FOUND") {
      return (
        <>
          {error.message}
        </>
      )
    }
  }

  return (
    <div>
      <Card className="mb-3">
        <Card.Header as="h5">
          <Row className="align-items-center">
            <Col className="d-flex align-items-center gap-2">
              <h5 className="mb-0">Problem Notes</h5>
              {saveMutation.isPending && (
                <div className="d-flex align-items-center gap-1 text-muted">
                  <Spinner animation="border" size="sm" />
                  <span className="small fw-semibold">Saving...</span>
                </div>
              )}
              {showSaved && (
                <div className="d-flex align-items-center gap-1 text-muted">
                  <CheckCircle size={18} />
                  <span className="small fw-semibold">Saved</span>
                </div>
              )}
            </Col>
            <Col xs="auto">
              <Button 
                variant="primary" 
                onClick={handleSave} 
                size="sm"
                disabled={saveMutation.isPending}
              >
                {error?.code === "PROBLEM_NOTE_NOT_FOUND" ? "Create Note" : "Save"}
              </Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          <MDEditor
            value={value}
            onChange={setValue}
            height={300}
          />
        </Card.Body>
        <Card.Footer className="text-muted">
          {value?.length || 0} characters
        </Card.Footer>
      </Card>
    </div>
  );
}
