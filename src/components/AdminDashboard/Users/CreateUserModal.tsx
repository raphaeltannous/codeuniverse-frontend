import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { PersonAdd } from "react-bootstrap-icons";
import type { User } from "~/types/admin/user";

interface CreateFormData {
  username: string;
  email: string;
  password: string;
  role: User["role"];
  isActive: boolean;
  isVerified: boolean;
}

interface CreateUserModalProps {
  show: boolean;
  formData: CreateFormData;
  isCreating: boolean;
  onHide: () => void;
  onSubmit: () => void;
  onFormChange: (field: keyof CreateFormData, value: any) => void;
}

export default function CreateUserModal({
  show,
  formData,
  isCreating,
  onHide,
  onSubmit,
  onFormChange,
}: CreateUserModalProps) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop={isCreating ? "static" : true}
    >
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="h5 fw-bold">Create New User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Username *</Form.Label>
            <Form.Control
              type="text"
              value={formData.username}
              onChange={(e) => onFormChange("username", e.target.value)}
              placeholder="Enter username"
              required
              disabled={isCreating}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email *</Form.Label>
            <Form.Control
              type="email"
              value={formData.email}
              onChange={(e) => onFormChange("email", e.target.value)}
              placeholder="Enter email"
              required
              disabled={isCreating}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password *</Form.Label>
            <Form.Control
              type="password"
              value={formData.password}
              onChange={(e) => onFormChange("password", e.target.value)}
              placeholder="Enter password"
              required
              disabled={isCreating}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={formData.role}
                  onChange={(e) => onFormChange("role", e.target.value)}
                  disabled={isCreating}
                >
                  <option value="user">User</option>
                  <option value="admin">Administrator</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={formData.isActive.toString()}
                  onChange={(e) =>
                    onFormChange("isActive", e.target.value === "true")
                  }
                  disabled={isCreating}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Email Verification</Form.Label>
            <Form.Select
              value={formData.isVerified.toString()}
              onChange={(e) =>
                onFormChange("isVerified", e.target.value === "true")
              }
              disabled={isCreating}
            >
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button
          variant="outline-secondary"
          onClick={onHide}
          disabled={isCreating}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Creating...
            </>
          ) : (
            <>
              <PersonAdd size={16} className="me-2" />
              Create User
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
