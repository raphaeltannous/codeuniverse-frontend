import {
  Row,
  Col,
  Button,
  Spinner,
  Form,
  InputGroup,
} from "react-bootstrap";
import { Save } from "react-bootstrap-icons";
import MDEditor from "@uiw/react-md-editor";

interface FormData {
  title: string;
  slug: string;
  difficulty: string;
  description: string;
  isPublic: boolean;
  isPremium: boolean;
}

interface BasicInfoTabProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  difficultyOptions: string[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSlugGenerate: () => void;
  handleDescriptionChange: (value: string | undefined) => void;
  handleSaveClick: () => void;
  updateProblemMutationPending: boolean;
  onCancel: () => void;
}

export default function BasicInfoTab({
  formData,
  setFormData,
  difficultyOptions,
  handleInputChange,
  handleSlugGenerate,
  handleDescriptionChange,
  handleSaveClick,
  updateProblemMutationPending,
  onCancel,
}: BasicInfoTabProps) {
  return (
    <div className="p-3">
      <Form>
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
                {difficultyOptions.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isPublic: e.target.checked,
                    }))
                  }
                />
                <Form.Check
                  type="switch"
                  id="isPremium"
                  label="Premium"
                  checked={formData.isPremium}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isPremium: e.target.checked,
                    }))
                  }
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
                  height={400}
                  preview="edit"
                  visibleDragbar={false}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>
        {/* Save/Cancel buttons */}
        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
          <Button
            variant="outline-secondary"
            className="px-4"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={handleSaveClick}
            disabled={updateProblemMutationPending}
            className="px-4"
          >
            {updateProblemMutationPending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save size={18} className="me-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
}
