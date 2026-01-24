import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { Save, ExclamationTriangle } from "react-bootstrap-icons";
import type { User } from "~/types/admin/user";

interface EditFormData {
  username?: string;
  email?: string;
  role?: User["role"];
  isActive?: boolean;
  isVerified?: boolean;
  avatarUrl?: string | null;
}

interface EditFormErrors {
  username?: string;
  email?: string;
  avatarUrl?: string;
}

interface EditUserModalProps {
  show: boolean;
  user: User | null;
  formData: EditFormData;
  formErrors: EditFormErrors;
  isUpdating: boolean;
  onHide: () => void;
  onSubmit: () => void;
  onFormChange: (field: keyof EditFormData, value: any) => void;
  onClearErrors: () => void;
}

export default function EditUserModal({
  show,
  user,
  formData,
  formErrors,
  isUpdating,
  onHide,
  onSubmit,
  onFormChange,
  onClearErrors,
}: EditUserModalProps) {
  const handleHide = () => {
    onHide();
    onClearErrors();
  };

  if (!user) return null;

  return (
    <Modal
      show={show}
      onHide={handleHide}
      centered
      backdrop={isUpdating ? "static" : true}
    >
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="h5 fw-bold">Edit User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Username</Form.Label>
            <Form.Control
              type="text"
              value={formData.username || ""}
              onChange={(e) => onFormChange("username", e.target.value)}
              placeholder="Enter username"
              isInvalid={!!formErrors.username}
              disabled={isUpdating}
            />
            {formErrors.username && (
              <Form.Control.Feedback
                type="invalid"
                className="d-flex align-items-center gap-1"
              >
                <ExclamationTriangle size={14} />
                {formErrors.username}
              </Form.Control.Feedback>
            )}
            <Form.Text className="text-muted">
              Current username: <strong>{user.username}</strong>
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Email</Form.Label>
            <Form.Control
              type="email"
              value={formData.email || ""}
              onChange={(e) => onFormChange("email", e.target.value)}
              placeholder="Enter email"
              isInvalid={!!formErrors.email}
              disabled={isUpdating}
            />
            {formErrors.email && (
              <Form.Control.Feedback
                type="invalid"
                className="d-flex align-items-center gap-1"
              >
                <ExclamationTriangle size={14} />
                {formErrors.email}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Role</Form.Label>
                <Form.Select
                  value={formData.role || "user"}
                  onChange={(e) => onFormChange("role", e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="user">User</option>
                  <option value="admin">Administrator</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Status</Form.Label>
                <Form.Select
                  value={formData.isActive?.toString() || "true"}
                  onChange={(e) =>
                    onFormChange("isActive", e.target.value === "true")
                  }
                  disabled={isUpdating}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Email Verification
            </Form.Label>
            <Form.Select
              value={formData.isVerified?.toString() || "false"}
              onChange={(e) =>
                onFormChange("isVerified", e.target.value === "true")
              }
              disabled={isUpdating}
            >
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Avatar URL</Form.Label>
            <Form.Control
              type="text"
              value={formData.avatarUrl || ""}
              onChange={(e) => onFormChange("avatarUrl", e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              isInvalid={!!formErrors.avatarUrl}
              disabled={isUpdating}
            />
            {formErrors.avatarUrl && (
              <Form.Control.Feedback
                type="invalid"
                className="d-flex align-items-center gap-1"
              >
                <ExclamationTriangle size={14} />
                {formErrors.avatarUrl}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button
          variant="outline-secondary"
          onClick={handleHide}
          disabled={isUpdating}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={isUpdating || Object.keys(formErrors).length > 0}
        >
          {isUpdating ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} className="me-2" />
              Save Changes
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
