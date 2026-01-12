import { Col, Form, Row } from "react-bootstrap";
import type { UserProfile, UserProfileUpdateRequest } from "~/types/user";

type BasicFormProps = {
  profile: UserProfile;
  handleChange: (field: keyof UserProfileUpdateRequest, value: string) => void;
};

export default function BasicForm({ profile, handleChange }: BasicFormProps) {
  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label className="fw-medium mt-3">Name</Form.Label>
        <Form.Control
          type="text"
          defaultValue={profile.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter your name"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-medium">Bio</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          defaultValue={profile.bio || ''}
          onChange={(e) => handleChange('bio', e.target.value)}
          placeholder="Tell us about yourself"
          maxLength={500}
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">Country</Form.Label>
            <Form.Control
              type="text"
              defaultValue={profile.country || ''}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="Your country"
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">Preferred Language</Form.Label>
            <Form.Control
              type="text"
              defaultValue={profile.preferredLanguage || ''}
              onChange={(e) => handleChange('preferredLanguage', e.target.value)}
              placeholder="Your preferred language"
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
}
