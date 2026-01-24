import { Modal, Button, Spinner } from "react-bootstrap";
import { Trash } from "react-bootstrap-icons";
import type { User } from "~/types/admin/user";

interface DeleteUserModalProps {
  show: boolean;
  user: User | null;
  isDeleting: boolean;
  onHide: () => void;
  onConfirm: () => void;
}

export default function DeleteUserModal({
  show,
  user,
  isDeleting,
  onHide,
  onConfirm,
}: DeleteUserModalProps) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop={isDeleting ? "static" : true}
    >
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="h5 fw-bold text-danger">
          Confirm Delete
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-4">
        <div className="text-center mb-3">
          <Trash size={48} className="text-danger mb-3" />
          <h5 className="fw-bold">Delete User?</h5>
          <p className="text-muted">
            This will permanently delete the user "{user?.username}".
            This action cannot be undone.
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
            "Delete User"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
