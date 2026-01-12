import { Activity, useState } from "react";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import type { UserProfile, UserProfileUpdateRequest } from "~/types/user";
import BasicForm from "./BasicInformationForm";
import LinksForm from "./LinksForm";

export default function ProfileEditModal({
  section,
  profile,
  onClose,
  onUpdate,
  isUpdating,
}: {
  section: string | null;
  profile: UserProfile;
  username: string;
  onClose: () => void;
  onUpdate: (data: UserProfileUpdateRequest) => Promise<void>;
  isUpdating: boolean;
}) {
  const [formData, setFormData] = useState<UserProfileUpdateRequest>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await onUpdate(formData);
      onClose();
      setFormData({});
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to update profile' });
    }
  };

  const handleChange = (field: keyof UserProfileUpdateRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const getModalTitle = () => {
    switch (section) {
      case 'basic': return 'Edit Basic Information';
      case 'links': return 'Edit Social Links';
      default: return 'Edit Profile';
    }
  };

  return (
    <Modal show={!!section} onHide={onClose} size="lg" centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">{getModalTitle()}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {errors.submit && (
            <Alert variant="danger" dismissible onClose={() => setErrors({})} className="mt-3">
              {errors.submit}
            </Alert>
          )}

          <Activity mode={section === 'basic' ? "visible" : "hidden"}>
            <BasicForm profile={profile} handleChange={handleChange} />
          </Activity>

          <Activity mode={section === 'links' ? "visible" : "hidden"}>
            <LinksForm profile={profile} handleChange={handleChange} />
          </Activity>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isUpdating}
            className="px-4"
          >
            {isUpdating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
