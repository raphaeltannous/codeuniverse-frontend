import { useQuery } from '@tanstack/react-query';
import MDEditor from '@uiw/react-md-editor';
import { useEffect, useState } from 'react';
import { Card, Col, Row, Button } from 'react-bootstrap';
import type { APIError } from '~/types/api-error';
import type { Problem } from '~/types/problem';
import type { ProblemNote } from '~/types/problem/note';

interface ProblemNotesProps {
  problem: Problem;
}

export default function ProblemNotes({ problem }: ProblemNotesProps) {
  const problemSlug = problem.slug;
  const token = localStorage.getItem("token");

  const { data: problemNote, isLoading, isError, error } = useQuery<ProblemNote, APIError>({
    queryKey: [`problem-${problemSlug}-note-data`],
    queryFn: async () => {
      const res = await fetch(`/api/problems/${problemSlug}/notes`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        throw data as APIError;
      }
      return data as ProblemNote;
    }
  })

  const [value, setValue] = useState<string | undefined>("");
  useEffect(() => {
    if (problemNote) setValue(problemNote.markdown)
  }, [problemNote])


  if (isLoading) {
    return (
      <>
        Loading...
      </>
    )
  }

  if (isError) {
  }

  return (
    <div>
      <Card className="shadow-sm mb-3">
        <Card.Header as="h5">
          <Row className="align-items-center">
            <Col><h5 className="mb-0 ">Problem Notes</h5></Col>
            <Col xs="auto">
              <Button variant="primary" size="sm">
                Save
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
