import { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Spinner,
} from 'react-bootstrap';
import CodeEditor from '~/components/Shared/CodeEditor';

interface TestCaseFormData {
  input: string;
  expected: string;
  isPublic: boolean;
}

interface EditingTestCase {
  id: number;
  input: any;
  expected: any;
  isPublic: boolean;
}

interface EditTestCaseModalProps {
  show: boolean;
  onHide: () => void;
  editingTestcase: EditingTestCase | null;
  initialValues?: TestCaseFormData;
  onSubmit: (data: { input: any; expected: any; isPublic: boolean }) => void;
  isSubmitting: boolean;
}

export default function EditTestCaseModal({
  show,
  onHide,
  editingTestcase,
  initialValues,
  onSubmit,
  isSubmitting,
}: EditTestCaseModalProps) {
  const [testcaseForm, setTestcaseForm] = useState<TestCaseFormData>({
    input: '',
    expected: '',
    isPublic: false,
  });

  const [error, setError] = useState('');

  // Update form when modal opens or editingTestcase changes
  useEffect(() => {
    if (show) {
      if (editingTestcase) {
        // Editing existing testcase
        setTestcaseForm({
          input: typeof editingTestcase.input === 'string'
            ? editingTestcase.input
            : JSON.stringify(editingTestcase.input, null, 2),
          expected: typeof editingTestcase.expected === 'string'
            ? editingTestcase.expected
            : JSON.stringify(editingTestcase.expected, null, 2),
          isPublic: editingTestcase.isPublic,
        });
      } else if (initialValues) {
        // Using template or initial values
        setTestcaseForm(initialValues);
      } else {
        // New empty testcase
        setTestcaseForm({
          input: '',
          expected: '',
          isPublic: false,
        });
      }
      setError('');
    }
  }, [show, editingTestcase, initialValues]);

  const handleTestcaseFormChange = (field: keyof TestCaseFormData, value: any) => {
    setTestcaseForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!testcaseForm.input.trim()) {
      setError('Input is required');
      return;
    }

    if (!testcaseForm.expected.trim()) {
      setError('Expected output is required');
      return;
    }

    let inputData: any;
    let expectedData: any;

    try {
      inputData = JSON.parse(testcaseForm.input);
    } catch {
      inputData = testcaseForm.input;
    }

    try {
      expectedData = JSON.parse(testcaseForm.expected);
    } catch {
      expectedData = testcaseForm.expected;
    }

    const data = {
      input: inputData,
      expected: expectedData,
      isPublic: testcaseForm.isPublic,
    };

    onSubmit(data);
  };

  const handleClose = () => {
    setError('');
    setTestcaseForm({
      input: '',
      expected: '',
      isPublic: false,
    });
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      backdrop={isSubmitting ? 'static' : true}
    >
      <Modal.Header closeButton={!isSubmitting}>
        <Modal.Title>
          {editingTestcase ? 'Edit Test Case' : 'Add Test Case'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            {error}
          </div>
        )}
        <Row className="g-3">
          <Col md={12}>
            <Form.Check
              type="switch"
              label="Public (visible to users)"
              checked={testcaseForm.isPublic}
              onChange={(e) =>
                handleTestcaseFormChange('isPublic', e.target.checked)
              }
            />
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Input (JSON)</Form.Label>
              <pre
                className="rounded"
                style={{
                  height: '200px',
                }}
              >
                <CodeEditor
                  code={testcaseForm.input}
                  language="json"
                  onCodeChange={(value) =>
                    handleTestcaseFormChange('input', value)
                  }
                  readonly={false}
                />
              </pre>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Expected Output (JSON)</Form.Label>
              <pre
                className="rounded"
                style={{
                  height: '200px',
                }}
              >
                <CodeEditor
                  code={testcaseForm.expected}
                  language="json"
                  onCodeChange={(value) =>
                    handleTestcaseFormChange('expected', value)
                  }
                  readonly={false}
                />
              </pre>
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Spinner animation="border" size="sm" />
          ) : editingTestcase ? (
            'Update Test Case'
          ) : (
            'Add Test Case'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
