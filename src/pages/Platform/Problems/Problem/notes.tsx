import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import MDEditor from '@uiw/react-md-editor';
import { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Spinner } from 'react-bootstrap';
import { CheckCircle } from 'react-bootstrap-icons';
import { useAuth } from '~/context/AuthContext';
import type { APIError } from '~/types/api-error';
import type { Problem } from '~/types/problem';
import type { ProblemNote, ProblemNoteSaveRequest, ProblemNoteSaveResponse } from '~/types/problem/note';

interface ProblemNotesProps {
  problem: Problem;
}

export default function ProblemNotes({ problem }: ProblemNotesProps) {
  const { auth } = useAuth();

  const problemSlug = problem.slug;
  const queryClient = useQueryClient();
  const problemNoteKey = ["problem-note", problemSlug];

  const { data: problemNote, isLoading, isError, error } = useQuery<ProblemNote, APIError>({
    queryKey: problemNoteKey,
    queryFn: async () => {
      const res = await fetch(`/api/problems/${problemSlug}/notes`, {
        headers: { "Authorization": `Bearer ${auth.jwt}` },
      });
      const data = await res.json();

      if (!res.ok) {
        throw data as APIError;
      }
      return data as ProblemNote;
    },
    retry: (failureCount, error) => {
      if (error.code === "PROBLEM_NOTE_NOT_FOUND") return false;
      return failureCount < 2;
    }
  })

  const saveMutation = useMutation<ProblemNoteSaveResponse, APIError, ProblemNoteSaveRequest>({
    mutationFn: async (body: ProblemNoteSaveRequest) => {
      const { method, ...requestBody } = body;
      const res = await fetch(`/api/problems/${problem.slug}/notes`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.jwt}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const err = (await res.json()) as APIError;
        throw err;
      };

      return (await res.json()) as ProblemNoteSaveResponse;
    },

    onSuccess: (_, variables) => {
      queryClient.setQueryData(
        problemNoteKey,
        {
          ...variables,
        }
      );
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    },
  });

  const [value, setValue] = useState<string | undefined>("");
  const [showSaved, setShowSaved] = useState(false);
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
    if (error.code !== "PROBLEM_NOTE_NOT_FOUND") {
      return (
        <>
          {error.message}
        </>
      )
    }
  }

  return (
    <div>
      <Card className="shadow-sm mb-3">
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
