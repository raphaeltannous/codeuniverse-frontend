import { Modal, Button, Spinner } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';

interface DeleteLessonModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteLessonModal({
  show,
  onHide,
  onConfirm,
  isDeleting,
}: DeleteLessonModalProps) {
  return (
    <Modal
      show={show}
      onHide={() => !isDeleting && onHide()}
      centered
      backdrop={isDeleting ? 'static' : true}
    >
      <Modal.Header closeButton={!isDeleting} className="border-0">
        <Modal.Title className="h5 fw-bold text-danger">
          Confirm Delete
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-4">
        <div className="text-center mb-3">
          <Trash size={48} className="text-danger mb-3" />
          <h5 className="fw-bold">Are you sure?</h5>
          <p className="text-muted">
            This will permanently delete the lesson. This action cannot be undone.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button
          variant="outline-secondary"
          onClick={onHide}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Deleting...
            </>
          ) : (
            'Delete Lesson'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
