import {
  Row,
  Col,
  Card,
  Button,
  Alert,
} from "react-bootstrap";
import {
  Plus,
  Trash,
  Pencil,
} from "react-bootstrap-icons";
import MDEditor from "@uiw/react-md-editor";

interface Hint {
  id: string;
  hint: string;
  createdAt: string;
}

interface HintsTabProps {
  hints: Hint[];
  handleAddHint: () => void;
  handleEditHint: (hint: Hint) => void;
  handleDeleteHint: (hintId: string) => void;
  createHintMutationPending: boolean;
  updateHintMutationPending: boolean;
  deleteHintMutationPending: boolean;
}

export default function HintsTab({
  hints,
  handleAddHint,
  handleEditHint,
  handleDeleteHint,
  createHintMutationPending,
  updateHintMutationPending,
  deleteHintMutationPending,
}: HintsTabProps) {
  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="fw-semibold mb-0">Problem Hints</h6>
          <p className="text-muted small mb-0">
            Add helpful hints for users (Markdown supported)
          </p>
        </div>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={handleAddHint}
          type="button"
          disabled={createHintMutationPending}
        >
          <Plus size={14} /> Add Hint
        </Button>
      </div>

      {hints.length === 0 ? (
        <Alert variant="info">
          No hints added. Hints are optional but can help users solve the
          problem.
        </Alert>
      ) : (
        <Row>
          {hints?.map((hint) => (
            <Col md={6} key={hint.id} className="mb-3">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="fw-semibold">
                      Hint #{hints.indexOf(hint) + 1}
                    </div>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleEditHint(hint)}
                        disabled={updateHintMutationPending}
                      >
                        <Pencil size={12} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteHint(hint.id)}
                        disabled={deleteHintMutationPending}
                      >
                        <Trash size={12} />
                      </Button>
                    </div>
                  </div>
                  <div className="mb-2">
                    <MDEditor.Markdown source={hint.hint} />
                  </div>
                  <small className="text-muted">
                    Created: {new Date(hint.createdAt).toLocaleDateString()}
                  </small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
