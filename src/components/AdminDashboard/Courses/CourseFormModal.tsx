import { Modal, Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import type { CourseFormData } from '~/types/course/course';

interface CourseFormModalProps {
  show: boolean;
  isEditing: boolean;
  formData: CourseFormData;
  isLoading: boolean;
  error?: string;
  onClose: () => void;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSlugGenerate: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CourseFormModal({
  show,
  isEditing,
  formData,
  isLoading,
  error,
  onClose,
  onFormChange,
  onSlugGenerate,
  onSubmit,
}: CourseFormModalProps) {
  return (
    <Modal
      show={show}
      onHide={onClose}
      size="lg"
      centered
      backdrop={isLoading ? 'static' : true}
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="h4 fw-bold">
          {isEditing ? 'Edit Course' : 'Create New Course'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body className="py-3">
          {error && (
            <div className="alert alert-danger mb-3">
              <small>{error}</small>
            </div>
          )}

          <Row>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Course Title <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={onFormChange}
                  required
                  placeholder="e.g., Data Structures Fundamentals"
                  className="py-2"
                  disabled={isLoading}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={9}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Slug <span className="text-danger">*</span>
                </Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={onFormChange}
                    required
                    placeholder="data-structures"
                    className="py-2"
                    disabled={isLoading}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={onSlugGenerate}
                    type="button"
                    className="d-flex align-items-center"
                    disabled={isLoading}
                  >
                    Generate
                  </Button>
                </div>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Difficulty Level</Form.Label>
                <Form.Select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={onFormChange}
                  className="py-2"
                  disabled={isLoading}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mt-3">
            <Form.Label className="fw-semibold">
              Description <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={onFormChange}
              rows={4}
              required
              placeholder="Describe what students will learn in this course..."
              className="py-2"
              disabled={isLoading}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="outline-secondary"
            onClick={onClose}
            className="px-4"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="px-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Update Course' : 'Create Course'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
