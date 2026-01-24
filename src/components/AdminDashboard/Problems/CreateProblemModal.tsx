import { useState } from 'react';
import {
  Modal,
  Button,
  Form,
  Spinner,
  Row,
  Col,
  InputGroup,
} from 'react-bootstrap';
import MDEditor from '@uiw/react-md-editor';
import { useNotification } from '~/hooks/useNotification';
import type { ProblemFormData, Difficulty } from '~/hooks/useAdminProblems';

interface CreateProblemModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: ProblemFormData) => void;
  isCreating: boolean;
}

export default function CreateProblemModal({
  show,
  onHide,
  onSubmit,
  isCreating,
}: CreateProblemModalProps) {
  const notification = useNotification();

  const [formData, setFormData] = useState<ProblemFormData>({
    title: '',
    slug: '',
    description: '',
    difficulty: 'Easy',
    isPremium: false,
    isPublic: false,
    hints: [],
    codeSnippets: [],
    testcases: null,
  });

  const difficultyOptions: Difficulty[] = ["Easy", "Medium", "Hard"];

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      difficulty: 'Easy',
      isPremium: false,
      isPublic: false,
      hints: [],
      codeSnippets: [],
      testcases: null,
    });
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSlugGenerate = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleDescriptionChange = (value: string | undefined) => {
    setFormData(prev => ({ ...prev, description: value || '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      notification.error('Problem title is required.');
      return;
    }

    if (!formData.slug.trim()) {
      notification.error('Problem slug is required.');
      return;
    }

    if (!formData.description.trim()) {
      notification.error('Problem description is required.');
      return;
    }

    const basicData = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      difficulty: formData.difficulty,
      isPremium: formData.isPremium,
      isPublic: formData.isPublic,
      hints: [],
      codeSnippets: [],
      testcases: null,
    };

    onSubmit(basicData);
    resetForm();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      backdrop={isCreating ? 'static' : true}
    >
      <Modal.Header closeButton={!isCreating}>
        <Modal.Title className="h4 fw-bold">
          Create New Problem
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="g-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Problem Title <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Two Sum"
                  className="py-2"
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Slug <span className="text-danger">*</span>
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    placeholder="two-sum"
                    className="py-2"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={handleSlugGenerate}
                    type="button"
                  >
                    Generate
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Difficulty <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  required
                >
                  {difficultyOptions.map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Access Settings</Form.Label>
                <div className="d-flex gap-4">
                  <Form.Check
                    type="switch"
                    id="isPublic"
                    label="Public"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  />
                  <Form.Check
                    type="switch"
                    id="isPremium"
                    label="Premium"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                  />
                </div>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Description <span className="text-danger">*</span>
                </Form.Label>
                <div>
                  <MDEditor
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    height={300}
                    preview="edit"
                    visibleDragbar={false}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={handleClose}
            className="px-4"
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="px-4"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              'Create Problem'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
