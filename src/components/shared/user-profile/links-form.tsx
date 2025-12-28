import { Form, InputGroup } from "react-bootstrap";
import { Github, Globe, Linkedin, TwitterX } from "react-bootstrap-icons";
import type { UserProfile, UserProfileUpdateRequest } from "~/types/user";

type LinksFormProps = {
  profile: UserProfile;
  handleChange: (field: keyof UserProfileUpdateRequest, value: string) => void;
};

export default function LinksForm({ profile, handleChange }: LinksFormProps) {
  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label className="fw-medium mt-3">Website URL</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <Globe />
          </InputGroup.Text>
          <Form.Control
            type="url"
            defaultValue={profile.websiteUrl || ''}
            onChange={(e) => handleChange('websiteUrl', e.target.value)}
            placeholder="https://your-website.com"
          />
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-medium">GitHub URL</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <Github />
          </InputGroup.Text>
          <Form.Control
            type="url"
            defaultValue={profile.githubUrl || ''}
            onChange={(e) => handleChange('githubUrl', e.target.value)}
            placeholder="https://github.com/username"
          />
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-medium">LinkedIn URL</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <Linkedin />
          </InputGroup.Text>
          <Form.Control
            type="url"
            defaultValue={profile.linkedinUrl || ''}
            onChange={(e) => handleChange('linkedinUrl', e.target.value)}
            placeholder="https://linkedin.com/in/username"
          />
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-medium">X (Twitter) URL</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <TwitterX />
          </InputGroup.Text>
          <Form.Control
            type="url"
            defaultValue={profile.xUrl || ''}
            onChange={(e) => handleChange('xUrl', e.target.value)}
            placeholder="https://x.com/username"
          />
        </InputGroup>
      </Form.Group>
    </>
  );
}
