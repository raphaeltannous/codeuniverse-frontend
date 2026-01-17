import { Modal, Button, Spinner } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';

interface CourseDeleteModalProps {
  show: boolean;
  courseTitle: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CourseDeleteModal({
  show,
  courseTitle,
  isPending,
  onClose,
  onConfirm,
}: CourseDeleteModalProps) {
  return (
    <Modal
      show={show}
      onHide={() => !isPending && onClose()}
      centered
      backdrop={isPending ? 'static' : true}
    >
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="h5 fw-bold text-danger">
          Confirm Delete
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-4">
        <div className="text-center mb-3">
          <Trash size={48} className="text-danger mb-3" />
          <h5 className="fw-bold">Are you sure?</h5>
          <p className="text-muted">
            This will permanently delete the course "{courseTitle}".
            This action cannot be undone.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button
          variant="outline-secondary"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Deleting...
            </>
          ) : (
            'Delete Course'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
