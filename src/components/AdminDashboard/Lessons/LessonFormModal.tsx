import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import type { Lesson, LessonFormData } from '~/types/course/lesson';

interface LessonFormModalProps {
  show: boolean;
  onHide: () => void;
  editingLesson: Lesson | null;
  formData: LessonFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export default function LessonFormModal({
  show,
  onHide,
  editingLesson,
  formData,
  onInputChange,
  onSubmit,
  isLoading,
}: LessonFormModalProps) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop={isLoading ? 'static' : true}
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="h4 fw-bold">
          {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body className="py-3">
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Lesson Title <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={onInputChange}
                  required
                  placeholder="e.g., Introduction to Arrays"
                  disabled={isLoading}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Lesson Number <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="lessonNumber"
                  value={formData.lessonNumber}
                  onChange={onInputChange}
                  required
                  min="1"
                  disabled={isLoading}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Description <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              rows={3}
              required
              placeholder="Brief description of the lesson content..."
              disabled={isLoading}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="outline-secondary"
            onClick={onHide}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {editingLesson ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              editingLesson ? 'Update Lesson' : 'Create Lesson'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
