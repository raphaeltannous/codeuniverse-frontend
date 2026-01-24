import { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import MDEditor from "@uiw/react-md-editor";

export interface Hint {
  id: string;
  problemId: string;
  hint: string;
  createdAt: string;
  updatedAt: string;
}

interface EditHintModalProps {
  show: boolean;
  onHide: () => void;
  editingHint: Hint | null;
  onSubmit: (hint: string) => void;
  isSubmitting: boolean;
}

export default function EditHintModal({
  show,
  onHide,
  editingHint,
  onSubmit,
  isSubmitting,
}: EditHintModalProps) {
  const [hintText, setHintText] = useState("");
  const [error, setError] = useState("");

  // Initialize form when modal opens or editingHint changes
  useEffect(() => {
    if (show) {
      setHintText(editingHint?.hint || "");
      setError("");
    }
  }, [show, editingHint]);

  const handleSubmit = () => {
    setError("");

    if (!hintText.trim()) {
      setError("Hint text is required");
      return;
    }

    onSubmit(hintText);
  };

  const handleClose = () => {
    setHintText("");
    setError("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{editingHint ? "Edit Hint" : "Add Hint"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            {error}
          </div>
        )}
        <Form.Group>
          <Form.Label>Hint Text (Markdown supported)</Form.Label>
          <div>
            <MDEditor
              value={hintText}
              onChange={(value) => setHintText(value || "")}
              height={300}
              preview="edit"
              visibleDragbar={false}
            />
          </div>
          <small className="text-muted">
            You can use Markdown for formatting, code blocks, lists, etc.
          </small>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Spinner animation="border" size="sm" />
          ) : editingHint ? (
            "Update Hint"
          ) : (
            "Add Hint"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
